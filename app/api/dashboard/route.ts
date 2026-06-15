import { fail, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [SaleRevenueAgg, OrderRevenueAgg, orders, customers, products, salesTrend, recentOrders] = await Promise.all([
      prisma.sale.aggregate({ _sum: { total: true } }),
      prisma.order.aggregate({ where: { status: { notIn: ["CANCELLED", "PENDING"] as const } }, _sum: { total: true } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.product.count(),
      prisma.sale.findMany({
        select: { id: true, saleNumber: true, customerName: true, total: true, createdAt: true, paymentMethod: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.order.findMany({
        select: { id: true, orderNumber: true, customer: { select: { name: true } }, total: true, createdAt: true, status: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    return ok({
      revenue: Number(SaleRevenueAgg._sum.total ?? 0) + Number(OrderRevenueAgg._sum?.total ?? 0),
      orders,
      customers,
      products,
      salesTrend: salesTrend.map((sale) => ({
        date: sale.createdAt,
        total: Number(sale.total),
      })),
      recentOrders: recentOrders.map((o) => ({
        ...o,
        total: Number(o.total),
      })),
      recentSales: salesTrend.map((s) => ({
        ...s,
        total: Number(s.total),
      })),
    });
  } catch (error) {
    return fail(error, 500);
  }
}
