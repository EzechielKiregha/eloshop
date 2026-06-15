"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getCustomers,
  getCustomer,
  type CustomerFilters,
} from "@/services/customers";

export function useCustomers(filters?: CustomerFilters) {
  return useQuery({
    queryKey: ["customers", filters],
    queryFn: () => getCustomers(filters ?? {}),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: () => getCustomer(id),
    enabled: !!id,
  });
}
