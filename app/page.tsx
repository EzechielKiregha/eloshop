import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingBag, Store, Package, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/public-header";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";

const features = [
  { icon: ShoppingBag, title: "Large catalogue", text: "Vetements, chaussures et accessoires selectionnes avec soin pour un style premium." },
  { icon: Store, title: "Boutique & en ligne", text: "Achetez en magasin ou commandez en ligne, nous livrons partout." },
  { icon: Package, title: "Stock en temps reel", text: "Disponibilite mise a jour en continu entre la boutique et le site." },
  { icon: Truck, title: "Livraison rapide", text: "Commandez en ligne et recevez votre colis dans les meilleurs delais." },
];

export default async function Home() {
  const products = await prisma.product.findMany({
    take: 4,
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  const categories = await prisma.category.findMany({ take: 6 });
  const productCount = await prisma.product.count();

  return (
    <main>
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid min-h-[calc(100vh-65px)] max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-5 inline-flex rounded-full border bg-white px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm dark:bg-zinc-900 dark:text-zinc-400">
              Clothes &bull; Shoes &bull; Accessories
            </p>
            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              KAMEGA Shop
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Votre destination mode pour des vetements, chaussures et accessoires de qualite. Un style premium, accessible en boutique et en ligne.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/shop">Decouvrir la boutique <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/register">Creer un compte</Link>
              </Button>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative hidden min-h-[520px] lg:flex lg:items-center lg:justify-center">
            <div className="absolute inset-0 rounded-[2rem] border bg-white shadow-soft dark:bg-zinc-900" />
            <div className="absolute inset-6 rounded-[1.5rem] bg-gradient-to-br from-zinc-950 via-zinc-800 to-zinc-500" />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <Image
                src="/logo.png"
                alt="KAMEGA Shop"
                width={200}
                height={200}
                className="rounded-2xl bg-white/90 p-4 shadow-lg backdrop-blur dark:bg-zinc-900/90"
                priority
              />
            </div>
            <div className="absolute bottom-10 left-10 right-10 rounded-2xl border border-white/20 bg-white/90 p-5 shadow-soft backdrop-blur dark:bg-zinc-900/90">
              <p className="text-sm font-medium text-zinc-500">Collection actuelle</p>
              <div className="mt-3 flex items-end justify-between gap-6">
                <div>
                  <p className="text-3xl font-semibold">{productCount} articles</p>
                  <p className="mt-1 text-sm text-zinc-500">Disponibles en boutique et en ligne</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features / About */}
      <section className="border-y bg-white py-16 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">Pourquoi KAMEGA Shop ?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
              Nous selectionnons des pieces modernes et intemporelles pour hommes et femmes. Mode, qualite et service au meilleur prix.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border bg-zinc-50 p-5 dark:bg-zinc-950">
                <f.icon className="h-5 w-5" />
                <h3 className="mt-5 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold tracking-tight">Nos categories</h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Explorez notre selection par categorie</p>
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
              <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Selection</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Nouveautes</h2>
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
      <footer className="border-t bg-zinc-950 py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Image
                src="/logo-dark.png"
                alt="KAMEGA Shop"
                width={140}
                height={45}
                className="h-10 w-auto"
              />
              <p className="mt-4 max-w-xs text-sm leading-6 text-zinc-400">
                Vetements, chaussures et accessoires de qualite. Votre style, notre passion.
              </p>
            </div>

            {/* Boutique links */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Boutique</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="/shop" className="text-sm text-zinc-300 hover:text-white transition">Tous les produits</Link></li>
                {categories.slice(0, 4).map((cat) => (
                  <li key={cat.id}><Link href={`/shop?category=${cat.slug}`} className="text-sm text-zinc-300 hover:text-white transition">{cat.name}</Link></li>
                ))}
              </ul>
            </div>

            {/* Account links */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Mon compte</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="/login" className="text-sm text-zinc-300 hover:text-white transition">Se connecter</Link></li>
                <li><Link href="/register" className="text-sm text-zinc-300 hover:text-white transition">Creer un compte</Link></li>
                <li><Link href="/customer" className="text-sm text-zinc-300 hover:text-white transition">Mes commandes</Link></li>
                <li><Link href="/cart" className="text-sm text-zinc-300 hover:text-white transition">Panier</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Contact</h3>
              <ul className="mt-4 space-y-3">
                <li className="text-sm text-zinc-400">KAMEGA Shop</li>
                <li className="text-sm text-zinc-400">Clothes &bull; Shoes &bull; Accessories</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-zinc-800 pt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-zinc-500">&copy; {new Date().getFullYear()} KAMEGA Shop. Tous droits reserves.</p>
            <p className="text-xs text-zinc-500">Propulse par Next.js</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
