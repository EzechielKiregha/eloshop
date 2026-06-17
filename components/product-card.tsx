"use client";

import Link from "next/link";
import Image from "next/image";
import { AlertCircle, MessageCircle, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { money } from "@/lib/numbers";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "@/hooks/use-toast";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const outOfStock = product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (outOfStock) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.images[0],
    });
    toast({
      title: "Ajouté au panier",
      description: product.name,
      variant: "default",
    });
  };

  return (
    <Link href={`/shop/${product.slug}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-gold hover:border-gold-400/30">
        <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-800">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-gold-400/40" />
            </div>
          )}
          {outOfStock && (
            <Badge variant="secondary" className="absolute left-3 top-3">
              Rupture de stock
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gold-500 dark:text-gold-400">
            {product.category?.name}
          </p>
          <h3 className="mt-1 font-semibold leading-tight">{product.name}</h3>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-lg font-bold text-gold-600 dark:text-gold-400">
              {money(product.price)}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="h-8 px-3"
            >
              <ShoppingBag className="mr-1 h-3.5 w-3.5" />
              Ajouter
            </Button>
          </div>
          <p className="mt-1 text-center text-xs text-zinc-500">
            <AlertCircle className="inline h-3.5 w-3.5 mr-1" />
            Une commande de 10 items et le prix de {""}
            <span className="text-sm font-medium text-gold-600 dark:text-gold-400">
              {money(product.costPrice)}
            </span>
            {""} sera appliquer sur chaque produit
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
