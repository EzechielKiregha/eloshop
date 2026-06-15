import axios from "axios";

export const http = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

export type ApiEnvelope<T> = { data: T };
export type PaginatedEnvelope<T> = { data: T[]; total: number; page: number; pageSize: number; totalPages: number };
