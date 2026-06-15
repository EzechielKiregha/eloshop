import { fail, ok, paginated } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validators";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 20)));

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        include: { _count: { select: { products: true } } },
        orderBy: { name: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.category.count(),
    ]);

    return paginated(categories, total, page, pageSize);
  } catch (error) {
    return fail(error, 500);
  }
}

export async function POST(request: Request) {
  try {
    const payload = categorySchema.parse(await request.json());
    const category = await prisma.category.create({ data: payload });
    return ok(category, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
