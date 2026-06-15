"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "@/services/dashboard";
import type { DashboardData, OrderStatus } from "@/lib/types";
import { money } from "@/lib/numbers";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react";

const STATUS_MAP: Record<
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

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-sm text-zinc-500">
            Vue synthétique des ventes, commandes, clients et produits.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-3 h-8 w-32" />
            </Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-5 w-40" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} className="h-10 w-full" />
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-sm text-zinc-500">
          Vue synthétique des ventes, commandes, clients et produits.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Revenus"
          value={money(data?.revenue ?? 0)}
          icon={DollarSign}
        />
        <StatCard
          title="Commandes"
          value={String(data?.orders ?? 0)}
          icon={ShoppingCart}
        />
        <StatCard
          title="Clients"
          value={String(data?.customers ?? 0)}
          icon={Users}
        />
        <StatCard
          title="Produits"
          value={String(data?.products ?? 0)}
          icon={Package}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <Card className="rounded-2xl border p-0">
          <div className="p-5 pb-0">
            <h2 className="text-lg font-semibold">Commandes récentes</h2>
          </div>
          <div className="overflow-x-auto p-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-zinc-500">
                  <th className="pb-3 font-medium">N° Commande</th>
                  <th className="pb-3 font-medium">Client</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {(!data?.recentOrders || data.recentOrders.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-zinc-400">
                      Aucune commande récente
                    </td>
                  </tr>
                )}
                {data?.recentOrders?.map((order) => {
                  const status = STATUS_MAP[order.status];
                  return (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{order.orderNumber}</td>
                      <td className="py-3">{order.customer?.name ?? "—"}</td>
                      <td className="py-3">{money(order.total)}</td>
                      <td className="py-3">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent sales */}
        <Card className="rounded-2xl border p-0">
          <div className="p-5 pb-0">
            <h2 className="text-lg font-semibold">Ventes récentes</h2>
          </div>
          <div className="overflow-x-auto p-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-zinc-500">
                  <th className="pb-3 font-medium">N° Vente</th>
                  <th className="pb-3 font-medium">Client</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Paiement</th>
                </tr>
              </thead>
              <tbody>
                {(!data?.recentSales || data.recentSales.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-zinc-400">
                      Aucune vente récente
                    </td>
                  </tr>
                )}
                {data?.recentSales?.map((sale) => (
                  <tr key={sale.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{sale.saleNumber}</td>
                    <td className="py-3">{sale.customerName ?? "—"}</td>
                    <td className="py-3">{money(sale.total)}</td>
                    <td className="py-3">
                      <Badge variant="secondary">{sale.paymentMethod}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
