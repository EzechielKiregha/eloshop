import { http, type PaginatedEnvelope, type ApiEnvelope } from "./http";
import type { User } from "@/lib/types";

export type CustomerFilters = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export async function getCustomers(filters: CustomerFilters = {}) {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  if (filters.search) params.set("search", filters.search);
  const res = await http.get<PaginatedEnvelope<User>>(`/customers?${params}`);
  return res.data;
}

export async function getCustomer(id: string) {
  const res = await http.get<ApiEnvelope<User>>(`/customers/${id}`);
  return res.data.data;
}
