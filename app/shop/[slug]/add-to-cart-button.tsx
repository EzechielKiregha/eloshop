"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Minus, Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "@/hooks/use-toast";

interface Props {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image?: string;
    stock: number;
  };
}

export function AddToCartButton({ product }: Props) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();
  const outOfStock = product.stock <= 0;

  const handleAdd = () => {
    addItem(
      { productId: product.id, name: product.name, price: product.price, image: product.image },
      quantity
    );
    toast({ title: "Ajouté au panier", description: `${quantity}x ${product.name}` });
  };

  const handleBuyNow = () => {
    handleAdd();
    router.push("/checkout");
  };

  return (
    <div className="mt-8 space-y-4">
      {/* Quantity selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Quantité</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-10 text-center font-medium">{quantity}</span>
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={handleAdd} disabled={outOfStock}>
          <ShoppingBag className="mr-2 h-4 w-4" />
          Ajouter au panier
        </Button>
        <Button size="lg" variant="outline" onClick={handleBuyNow} disabled={outOfStock}>
          <Zap className="mr-2 h-4 w-4" />
          Acheter maintenant
        </Button>
      </div>
    </div>
  );
}
