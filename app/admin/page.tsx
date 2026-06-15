"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "@/services/dashboard";
import { getRevenueReportPdfUrl } from "@/services/reports";
import type { DashboardData, OrderStatus } from "@/lib/types";
import { money } from "@/lib/numbers";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { DollarSign, ShoppingCart, Users, Package, Download } from "lucide-react";

const STATUS_MAP: Record<
  OrderStatus,
  {
    variant: "secondary" | "default" | "warning" | "success" | "destructive";
    label: string;
  }
> = {
  PENDING: { variant: "secondary", label: "En attente" },
  CONFIRMED: { variant: "default", label: "Confirmee" },
  PREPARING: { variant: "warning", label: "En preparation" },
  READY: { variant: "success", label: "Prete" },
  DELIVERED: { variant: "success", label: "Livree" },
  CANCELLED: { variant: "destructive", label: "Annulee" },
};

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });

  // Report export dates
  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
  const [reportFrom, setReportFrom] = useState(thirtyDaysAgo);
  const [reportTo, setReportTo] = useState(today);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-sm text-zinc-500">
            Vue synthetique des ventes, commandes, clients et produits.
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
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-5 w-40" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-10 w-full" />
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const recentSales = data?.recentSales || [];
  const recentOrders = data?.recentOrders || [];

  // Sales chart data (last 7 sales)
  const salesByDay = recentSales.slice(-7).map((sale) => ({
    date: new Date(sale.createdAt).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" }),
    amount: Number(sale.total),
  }));
  const maxSaleAmount = Math.max(...salesByDay.map((s) => s.amount), 1);

  // Order status breakdown
  const statusCounts: Record<string, number> = {};
  recentOrders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });
  const totalOrderCount = recentOrders.length || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Vue synthetique des ventes, commandes, clients et produits.
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

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tendance des ventes</CardTitle>
          </CardHeader>
          <CardContent>
            {salesByDay.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">Aucune vente recente</p>
            ) : (
              <div className="flex h-56 items-end gap-3">
                {salesByDay.map((day, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <div className="relative w-full rounded-lg bg-zinc-100 dark:bg-zinc-800" style={{ height: "100%" }}>
                      <div
                        className="absolute bottom-0 w-full rounded-lg bg-zinc-900 transition-all dark:bg-zinc-50"
                        style={{ height: `${(day.amount / maxSaleAmount) * 100}%`, minHeight: "4px" }}
                      />
                    </div>
                    <span className="text-[10px] text-zinc-500">{day.date}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order status breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Repartition des commandes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(statusCounts).length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">Aucune commande</p>
            ) : (
              Object.entries(statusCounts).map(([status, count]) => {
                const pct = Math.round((count / totalOrderCount) * 100);
                const label = STATUS_MAP[status as OrderStatus]?.label ?? status;
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm">
                      <span>{label}</span>
                      <span className="text-zinc-500">{count} ({pct}%)</span>
                    </div>
                    <div className="mt-2 h-3 rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div
                        className="h-3 rounded-full bg-zinc-900 transition-all dark:bg-zinc-50"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent tables row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <Card className="rounded-2xl border p-0">
          <div className="p-5 pb-0">
            <h2 className="text-lg font-semibold">Commandes recentes</h2>
          </div>
          <div className="overflow-x-auto p-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-zinc-500">
                  <th className="pb-3 font-medium">N Commande</th>
                  <th className="pb-3 font-medium">Client</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {(!recentOrders || recentOrders.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-zinc-400">
                      Aucune commande recente
                    </td>
                  </tr>
                )}
                {recentOrders.slice(-5).reverse().map((order) => {
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
            <h2 className="text-lg font-semibold">Ventes recentes</h2>
          </div>
          <div className="overflow-x-auto p-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-zinc-500">
                  <th className="pb-3 font-medium">N Vente</th>
                  <th className="pb-3 font-medium">Client</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Paiement</th>
                </tr>
              </thead>
              <tbody>
                {(!recentSales || recentSales.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-zinc-400">
                      Aucune vente recente
                    </td>
                  </tr>
                )}
                {recentSales.slice(-5).reverse().map((sale) => (
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

      {/* Export report */}
      <Separator />
      <Card>
        <CardHeader>
          <CardTitle>Exporter le rapport de revenus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">Du</label>
              <Input
                type="date"
                value={reportFrom}
                onChange={(e) => setReportFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500">Au</label>
              <Input
                type="date"
                value={reportTo}
                onChange={(e) => setReportTo(e.target.value)}
              />
            </div>
            <Button asChild>
              <a
                href={getRevenueReportPdfUrl(reportFrom, reportTo)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="mr-2 h-4 w-4" />
                Telecharger PDF
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
