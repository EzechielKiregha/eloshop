import { fail, ok, paginated, notFound } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validators";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? undefined;
    const category = searchParams.get("category") ?? undefined;
    const categoryId = searchParams.get("categoryId") ?? undefined;
    const slug = searchParams.get("slug") ?? undefined;
    const sort = searchParams.get("sort") ?? undefined;
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 20)));

    // Single product by slug
    if (slug) {
      const product = await prisma.product.findUnique({
        where: { slug },
        include: { category: true },
      });
      if (!product) return notFound("Produit introuvable");
      return ok(product);
    }

    const where = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" as const } },
                { description: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {},
        category ? { category: { slug: category } } : {},
        categoryId ? { categoryId } : {},
      ],
    };

    const orderBy = (() => {
      switch (sort) {
        case "price_asc":
          return { price: "asc" as const };
        case "price_desc":
          return { price: "desc" as const };
        case "name_asc":
          return { name: "asc" as const };
        case "name_desc":
          return { name: "desc" as const };
        default:
          return { createdAt: "desc" as const };
      }
    })();

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    return paginated(products, total, page, pageSize);
  } catch (error) {
    return fail(error, 500);
  }
}

export async function POST(request: Request) {
  try {
    const payload = productSchema.parse(await request.json());
    const product = await prisma.product.create({ data: payload });
    return ok(product, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
