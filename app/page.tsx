"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ShoppingBag,
  Store,
  Package,
  Truck,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Facebook,
  Instagram,
  LayoutDashboard,
  User,
  LogOut,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/public-header";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";
import { signOut, useSession } from "next-auth/react";
import { getCategories, getProductCount, getProducts } from "./get-helpers";
import { use } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";

const features = [
  {
    icon: ShoppingBag,
    title: "Large catalogue",
    text: "Vêtements, chaussures et accessoires sélectionnés avec soin pour un style premium.",
  },
  {
    icon: Store,
    title: "Boutique & en ligne",
    text: "Achetez en magasin ou commandez en ligne, nous livrons partout.",
  },
  {
    icon: Package,
    title: "Stock en temps réel",
    text: "Disponibilité mise à jour en continu entre la boutique et le site.",
  },
  {
    icon: Truck,
    title: "Livraison rapide",
    text: "Commandez en ligne et recevez votre colis dans les meilleurs délais.",
  },
];

export default function Home() {
  const { data: session } = useSession();

  // const products = use(getProducts());
  const { data: productsData, isLoading } = useProducts({
    pageSize: 4,
  });
  // const categories = use(getCategories());
  const { data: categories } = useCategories();
  const products = productsData?.data ?? [];
  const productCount = products.length;

  return (
    <main>
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-white dark:bg-zinc-950">
        {/* Light mode: subtle warm gradient / Dark mode: dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 via-white to-gold-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800" />
        {/* Subtle gold accent lines */}
        <div className="absolute inset-0 opacity-20 dark:opacity-10">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid min-h-[500px] items-center gap-8 lg:grid-cols-[1fr_1fr]">
            {/* Left content */}
            <div className="text-center lg:text-left">
              <div className="mb-6 flex justify-center lg:justify-start">
                <Image
                  src="/new-logo.png"
                  alt="BOUTIQUE KAMEGA"
                  width={140}
                  height={140}
                  className="h-28 w-28 rounded-full border-2 border-gold-400/40 shadow-gold"
                  priority
                />
              </div>

              <h1 className="font-display text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
                <span className="text-gold-gradient">BOUTIQUE</span>
                <br />
                <span className="text-zinc-900 dark:text-white">KAMEGA</span>
              </h1>

              <div className="mt-4 flex items-center justify-center gap-3 lg:justify-start">
                <span className="h-px w-8 bg-gold-400/60" />
                <p className="font-display text-sm tracking-[0.2em] text-gold-500 dark:text-gold-400">
                  Style &bull; Élégance &bull; Qualité
                </p>
                <span className="h-px w-8 bg-gold-400/60" />
              </div>

              <p className="mt-2 text-sm font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Habillement Mixte — Homme &amp; Femme
              </p>

              <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-zinc-600 dark:text-zinc-400 lg:mx-0">
                Habillez votre style, affirmez votre personnalité. Votre
                destination mode à Butembo pour des vêtements, chaussures et
                accessoires de qualité.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                <Button size="lg" asChild>
                  <Link href="/shop">
                    Découvrir la boutique{" "}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gold-400/40 text-gold-600 hover:bg-gold-50 dark:text-gold-400 dark:hover:bg-gold-400/10"
                  asChild
                >
                  <a
                    href="https://wa.me/243978638104?text=Bonjour%20BOUTIQUE%20KAMEGA%2C%20je%20souhaite%20passer%20une%20commande."
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Commander via WhatsApp
                  </a>
                </Button>
              </div>

              {/* Nouvelle Collection badge */}
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-gold-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-gold-600 dark:text-gold-400">
                  Nouvelle Collection Disponible
                </span>
              </div>
            </div>

            {/* Right: Hero image / visual */}
            <div className="relative hidden lg:block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-gold-400/20 shadow-gold">
                <Image
                  src="/real-hero.jpg"
                  alt="BOUTIQUE KAMEGA - Habillement Mixte"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 to-transparent" />
              </div>
              {/* Stats overlay */}
              <div className="absolute -bottom-4 left-6 right-6 rounded-xl border border-gold-400/20 bg-white/90 p-4 shadow-gold backdrop-blur dark:bg-zinc-900/90">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-500">Collection actuelle</p>
                    <p className="mt-1 text-2xl font-semibold font-display text-zinc-900 dark:text-white">
                      {productCount}{" "}
                      <span className="text-sm text-zinc-400">articles</span>
                    </p>
                  </div>
                  <div className="h-10 w-px bg-gold-400/20" />
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">Disponible</p>
                    <p className="mt-1 text-sm font-medium text-gold-500 dark:text-gold-400">
                      Boutique &amp; En ligne
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom info bar */}
          <div className="mt-16 grid grid-cols-2 gap-4 border-t border-gold-400/15 pt-8 sm:grid-cols-4 lg:grid-cols-5">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <Truck className="h-4 w-4 text-gold-500 dark:text-gold-400 shrink-0" />
              <div>
                <p className="text-[11px] font-semibold uppercase text-gold-500 dark:text-gold-400">
                  Livraison
                </p>
                <p className="text-xs">Disponible</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <MessageCircle className="h-4 w-4 text-gold-500 dark:text-gold-400 shrink-0" />
              <div>
                <p className="text-[11px] font-semibold uppercase text-gold-500 dark:text-gold-400">
                  Commandes
                </p>
                <p className="text-xs">Via WhatsApp</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <Phone className="h-4 w-4 text-gold-500 dark:text-gold-400 shrink-0" />
              <div>
                <p className="text-[11px] font-semibold uppercase text-gold-500 dark:text-gold-400">
                  Téléphone
                </p>
                <p className="text-xs">+243 978 638 104</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <MapPin className="h-4 w-4 text-gold-500 dark:text-gold-400 shrink-0" />
              <div>
                <p className="text-[11px] font-semibold uppercase text-gold-500 dark:text-gold-400">
                  Butembo
                </p>
                <p className="text-xs">Nord-Kivu, RDC</p>
              </div>
            </div>
            <div className="hidden items-center gap-2 text-zinc-500 dark:text-zinc-400 lg:flex">
              <Store className="h-4 w-4 text-gold-500 dark:text-gold-400 shrink-0" />
              <div>
                <p className="text-[11px] font-semibold uppercase text-gold-500 dark:text-gold-400">
                  En magasin
                </p>
                <p className="text-xs">Visitez-nous</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features / About */}
      <section className="border-y border-gold-400/10 bg-white py-16 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-gold-gradient">
              Pourquoi BOUTIQUE KAMEGA ?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
              Nous sélectionnons des pièces modernes et intemporelles pour
              hommes et femmes. Mode, qualité et service au meilleur prix.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-gold-400/10 bg-zinc-50 p-5 transition-shadow hover:shadow-gold dark:bg-zinc-950"
              >
                <f.icon className="h-5 w-5 text-gold-400" />
                <h3 className="mt-5 font-semibold font-display">{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {f.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories && categories?.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold tracking-tight">
              Nos catégories
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Explorez notre sélection par catégorie
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {categories?.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className="group relative overflow-hidden rounded-2xl border border-gold-400/10 bg-white transition-all hover:shadow-gold hover:border-gold-400/30 dark:bg-zinc-900"
                >
                  {cat.image ? (
                    <div className="relative aspect-square">
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent" />
                      <p className="absolute bottom-3 left-3 right-3 text-center text-sm font-semibold font-display text-white">
                        {cat.name}
                      </p>
                    </div>
                  ) : (
                    <div className="flex aspect-square flex-col items-center justify-center gap-2 p-4">
                      <ShoppingBag className="h-8 w-8 text-gold-400/60" />
                      <p className="text-center text-sm font-semibold font-display">
                        {cat.name}
                      </p>
                    </div>
                  )}
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
              <p className="text-sm font-semibold uppercase tracking-widest text-gold-500">
                Sélection
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Nouveautés
              </h2>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/shop">
                Tout voir <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(products as unknown as Product[]).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Location Map */}
      <section className="border-t bg-zinc-50 py-16 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              <MapPin className="mr-2 inline-block h-6 w-6 text-gold-400" />
              Nous trouver
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              BOUTIQUE KAMEGA — Butembo, Nord-Kivu, République Démocratique du
              Congo
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gold-400/10">
            <iframe
              title="BOUTIQUE KAMEGA - Butembo"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63834.03!2d29.27!3d0.14!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x176d6e4c0e0e4b3b%3A0x5c7a7a7a7a7a7a7a!2sButembo!5e0!3m2!1sfr!2scd!4v1"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gold-400/10 bg-zinc-950 py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Image
                src="/new-logo.png"
                alt="BOUTIQUE KAMEGA"
                width={140}
                height={140}
                className="h-20 w-20 rounded-full border border-gold-400/30"
              />
              <h3 className="mt-4 font-display text-lg font-semibold text-gold-400">
                BOUTIQUE KAMEGA
              </h3>
              <p className="mt-2 max-w-xs text-sm leading-6 text-zinc-400">
                Habillement Mixte — Style, Élégance, Qualité. Vêtements,
                chaussures et accessoires de qualité à Butembo.
              </p>
            </div>

            {/* Boutique links */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-400/80">
                Boutique
              </h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link
                    href="/shop"
                    className="text-sm text-zinc-300 hover:text-gold-400 transition"
                  >
                    Tous les produits
                  </Link>
                </li>
                {categories?.slice(0, 4).map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/shop?category=${cat.slug}`}
                      className="text-sm text-zinc-300 hover:text-gold-400 transition"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account links */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-400/80">
                Mon compte
              </h3>
              <ul className="mt-4 space-y-3">
                {session ? (
                  <>
                    {session.user.role === "ADMIN" && (
                      <li>
                        <Link
                          href="/admin"
                          className="dark:hover:text-gold-500 flex flex-row gap-1"
                        >
                          <LayoutDashboard className="mr-1 h-4 w-4 text-gold-500" />
                          Admin
                        </Link>
                      </li>
                    )}
                    {session.user.role === "CUSTOMER" && (
                      <li>
                        <Link
                          href="/customer"
                          className="dark:hover:text-gold-500 flex flex-row gap-1"
                        >
                          <User className="mr-1 h-4 w-4 text-gold-500 dark:hover:text-gold-500" />
                          {session.user.name?.split(" ")[0]}
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link
                        href="/customer"
                        className="text-sm text-zinc-300 hover:text-gold-400 transition"
                      >
                        Mes commandes
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/cart"
                        className="text-sm text-zinc-300 hover:text-gold-400 transition"
                      >
                        Panier
                      </Link>
                    </li>
                    <li>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex text-gold-500 dark:hover:text-gold-500"
                      >
                        <LogOut className="h-4 w-4" />
                        Se Deconnecter
                      </Button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link
                        href="/login"
                        className="text-sm text-zinc-300 hover:text-gold-400 transition"
                      >
                        Se connecter
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/register"
                        className="text-sm text-zinc-300 hover:text-gold-400 transition"
                      >
                        Créer un compte
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-400/80">
                Contact
              </h3>
              <ul className="mt-4 space-y-3">
                <li className="text-sm text-zinc-400 flex flex-row gap-2">
                  <Phone className="h-4 w-4 text-gold-400" />
                  +243 978 638 104
                </li>
                <li className="text-sm text-zinc-400 flex flex-row gap-2">
                  <MapPin className="h-4 w-4 text-gold-400" />
                  Butembo, Nord-Kivu, RDC
                </li>
                <li className="text-sm text-zinc-400 flex flex-row gap-2">
                  <Mail className="h-4 w-4 text-gold-400" />{" "}
                  kamega.boutique@gmail.com
                </li>
                <li>
                  <a
                    href="https://wa.me/243978638104"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-gold-400 hover:text-gold-300 transition"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                </li>
                <li>
                  <a
                    href="https://wa.me/243978638104"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-gold-400 hover:text-gold-300 transition"
                  >
                    <Facebook className="h-4 w-4" />
                    Boutique Kamega
                  </a>
                </li>
                <li>
                  <a
                    href="https://wa.me/243978638104"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-gold-400 hover:text-gold-300 transition"
                  >
                    <Instagram className="h-4 w-4" />
                    Boutique Kamega
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-zinc-800 pt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-zinc-500">
              &copy; {new Date().getFullYear()} BOUTIQUE KAMEGA. Tous droits
              réservés.
            </p>
            <p className="text-xs text-zinc-500">Propulsé par KIREGHA CORP</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
