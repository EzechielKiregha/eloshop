import { http, type ApiEnvelope } from "./http";
import type { DashboardData } from "@/lib/types";

export async function getDashboard() {
  const res = await http.get<ApiEnvelope<DashboardData>>("/dashboard");
  return res.data.data;
}
