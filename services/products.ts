import { http, type ApiEnvelope, type PaginatedEnvelope } from "./http";
import type { Product } from "@/lib/types";

export type ProductFilters = {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  sort?: string;
  slug?: string;
};

export async function getProducts(filters: ProductFilters = {}) {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  if (filters.search) params.set("search", filters.search);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.slug) params.set("slug", filters.slug);
  const res = await http.get<PaginatedEnvelope<Product>>(`/products?${params}`);
  return res.data;
}

export async function getProduct(id: string) {
  const res = await http.get<ApiEnvelope<Product>>(`/products/${id}`);
  return res.data.data;
}

export type ProductPayload = {
  name: string;
  slug: string;
  description: string;
  price: number;
  costPrice: number;
  stock: number;
  sku: string;
  images: string[];
  categoryId: string;
};

export async function createProduct(data: ProductPayload) {
  const res = await http.post<ApiEnvelope<Product>>("/products", data);
  return res.data.data;
}

export async function updateProduct(id: string, data: Partial<ProductPayload>) {
  const res = await http.put<ApiEnvelope<Product>>(`/products/${id}`, data);
  return res.data.data;
}

export async function deleteProduct(id: string) {
  await http.delete(`/products/${id}`);
}
