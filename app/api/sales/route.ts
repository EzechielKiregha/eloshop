import { fail, ok, paginated } from "@/lib/api-response";
import { money, nextBusinessNumber } from "@/lib/numbers";
import { prisma } from "@/lib/prisma";
import { createReceipt } from "@/lib/receipt";
import { saleSchema } from "@/lib/validators";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 20)));

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.sale.count(),
    ]);

    return paginated(sales, total, page, pageSize);
  } catch (error) {
    return fail(error, 500);
  }
}

export async function POST(request: Request) {
  try {
    const payload = saleSchema.parse(await request.json());

    const sale = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: payload.items.map((item) => item.productId) } },
      });
      const productMap = new Map(products.map((product) => [product.id, product]));
      let subtotal = 0;

      for (const item of payload.items) {
        const product = productMap.get(item.productId);
        if (!product) throw new Error("Produit introuvable");
        if (product.stock < item.quantity) throw new Error(`Stock insuffisant pour ${product.name}`);
        subtotal += Number(product.price) * item.quantity;
      }

      const total = Math.max(subtotal - payload.discount, 0);
      const created = await tx.sale.create({
        data: {
          saleNumber: nextBusinessNumber("VTE"),
          customerName: payload.customerName,
          subtotal,
          discount: payload.discount,
          total,
          paymentMethod: payload.paymentMethod,
          items: {
            create: payload.items.map((item) => {
              const product = productMap.get(item.productId);
              if (!product) throw new Error("Produit introuvable");
              return { productId: item.productId, quantity: item.quantity, price: product.price };
            }),
          },
        },
        include: { items: { include: { product: true } } },
      });

      for (const item of payload.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
        await tx.inventoryMovement.create({
          data: { productId: item.productId, type: "OUT", quantity: item.quantity },
        });
      }

      return created;
    });

    const receiptUrl = await createReceipt({
      number: sale.saleNumber,
      title: "Recu de vente",
      customerName: sale.customerName,
      paymentMethod: sale.paymentMethod,
      total: money(sale.total),
      items: sale.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: money(item.price),
      })),
    });

    const updated = await prisma.sale.update({ where: { id: sale.id }, data: { receiptUrl } });
    return ok(updated, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
