import { http, type ApiEnvelope, type PaginatedEnvelope } from "./http";
import type { Order, OrderStatus } from "@/lib/types";

export type OrderFilters = {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
  search?: string;
  customerId?: string;
};

export async function getOrders(filters: OrderFilters = {}) {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  if (filters.customerId) params.set("customerId", filters.customerId);
  const res = await http.get<PaginatedEnvelope<Order>>(`/orders?${params}`);
  return res.data;
}

export async function getOrder(id: string) {
  const res = await http.get<ApiEnvelope<Order>>(`/orders/${id}`);
  return res.data.data;
}

export type CheckoutPayload = {
  fullName: string;
  phone: string;
  address: string;
  email?: string;
  items: Array<{ productId: string; quantity: number }>;
};

export async function checkout(data: CheckoutPayload) {
  const res = await http.post<ApiEnvelope<Order>>("/orders", data);
  return res.data.data;
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const res = await http.patch<ApiEnvelope<Order>>(`/orders/${id}`, { status });
  return res.data.data;
}
