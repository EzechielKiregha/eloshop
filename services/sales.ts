import { http, type ApiEnvelope, type PaginatedEnvelope } from "./http";
import type { Sale, PaymentMethod } from "@/lib/types";

export type SalePayload = {
  customerName?: string;
  discount?: number;
  paymentMethod: PaymentMethod;
  items: Array<{ productId: string; quantity: number }>;
};

export async function getSales(params?: { page?: number; pageSize?: number }) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.pageSize) query.set("pageSize", String(params.pageSize));
  const res = await http.get<PaginatedEnvelope<Sale>>(`/sales?${query}`);
  return res.data;
}

export async function completeSale(data: SalePayload) {
  const res = await http.post<ApiEnvelope<Sale>>("/sales", data);
  return res.data.data;
}

export async function generateReceipt(saleId: string) {
  const res = await http.post<ApiEnvelope<Sale>>(`/sales/${saleId}/receipt`);
  return res.data.data;
}
