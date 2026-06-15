import { http, type ApiEnvelope } from "./http";

export type RevenueData = {
  totalRevenue: number;
  salesRevenue: number;
  ordersRevenue: number;
  salesCount: number;
  ordersCount: number;
  monthlyBreakdown: Record<string, number>;
  categoryBreakdown: Record<string, number>;
  topProducts: [string, number][];
  paymentMethods: Record<string, number>;
  period: { from: string; to: string };
};

export async function getRevenueReport(from: string, to: string) {
  const res = await http.get<ApiEnvelope<RevenueData>>(
    `/reports/revenue?from=${from}&to=${to}`,
  );
  return res.data.data;
}

export function getRevenueReportPdfUrl(from: string, to: string) {
  return `/api/reports/revenue?from=${from}&to=${to}&pdf=true`;
}
