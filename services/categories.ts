import { http, type ApiEnvelope } from "./http";
import type { Category } from "@/lib/types";

export async function getCategories() {
  const res = await http.get<ApiEnvelope<Category[]>>("/categories");
  return res.data.data;
}

export async function createCategory(data: { name: string; slug: string }) {
  const res = await http.post<ApiEnvelope<Category>>("/categories", data);
  return res.data.data;
}

export async function updateCategory(id: string, data: { name: string; slug: string }) {
  const res = await http.put<ApiEnvelope<Category>>(`/categories/${id}`, data);
  return res.data.data;
}

export async function deleteCategory(id: string) {
  await http.delete(`/categories/${id}`);
}
