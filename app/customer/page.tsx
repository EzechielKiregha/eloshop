"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, DollarSign, Clock } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrders } from "@/services/orders";
import { money } from "@/lib/numbers";
import type { Order } from "@/lib/types";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" }> = {
  PENDING: { label: "En attente", variant: "secondary" },
  CONFIRMED: { label: "Confirmée", variant: "default" },
  PREPARING: { label: "En préparation", variant: "warning" },
  READY: { label: "Prête", variant: "success" },
  DELIVERED: { label: "Livrée", variant: "success" },
  CANCELLED: { label: "Annulée", variant: "destructive" },
};

export default function CustomerDashboard() {
  const { data: session } = useSession();

  const { data, isLoading } = useQuery({
    queryKey: ["orders", "customer", session?.user?.id],
    queryFn: () => getOrders({ customerId: session?.user?.id, pageSize: 50 }),
    enabled: !!session?.user?.id,
  });

  const orders: Order[] = data?.data || [];
  const totalSpent = orders.filter((o) => o.status !== "CANCELLED").reduce((sum, o) => sum + Number(o.total), 0);
  const pendingOrders = orders.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status)).length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total commandes" value={String(orders.length)} icon={ShoppingBag} />
        <StatCard title="Total dépensé" value={money(totalSpent)} icon={DollarSign} />
        <StatCard title="En cours" value={String(pendingOrders)} icon={Clock} />
      </div>

      <Card>
        <div className="border-b p-5">
          <h2 className="font-semibold">Dernières commandes</h2>
        </div>
        {orders.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">Aucune commande pour le moment.</div>
        ) : (
          orders.slice(0, 5).map((order) => {
            const status = statusLabels[order.status] || statusLabels.PENDING;
            return (
              <div key={order.id} className="flex flex-col gap-3 border-b p-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-zinc-500">{new Date(order.createdAt).toLocaleDateString("fr-FR")} · {money(order.total)}</p>
                </div>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
            );
          })
        )}
      </Card>
    </div>
  );
}
