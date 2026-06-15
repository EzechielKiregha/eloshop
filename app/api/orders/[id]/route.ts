import { fail, ok, notFound } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { orderStatusSchema } from "@/lib/validators";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { customer: true, items: { include: { product: true } } },
    });
    if (!order) return notFound("Commande introuvable");
    return ok(order);
  } catch (error) {
    return fail(error, 500);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = orderStatusSchema.parse(await request.json());
    const order = await prisma.order.update({ where: { id }, data: payload });
    return ok(order);
  } catch (error) {
    return fail(error);
  }
}
