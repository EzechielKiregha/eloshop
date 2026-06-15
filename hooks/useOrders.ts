"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getOrders,
  getOrder,
  checkout,
  updateOrderStatus,
  type OrderFilters,
  type CheckoutPayload,
} from "@/services/orders";
import type { OrderStatus } from "@/lib/types";

export function useOrders(filters?: OrderFilters) {
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ["orders", filters],
    queryFn: () => getOrders(filters ?? {}),
  });

  const checkoutMutation = useMutation({
    mutationFn: (data: CheckoutPayload) => checkout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return {
    ...ordersQuery,
    checkout: checkoutMutation,
    updateOrderStatus: updateStatusMutation,
  };
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => getOrder(id),
    enabled: !!id,
  });
}
