"use client";

import { useQuery } from "@tanstack/react-query";
import { getInventory, getMovements } from "@/services/inventory";

type InventoryParams = { page?: number; pageSize?: number; lowStock?: boolean };
type MovementParams = { page?: number; pageSize?: number };

export function useInventory(params?: InventoryParams) {
  return useQuery({
    queryKey: ["inventory", params],
    queryFn: () => getInventory(params),
  });
}

export function useInventoryMovements(params?: MovementParams) {
  return useQuery({
    queryKey: ["inventory", "movements", params],
    queryFn: () => getMovements(params),
  });
}
