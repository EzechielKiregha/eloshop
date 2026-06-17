"use client";

import { useState, useMemo } from "react";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  Search,
  Package,
  Download,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { money } from "@/lib/numbers";
import { usePosStore } from "@/stores/pos-store";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useSales } from "@/hooks/useSales";
import type { PaymentMethod, Sale } from "@/lib/types";

// ─── Payment method labels ──────────────────────────────────────────
const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Espèces" },
  { value: "MOBILE_MONEY", label: "Mobile Money" },
  { value: "CARD", label: "Carte" },
  { value: "BANK_TRANSFER", label: "Virement" },
];

export default function PosPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [customerName, setCustomerName] = useState("");
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  // Store
  const {
    items,
    discount,
    addItem,
    removeItem,
    updateQuantity,
    setDiscount,
    clearSale,
  } = usePosStore();

  // Data
  const { data: productsData, isLoading: productsLoading } = useProducts({
    pageSize: 200,
  });
  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories();
  const {
    data: salesData,
    completeSale,
    generateReceipt,
  } = useSales({ pageSize: 3 });
  const recentSales: Sale[] = salesData?.data ?? [];

  const products = productsData?.data ?? [];
  const categories: Array<{ id: string; name: string; slug: string }> =
    Array.isArray(categoriesData) ? categoriesData : [];

  // ─── Filtered products ──────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let list = products;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
      );
    }
    if (categoryFilter) {
      list = list.filter((p) => p.categoryId === categoryFilter);
    }
    return list;
  }, [products, search, categoryFilter]);

  // ─── Totals ─────────────────────────────────────────────────────
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = Math.max(subtotal - discount, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  // ─── Complete sale ──────────────────────────────────────────────
  async function handleCompleteSale() {
    if (items.length === 0) {
      toast({
        title: "Panier vide",
        description: "Ajoutez des articles avant de finaliser.",
        variant: "destructive",
      });
      return;
    }

    completeSale.mutate(
      {
        customerName: customerName.trim() || undefined,
        discount: discount > 0 ? discount : undefined,
        paymentMethod,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      },
      {
        onSuccess: (sale) => {
          toast({
            title: "Vente finalisée !",
            description: `Vente ${sale.saleNumber} — ${money(sale.total)}`,
          });
          clearSale();
          setCustomerName("");
          setPaymentMethod("CASH");
          setMobileCartOpen(false);
        },
        onError: () => {
          toast({
            title: "Erreur",
            description: "Impossible de finaliser la vente. Réessayez.",
            variant: "destructive",
          });
        },
      },
    );
  }

  // ─── Cart content (shared between desktop sidebar and mobile sheet) ─
  const cartContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-1 pb-4">
        <h2 className="text-lg font-semibold">Vente en cours</h2>
        {items.length > 0 && (
          <Badge variant="secondary">
            {itemCount} article{itemCount > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-zinc-400">
          <ShoppingCart className="h-12 w-12 stroke-1" />
          <p className="text-sm">Aucun article dans le panier</p>
        </div>
      ) : (
        <>
          <ScrollArea className="flex-1 -mx-1 px-1">
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between gap-3 rounded-xl border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-zinc-500">
                      {money(item.price)} x {item.quantity}
                    </p>
                    <p className="text-sm font-semibold">
                      {money(item.price * item.quantity)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      className="grid size-7 place-items-center rounded-full border transition-colors hover:bg-zinc-100"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      className="grid size-7 place-items-center rounded-full border transition-colors hover:bg-zinc-100"
                    >
                      <Plus className="size-3" />
                    </button>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="grid size-7 place-items-center rounded-full text-red-500 transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="mt-4 space-y-4">
            <Separator />

            {/* Discount */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">
                Remise ($)
              </label>
              <Input
                type="number"
                min={0}
                placeholder="0"
                value={discount || ""}
                onChange={(e) => setDiscount(Number(e.target.value))}
              />
            </div>

            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Sous-total</span>
                <span className="font-medium">{money(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Remise</span>
                  <span>-{money(discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{money(total)}</span>
              </div>
            </div>

            <Separator />

            {/* Payment method */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">
                Mode de paiement
              </label>
              <Select
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Customer name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">
                Nom du client (optionnel)
              </label>
              <Input
                placeholder="Ex: Jean Mutombo"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            {/* Submit */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleCompleteSale}
              disabled={items.length === 0 || completeSale.isPending}
            >
              {completeSale.isPending ? "Traitement..." : "Finaliser la vente"}
            </Button>
          </div>
        </>
      )}

      {/* Recent Sales */}
      {recentSales.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-sm font-semibold text-zinc-500 mb-3">
            Dernières ventes
          </h3>
          <div className="space-y-2">
            {recentSales.map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between gap-2 rounded-lg border p-2.5 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{sale.saleNumber}</p>
                  <p className="text-zinc-400">
                    {new Date(sale.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className="font-semibold shrink-0">
                  {money(sale.total)}
                </span>
                {sale.receiptUrl && sale.receiptUrl.startsWith("http") ? (
                  <a
                    href={sale.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Download className="size-3" />
                    Reçu
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      generateReceipt.mutate(sale.id, {
                        onSuccess: () => toast({ title: "Reçu généré" }),
                        onError: () =>
                          toast({ title: "Erreur", variant: "destructive" }),
                      });
                    }}
                    disabled={generateReceipt.isPending}
                    className="shrink-0 inline-flex items-center gap-1 rounded-md border border-gold-400/50 px-2 py-1 text-[10px] font-medium text-gold-600 hover:bg-gold-50 dark:text-gold-400 dark:hover:bg-gold-950/20 transition-colors"
                  >
                    {generateReceipt.isPending ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <FileText className="size-3" />
                    )}
                    Générer
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div
      className="-mx-4 -mt-6 sm:-mx-6 lg:-mx-8 flex flex-col"
      style={{ height: "calc(100vh - 4rem)" }}
    >
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left: Product Catalog ──────────────────────────────── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <div className="border-b border-gold-400/15 bg-white px-4 py-4 dark:bg-zinc-950 sm:px-6">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight">Caisse</h1>
              <Badge variant="outline" className="hidden sm:inline-flex">
                {filteredProducts.length} produit
                {filteredProducts.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            {/* Search */}
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Rechercher un produit..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Category filters */}
            {!categoriesLoading && categories.length > 0 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                <Button
                  variant={categoryFilter === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter(null)}
                  className="shrink-0"
                >
                  Tous
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={categoryFilter === cat.id ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setCategoryFilter(
                        categoryFilter === cat.id ? null : cat.id,
                      )
                    }
                    className="shrink-0"
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Product grid */}
          <ScrollArea className="flex-1">
            <div className="p-4 sm:p-6">
              {productsLoading ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-20 text-zinc-400">
                  <Package className="h-12 w-12 stroke-1" />
                  <p className="text-sm">Aucun produit trouvé</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((product) => {
                    const outOfStock = product.stock <= 0;
                    const inCart = items.find(
                      (i) => i.productId === product.id,
                    );
                    return (
                      <Card
                        key={product.id}
                        className={`relative cursor-pointer select-none p-4 transition-all ${
                          outOfStock
                            ? "cursor-not-allowed opacity-50"
                            : "hover:border-gold-400/40 hover:shadow-gold active:scale-[0.98]"
                        } ${inCart ? "ring-2 ring-gold-400" : ""}`}
                        onClick={() => {
                          if (outOfStock) return;
                          addItem({
                            productId: product.id,
                            name: product.name,
                            price: product.price,
                          });
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">
                              {product.name}
                            </p>
                            <p className="mt-1 text-lg font-bold">
                              {money(product.price)}
                            </p>
                          </div>
                          {inCart && (
                            <Badge className="shrink-0">
                              {inCart.quantity}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-3">
                          {outOfStock ? (
                            <Badge variant="destructive" className="text-xs">
                              Rupture de stock
                            </Badge>
                          ) : product.stock <= 5 ? (
                            <Badge variant="secondary" className="text-xs">
                              {product.stock} en stock
                            </Badge>
                          ) : (
                            <span className="text-xs text-zinc-400">
                              {product.stock} en stock
                            </span>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* ── Right: Cart (desktop) ────────────────────────────── */}
        <aside className="hidden w-[400px] shrink-0 border-l border-gold-400/15 bg-white p-5 dark:bg-zinc-950 lg:flex lg:flex-col">
          {cartContent}
        </aside>
      </div>

      {/* ── Mobile: Floating cart button + Sheet ──────────────── */}
      <div className="lg:hidden">
        <Sheet open={mobileCartOpen} onOpenChange={setMobileCartOpen}>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="fixed bottom-6 right-6 z-50 h-14 gap-2 rounded-full px-6 shadow-lg"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span>
                  {itemCount} — {money(total)}
                </span>
              )}
              {itemCount === 0 && <span>Panier</span>}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-5">
            <SheetHeader className="sr-only">
              <SheetTitle>Panier</SheetTitle>
            </SheetHeader>
            {cartContent}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
