"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { PublicHeader } from "@/components/public-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/empty-state";
import { useCartStore } from "@/stores/cart-store";
import { money } from "@/lib/numbers";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <main>
        <PublicHeader />
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <EmptyState icon={ShoppingBag} title="Votre panier est vide" description="Parcourez la boutique pour ajouter des articles.">
            <Button asChild>
              <Link href="/shop">Voir la boutique</Link>
            </Button>
          </EmptyState>
        </div>
      </main>
    );
  }

  return (
    <main>
      <PublicHeader />
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight">Panier</h1>
          <Button variant="ghost" size="sm" onClick={clearCart}>
            Vider le panier
          </Button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card>
            {items.map((item, i) => (
              <div key={item.productId}>
                {i > 0 && <Separator />}
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {money(item.price)} / pièce
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-10 text-center font-medium">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:text-red-600" onClick={() => removeItem(item.productId)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-right font-semibold sm:w-24">
                    {money(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </Card>

          <Card className="h-fit p-5">
            <h2 className="font-semibold">Résumé</h2>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Sous-total ({items.length} article{items.length !== 1 ? "s" : ""})</span>
                <span>{money(subtotal)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{money(subtotal)}</span>
              </div>
            </div>
            <Button className="mt-6 w-full" size="lg" asChild>
              <Link href="/checkout">Passer au paiement</Link>
            </Button>
          </Card>
        </div>
      </section>
    </main>
  );
}
