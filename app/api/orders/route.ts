import { fail, ok, paginated } from "@/lib/api-response";
import { money, nextBusinessNumber } from "@/lib/numbers";
import { prisma } from "@/lib/prisma";
import { createReceipt } from "@/lib/receipt";
import { checkoutSchema } from "@/lib/validators";
import { hash } from "bcryptjs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone") ?? undefined;
    const status = searchParams.get("status") ?? undefined;
    const search = searchParams.get("search") ?? undefined;
    const customerId = searchParams.get("customerId") ?? undefined;
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 20)));

    const where = {
      AND: [
        phone ? { customer: { phone } } : {},
        status ? { status: status as never } : {},
        customerId ? { customerId } : {},
        search
          ? {
              OR: [
                { orderNumber: { contains: search, mode: "insensitive" as const } },
                { customer: { name: { contains: search, mode: "insensitive" as const } } },
                { customer: { phone: { contains: search, mode: "insensitive" as const } } },
              ],
            }
          : {},
      ],
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { customer: true, items: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.order.count({ where }),
    ]);

    return paginated(orders, total, page, pageSize);
  } catch (error) {
    return fail(error, 500);
  }
}

export async function POST(request: Request) {
  try {
    const payload = checkoutSchema.parse(await request.json());

    const order = await prisma.$transaction(async (tx) => {
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

      const emailSpltted = `${payload.email?.split('@')[0]}@pass`

      const hashedPassword = await hash(emailSpltted!, 12);

      const customer = await tx.user.upsert({
        where: { phone: payload.phone },
        update: {
          name: payload.fullName,
          email: payload.email || null,
        },
        create: {
          name: payload.fullName,
          phone: payload.phone,
          email: payload.email || null,
          password: hashedPassword,
          role: "CUSTOMER",
        },
      });

      const created = await tx.order.create({
        data: {
          orderNumber: nextBusinessNumber("CMD"),
          customerId: customer.id,
          subtotal,
          total: subtotal,
          items: {
            create: payload.items.map((item) => {
              const product = productMap.get(item.productId);
              if (!product) throw new Error("Produit introuvable");
              return { productId: item.productId, quantity: item.quantity, price: product.price };
            }),
          },
        },
        include: { customer: true, items: { include: { product: true } } },
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
      number: order.orderNumber,
      title: "Recu de commande",
      customerName: order.customer.name,
      total: money(order.total),
      items: order.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: money(item.price),
      })),
    });

    const updated = await prisma.order.update({ where: { id: order.id }, data: { receiptUrl } });
    return ok(updated, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
