"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  ShoppingBag,
  MessageCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PublicHeader } from "@/components/public-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/empty-state";
import { useCartStore } from "@/stores/cart-store";
import { checkout } from "@/services/orders";
import { money } from "@/lib/numbers";
import { toast } from "@/hooks/use-toast";

const checkoutFormSchema = z.object({
  fullName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  phone: z.string().min(6, "Numéro de téléphone invalide"),
  address: z.string().min(6, "Adresse trop courte"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
});

type CheckoutForm = z.infer<typeof checkoutFormSchema>;

const SHOP_PHONE = "243978638104";

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState<{
    fullName: string;
    phone: string;
    address: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    total: number;
  } | null>(null);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutFormSchema),
  });

  const onSubmit = async (data: CheckoutForm) => {
    setLoading(true);
    try {
      const order = await checkout({
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        email: data.email || undefined,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      // Save details for WhatsApp message
      setOrderDetails({
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        items: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total: subtotal,
      });

      setOrderNumber(order.orderNumber);
      setSuccess(true);
      clearCart();
      toast({
        title: "Commande créée",
        description: `N° ${order.orderNumber}`,
        variant: "default",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de créer la commande. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Build WhatsApp message
  const buildWhatsAppUrl = () => {
    if (!orderDetails) return "#";

    const itemsList = orderDetails.items
      .map(
        (item) =>
          `- ${item.name} x${item.quantity} (${money(item.price * item.quantity)})`,
      )
      .join("\n");

    const message = `Bonjour BOUTIQUE KAMEGA,\n\nJe confirme ma commande *${orderNumber}*.\n\n*Nom:* ${orderDetails.fullName}\n*Téléphone:* ${orderDetails.phone}\n*Adresse:* ${orderDetails.address}\n\n*Articles:*\n${itemsList}\n\n*Total: ${money(orderDetails.total)}*\n\nMerci !`;

    return `https://wa.me/${SHOP_PHONE}?text=${encodeURIComponent(message)}`;
  };

  if (items.length === 0 && !success) {
    return (
      <main>
        <PublicHeader />
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <EmptyState
            icon={ShoppingBag}
            title="Votre panier est vide"
            description="Ajoutez des articles avant de passer commande."
          >
            <Button asChild>
              <Link href="/shop">Voir la boutique</Link>
            </Button>
          </EmptyState>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main>
        <PublicHeader />
        <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
            <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold font-display">
            Commande enregistrée !
          </h1>
          <p className="mt-3 text-zinc-500 dark:text-zinc-400">
            Votre commande{" "}
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
              {orderNumber}
            </span>{" "}
            a été enregistrée.
          </p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Commande sera confirmée via WhatsApp
          </p>

          {/* WhatsApp Confirmation Button */}
          <div className="mt-8">
            <Button
              size="lg"
              className="bg-[#25D366] text-white hover:bg-[#20BD5A] font-semibold gap-2 w-full sm:w-auto"
              asChild
            >
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-5 w-5" />
                Confirmer via WhatsApp
              </a>
            </Button>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild variant="outline">
              <Link href="/shop">Continuer mes achats</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/customer/orders">Mes commandes</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <PublicHeader />
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/cart">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Retour au panier
          </Link>
        </Button>
        <h1 className="text-3xl font-semibold tracking-tight font-display">
          Finaliser la commande
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Paiement invité — pas de compte requis
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card>
            <CardHeader>
              <CardTitle>Informations de livraison</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                id="checkout-form"
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nom complet</Label>
                  <Input
                    id="fullName"
                    {...register("fullName")}
                    placeholder="Eloge Kambale"
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-500">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register("phone")}
                    placeholder="+243 978 638 104"
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    {...register("address")}
                    placeholder="123 Rue Exemple, Butembo"
                  />
                  {errors.address && (
                    <p className="text-xs text-red-500">
                      {errors.address.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (optionnel)</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="email@exemple.com"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="font-semibold">Votre commande</h3>
              <div className="mt-4 space-y-3 text-sm">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between">
                    <span className="text-zinc-500">
                      {item.name} x{item.quantity}
                    </span>
                    <span>{money(item.price * item.quantity)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{money(subtotal)}</span>
                </div>
              </div>
            </Card>
            <Button
              type="submit"
              form="checkout-form"
              className="w-full bg-gold-400 text-zinc-900 hover:bg-gold-300"
              size="lg"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer la commande
            </Button>
            <p className="text-center text-xs text-zinc-500">
              <MessageCircle className="inline h-3.5 w-3.5 mr-1" />
              La commande sera confirmée via WhatsApp
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
