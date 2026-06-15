import { fail, ok, notFound } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validators";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!category) return notFound("Catégorie introuvable");
    return ok(category);
  } catch (error) {
    return fail(error, 500);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = categorySchema.partial().parse(await request.json());
    const category = await prisma.category.update({ where: { id }, data: payload });
    return ok(category);
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.category.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (error) {
    return fail(error);
  }
}
