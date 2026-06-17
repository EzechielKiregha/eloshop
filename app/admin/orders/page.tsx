"use client";

import { useState } from "react";
import { useOrders } from "@/hooks/useOrders";
import { money } from "@/lib/numbers";
import type { OrderStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/empty-state";
import { toast } from "@/hooks/use-toast";
import {
  Search,
  ShoppingCart,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "PENDING", label: "En attente" },
  { value: "CONFIRMED", label: "Confirmée" },
  { value: "PREPARING", label: "En préparation" },
  { value: "READY", label: "Prête" },
  { value: "DELIVERED", label: "Livrée" },
  { value: "CANCELLED", label: "Annulée" },
];

const STATUS_BADGE: Record<
  OrderStatus,
  {
    variant: "secondary" | "default" | "warning" | "success" | "destructive";
    label: string;
  }
> = {
  PENDING: { variant: "secondary", label: "En attente" },
  CONFIRMED: { variant: "default", label: "Confirmée" },
  PREPARING: { variant: "warning", label: "En préparation" },
  READY: { variant: "success", label: "Prête" },
  DELIVERED: { variant: "success", label: "Livrée" },
  CANCELLED: { variant: "destructive", label: "Annulée" },
};

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const filters = {
    search: search || undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    page,
    pageSize: 10,
  };

  const { data, isLoading, updateOrderStatus } = useOrders(filters);
  const orders = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    try {
      await updateOrderStatus.mutateAsync({ id: orderId, status });
      toast({ title: "Statut mis à jour" });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Commandes</h1>
        <p className="text-sm text-zinc-500">
          Recherchez, filtrez et mettez à jour les statuts des commandes.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Rechercher une commande..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val as OrderStatus | "ALL");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous les statuts</SelectItem>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <Card className="rounded-2xl border p-5">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </Card>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Aucune commande"
          description={
            search || statusFilter !== "ALL"
              ? "Aucune commande ne correspond à vos critères."
              : "Les commandes apparaîtront ici."
          }
        />
      ) : (
        <Card className="rounded-2xl border p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-zinc-500">
                  <th className="px-5 py-3 font-medium">Commande</th>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Statut</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const badge = STATUS_BADGE[order.status];
                  return (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="px-5 py-3 font-medium">
                        {order.orderNumber}
                      </td>
                      <td className="px-5 py-3">
                        {order.customer?.name ?? "—"}
                      </td>
                      <td className="px-5 py-3">{money(order.total)}</td>
                      <td className="px-5 py-3">
                        <Select
                          value={order.status}
                          onValueChange={(val) =>
                            handleStatusChange(order.id, val as OrderStatus)
                          }
                        >
                          <SelectTrigger className="h-8 w-[160px]">
                            <Badge variant={badge.variant}>{badge.label}</Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-5 py-3 text-zinc-500">
                        {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          {order.receiptUrl && (
                            <Button variant="ghost" size="icon" asChild>
                              <a
                                href={order.receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
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
            onClick={() => setPage((p) => p + 1)}
          >
            Suivant
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
