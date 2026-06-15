"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSales,
  completeSale,
  type SalePayload,
} from "@/services/sales";

type SalesParams = { page?: number; pageSize?: number };

export function useSales(params?: SalesParams) {
  const queryClient = useQueryClient();

  const salesQuery = useQuery({
    queryKey: ["sales", params],
    queryFn: () => getSales(params),
  });

  const completeSaleMutation = useMutation({
    mutationFn: (data: SalePayload) => completeSale(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return {
    ...salesQuery,
    completeSale: completeSaleMutation,
  };
}
