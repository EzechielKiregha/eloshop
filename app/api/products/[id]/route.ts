import { fail, ok, notFound } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validators";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) return notFound("Produit introuvable");
    return ok(product);
  } catch (error) {
    return fail(error, 500);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = productSchema.partial().parse(await request.json());
    const product = await prisma.product.update({ where: { id }, data: payload });
    return ok(product);
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (error) {
    return fail(error);
  }
}
