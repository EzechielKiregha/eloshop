import { notFound } from "next/navigation";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/public-header";
import { money } from "@/lib/numbers";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "./add-to-cart-button";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product) notFound();

  const price = Number(product.price);
  const outOfStock = product.stock <= 0;

  return (
    <main>
      <PublicHeader />
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-gold-400/15 bg-zinc-100 shadow-gold dark:bg-zinc-800">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ShoppingBag className="h-24 w-24 text-gold-400/30" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-500 dark:text-gold-400">
            {product.category.name}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-5 text-3xl font-bold text-gold-600 dark:text-gold-400">{money(price)}</p>
          <p className="mt-5 max-w-xl leading-7 text-zinc-600 dark:text-zinc-400">
            {product.description}
          </p>

          {/* Stock */}
          <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Stock disponible</p>
                <p className="mt-1 text-sm text-zinc-500">{product.stock} pièce{product.stock !== 1 ? "s" : ""} en stock</p>
              </div>
              {outOfStock ? (
                <Badge variant="destructive">Rupture</Badge>
              ) : product.stock <= 5 ? (
                <Badge variant="warning">Stock faible</Badge>
              ) : (
                <Badge variant="success">En stock</Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <AddToCartButton
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              price,
              image: product.images[0],
              stock: product.stock,
            }}
          />
        </div>
      </section>
    </main>
  );
}
