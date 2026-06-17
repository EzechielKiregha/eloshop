import { fail, ok, notFound } from "@/lib/api-response";
import { money } from "@/lib/numbers";
import { prisma } from "@/lib/prisma";
import { createReceipt } from "@/lib/receipt";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });

    if (!sale) return notFound("Vente introuvable");

    if (sale.receiptUrl && sale.receiptUrl.startsWith('http')) {
      return ok({ receiptUrl: sale.receiptUrl });
    }

    const receiptUrl = await createReceipt({
      number: sale.saleNumber,
      title: "Reçu de vente",
      customerName: sale.customerName,
      paymentMethod: sale.paymentMethod,
      discount: Number(sale.discount),
      subtotal: money(sale.subtotal),
      total: money(sale.total),
      items: sale.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: money(item.price),
      })),
    });

    const updated = await prisma.sale.update({
      where: { id },
      data: { receiptUrl },
      include: { items: { include: { product: true } } },
    });

    return ok(updated, { status: 201 });
  } catch (error) {
    console.error(error)
    return fail(error, 500);
  }
}
