"use client";

import { useState } from "react";
import { useInventory, useInventoryMovements } from "@/hooks/useInventory";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/empty-state";
import { Package, ChevronLeft, ChevronRight } from "lucide-react";

function stockBadge(stock: number) {
  if (stock === 0) return <Badge variant="destructive">Rupture</Badge>;
  if (stock < 10) return <Badge variant="warning">Faible ({stock})</Badge>;
  return <Badge variant="success">OK ({stock})</Badge>;
}

function ProductTable({ products, isLoading, emptyMessage }: {
  products: { id: string; name: string; sku: string; stock: number }[];
  isLoading: boolean;
  emptyMessage: string;
}) {
  if (isLoading) {
    return (
      <Card className="rounded-2xl border p-5">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Aucun produit"
        description={emptyMessage}
      />
    );
  }

  return (
    <Card className="rounded-2xl border p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-zinc-500">
              <th className="px-5 py-3 font-medium">Produit</th>
              <th className="px-5 py-3 font-medium">SKU</th>
              <th className="px-5 py-3 font-medium">Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b last:border-0">
                <td className="px-5 py-3 font-medium">{product.name}</td>
                <td className="px-5 py-3 text-zinc-500">{product.sku}</td>
                <td className="px-5 py-3">{stockBadge(product.stock)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Pagination({ page, totalPages, onPageChange }: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Précédent
      </Button>
      <span className="text-sm text-zinc-500">
        Page {page} sur {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Suivant
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
}

function AllProductsTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useInventory({ page, pageSize: 10 });
  const products = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-4">
      <ProductTable products={products} isLoading={isLoading} emptyMessage="Aucun produit en inventaire." />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

function LowStockTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useInventory({ page, pageSize: 10, lowStock: true });
  const products = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-4">
      <ProductTable products={products} isLoading={isLoading} emptyMessage="Aucun produit en stock faible." />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

function MovementsTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useInventoryMovements({ page, pageSize: 10 });
  const movements = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  if (isLoading) {
    return (
      <Card className="rounded-2xl border p-5">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (movements.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Aucun mouvement"
        description="Les mouvements de stock apparaîtront ici."
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-zinc-500">
                <th className="px-5 py-3 font-medium">Produit</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Quantité</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((mv) => (
                <tr key={mv.id} className="border-b last:border-0">
                  <td className="px-5 py-3 font-medium">{mv.product?.name ?? "—"}</td>
                  <td className="px-5 py-3">
                    <Badge variant={mv.type === "IN" ? "success" : "warning"}>
                      {mv.type === "IN" ? "Entrée" : "Sortie"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">{mv.quantity}</td>
                  <td className="px-5 py-3 text-zinc-500">
                    {new Date(mv.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventaire</h1>
        <p className="text-sm text-zinc-500">Surveillez le stock et les mouvements d&apos;inventaire.</p>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="low">Stock faible</TabsTrigger>
          <TabsTrigger value="movements">Mouvements</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <AllProductsTab />
        </TabsContent>

        <TabsContent value="low" className="mt-4">
          <LowStockTab />
        </TabsContent>

        <TabsContent value="movements" className="mt-4">
          <MovementsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
