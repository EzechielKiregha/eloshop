import Link from "next/link";
import { ArrowRight, ShoppingBag, Store, Package, BarChart3 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/public-header";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";

const features = [
  { icon: ShoppingBag, title: "Boutique en ligne", text: "Catalogue complet avec recherche, filtres et panier persistant." },
  { icon: Store, title: "Point de vente", text: "Caisse rapide pour vente en magasin avec reçus automatiques." },
  { icon: Package, title: "Inventaire unifié", text: "Stock synchronisé entre vente en ligne et caisse physique." },
  { icon: BarChart3, title: "Tableau de bord", text: "Analyses des ventes, commandes et performances en temps réel." },
];

export default async function Home() {
  const products = await prisma.product.findMany({
    take: 4,
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  const categories = await prisma.category.findMany({ take: 4 });
  const productCount = await prisma.product.count();

  return (
    <main>
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid min-h-[calc(100vh-65px)] max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-5 inline-flex rounded-full border bg-white px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm dark:bg-zinc-900 dark:text-zinc-400">
              Boutique, caisse et inventaire en français
            </p>
            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              Elo&apos;Shop
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Une plateforme de vente moderne pour vêtements et chaussures, pensée pour une boutique premium qui vend en ligne et en magasin.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/shop">Voir la boutique <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/admin">Tableau de bord</Link>
              </Button>
            </div>
          </div>
          <div className="relative hidden min-h-[520px] lg:block">
            <div className="absolute inset-0 rounded-[2rem] border bg-white shadow-soft dark:bg-zinc-900" />
            <div className="absolute inset-6 rounded-[1.5rem] bg-gradient-to-br from-zinc-950 via-zinc-800 to-zinc-500" />
            <div className="absolute bottom-10 left-10 right-10 rounded-2xl border border-white/20 bg-white/90 p-5 shadow-soft backdrop-blur dark:bg-zinc-900/90">
              <p className="text-sm font-medium text-zinc-500">Collection actuelle</p>
              <div className="mt-4 flex items-end justify-between gap-6">
                <div>
                  <p className="text-3xl font-semibold">{productCount} articles</p>
                  <p className="mt-1 text-sm text-zinc-500">Stock synchronisé boutique et caisse</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y bg-white py-16 dark:bg-zinc-900">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border bg-zinc-50 p-5 dark:bg-zinc-950">
              <f.icon className="h-5 w-5" />
              <h3 className="mt-5 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold tracking-tight">Catégories</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className="rounded-2xl border bg-white px-6 py-4 font-medium transition-shadow hover:shadow-soft dark:bg-zinc-900"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="border-t pb-20 pt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Sélection</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Nouveautés</h2>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/shop">Tout voir <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(products as unknown as Product[]).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-zinc-950 py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="font-semibold">Elo&apos;Shop</p>
          <p className="text-zinc-400">Interface française pour vente, caisse et gestion.</p>
        </div>
      </footer>
    </main>
  );
}
