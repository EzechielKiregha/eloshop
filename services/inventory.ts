import { http, type PaginatedEnvelope } from "./http";
import type { Product, InventoryMovement } from "@/lib/types";

export async function getInventory(params?: { page?: number; pageSize?: number; lowStock?: boolean }) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.pageSize) query.set("pageSize", String(params.pageSize));
  if (params?.lowStock) query.set("lowStock", "true");
  const res = await http.get<PaginatedEnvelope<Product>>(`/inventory?${query}`);
  return res.data;
}

export async function getMovements(params?: { page?: number; pageSize?: number }) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.pageSize) query.set("pageSize", String(params.pageSize));
  const res = await http.get<PaginatedEnvelope<InventoryMovement>>(`/inventory/movements?${query}`);
  return res.data;
}
