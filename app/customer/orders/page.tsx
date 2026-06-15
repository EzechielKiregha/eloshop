"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Download, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
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

export default function CustomerOrdersPage() {
  const { data: session } = useSession();

  const { data, isLoading } = useQuery({
    queryKey: ["orders", "customer", session?.user?.id],
    queryFn: () => getOrders({ customerId: session?.user?.id, pageSize: 100 }),
    enabled: !!session?.user?.id,
  });

  const orders: Order[] = data?.data || [];

  if (isLoading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>;
  }

  if (orders.length === 0) {
    return <EmptyState icon={ShoppingBag} title="Aucune commande" description="Vous n'avez pas encore passé de commande." />;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold">Mes commandes</h2>
      <Card className="mt-4">
        {orders.map((order) => {
          const status = statusLabels[order.status] || statusLabels.PENDING;
          return (
            <div key={order.id} className="flex flex-col gap-3 border-b p-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{order.orderNumber}</p>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <p className="mt-1 text-sm text-zinc-500">
                  {new Date(order.createdAt).toLocaleDateString("fr-FR")} · {money(order.total)}
                </p>
              </div>
              {order.receiptUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={order.receiptUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-1 h-4 w-4" /> Reçu
                  </a>
                </Button>
              )}
            </div>
          );
        })}
      </Card>
    </div>
  );
}
