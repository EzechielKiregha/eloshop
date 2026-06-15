import { fail, paginated } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 20)));

    const [movements, total] = await Promise.all([
      prisma.inventoryMovement.findMany({
        include: { product: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.inventoryMovement.count(),
    ]);

    return paginated(movements, total, page, pageSize);
  } catch (error) {
    return fail(error, 500);
  }
}
