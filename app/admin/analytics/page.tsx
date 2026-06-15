"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "@/services/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { money } from "@/lib/numbers";
import type { DashboardData } from "@/lib/types";

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold">Analytique</h1></div>
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const recentSales = data?.recentSales || [];
  const recentOrders = data?.recentOrders || [];

  // Group sales by day for the last 7 entries
  const salesByDay = recentSales.slice(0, 7).map((sale) => ({
    date: new Date(sale.createdAt).toLocaleDateString("fr-FR", { weekday: "short" }),
    amount: Number(sale.total),
  }));

  const maxSaleAmount = Math.max(...salesByDay.map((s) => s.amount), 1);

  // Order status breakdown
  const statusCounts: Record<string, number> = {};
  recentOrders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });
  const totalOrders = recentOrders.length || 1;

  const statusLabels: Record<string, string> = {
    PENDING: "En attente",
    CONFIRMED: "Confirmée",
    PREPARING: "En préparation",
    READY: "Prête",
    DELIVERED: "Livrée",
    CANCELLED: "Annulée",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytique</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Performances commerciales et tendances</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-zinc-500">Revenu total</p>
            <p className="mt-2 text-2xl font-bold">{money(data?.revenue || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-zinc-500">Commandes</p>
            <p className="mt-2 text-2xl font-bold">{data?.orders || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-zinc-500">Clients</p>
            <p className="mt-2 text-2xl font-bold">{data?.customers || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-zinc-500">Produits</p>
            <p className="mt-2 text-2xl font-bold">{data?.products || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales chart */}
        <Card>
          <CardHeader>
            <CardTitle>Ventes récentes</CardTitle>
          </CardHeader>
          <CardContent>
            {salesByDay.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">Aucune vente récente</p>
            ) : (
              <div className="flex h-56 items-end gap-3">
                {salesByDay.map((day, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <div className="w-full rounded-lg bg-zinc-100 dark:bg-zinc-800" style={{ height: "100%" }}>
                      <div
                        className="w-full rounded-lg bg-zinc-900 transition-all dark:bg-zinc-50"
                        style={{ height: `${(day.amount / maxSaleAmount) * 100}%`, minHeight: "4px" }}
                      />
                    </div>
                    <span className="text-xs text-zinc-500">{day.date}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order status breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des commandes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(statusCounts).length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">Aucune commande</p>
            ) : (
              Object.entries(statusCounts).map(([status, count]) => {
                const pct = Math.round((count / totalOrders) * 100);
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm">
                      <span>{statusLabels[status] || status}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="mt-2 h-3 rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div className="h-3 rounded-full bg-zinc-900 transition-all dark:bg-zinc-50" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
