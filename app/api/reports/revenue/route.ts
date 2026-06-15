import { NextResponse } from "next/server";
import { fail, ok, unauthorized } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { type ContentSection, generateReportPdf } from "@/lib/pdf/report-generator";
import { auth } from "@/lib/auth";
import { OrderStatus } from "@/generated/prisma/enums";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const pdf = searchParams.get("pdf") === "true";

    if (!fromParam || !toParam) {
      return fail(new Error("Parametres 'from' et 'to' requis"), 400);
    }

    const from = new Date(fromParam);
    from.setHours(0, 0, 0, 0);
    const to = new Date(toParam);
    to.setHours(23, 59, 59, 999);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return fail(new Error("Dates invalides"), 400);
    }

    // ─── Fetch sales ───────────────────────────────────────────
    const sales = await prisma.sale.findMany({
      where: { createdAt: { gte: from, lte: to } },
      include: {
        items: { include: { product: { include: { category: true } } } },
      },
    });

    // ─── Fetch confirmed orders ────────────────────────────────
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: from, lte: to },
        status: { notIn: [OrderStatus.CANCELLED, OrderStatus.PENDING] },
      },
      include: {
        items: { include: { product: { include: { category: true } } } },
      },
    });

    // ─── Compute metrics ───────────────────────────────────────
    const salesRevenue = sales.reduce((s, sale) => s + Number(sale.total), 0);
    const ordersRevenue = orders.reduce((s, order) => s + Number(order.total), 0);
    const totalRevenue = salesRevenue + ordersRevenue;

    // Monthly breakdown
    const monthlyBreakdown: Record<string, number> = {};
    [...sales, ...orders].forEach((item) => {
      const key = item.createdAt.toISOString().slice(0, 7);
      monthlyBreakdown[key] = (monthlyBreakdown[key] || 0) + Number(item.total);
    });

    // Revenue by category
    const categoryBreakdown: Record<string, number> = {};
    const productCount: Record<string, number> = {};

    const allItems = [
      ...sales.flatMap((s) => s.items),
      ...orders.flatMap((o) => o.items),
    ];

    for (const item of allItems) {
      const catName = item.product.category?.name ?? "Sans categorie";
      const revenue = Number(item.price) * item.quantity;
      categoryBreakdown[catName] = (categoryBreakdown[catName] || 0) + revenue;
      productCount[item.product.name] = (productCount[item.product.name] || 0) + item.quantity;
    }

    const topProducts = Object.entries(productCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    // Payment methods (sales only have paymentMethod)
    const paymentMethods: Record<string, number> = {};
    sales.forEach((sale) => {
      paymentMethods[sale.paymentMethod] =
        (paymentMethods[sale.paymentMethod] || 0) + Number(sale.total);
    });

    const formatMoney = (v: number) =>
      v.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " USD";

    // ─── PDF export ────────────────────────────────────────────
    if (pdf) {
      const fromStr = from.toLocaleDateString("fr-FR");
      const toStr = to.toLocaleDateString("fr-FR");

      const sections: ContentSection[] = [
        {
          title: "Resume",
          type: "keyValue",
          data: {
            "Periode :": `${fromStr} - ${toStr}`,
            "Revenu total :": formatMoney(totalRevenue),
            "Ventes (POS) :": formatMoney(salesRevenue),
            "Commandes (en ligne) :": formatMoney(ordersRevenue),
            "Nombre de ventes :": String(sales.length),
            "Nombre de commandes :": String(orders.length),
            "Panier moyen :": formatMoney(
              totalRevenue / Math.max(sales.length + orders.length, 1),
            ),
          },
        },
        {
          title: "Revenus mensuels",
          type: "table",
          data: {
            headers: ["Mois", "Revenu"],
            rows: Object.entries(monthlyBreakdown)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([month, revenue]) => [month, formatMoney(revenue)]),
          },
        },
        {
          title: "Revenus par categorie",
          type: "table",
          data: {
            headers: ["Categorie", "Revenu"],
            rows: Object.entries(categoryBreakdown).map(([cat, rev]) => [
              cat,
              formatMoney(rev),
            ]),
          },
        },
        {
          title: "Produits les plus vendus",
          type: "table",
          data: {
            headers: ["Produit", "Quantite vendue"],
            rows: topProducts.map(([name, qty]) => [name, String(qty)]),
          },
        },
        {
          title: "Modes de paiement (POS)",
          type: "table",
          data: {
            headers: ["Mode", "Montant"],
            rows: Object.entries(paymentMethods).map(([method, amount]) => [
              method,
              formatMoney(amount),
            ]),
          },
        },
      ];

      const pdfBuffer = await generateReportPdf(
        sections,
        "Rapport de revenus",
        `${fromStr} au ${toStr}`,
      );

      return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="rapport-revenus-${fromParam}-${toParam}.pdf"`,
        },
      });
    }

    // ─── JSON response ─────────────────────────────────────────
    return ok({
      totalRevenue,
      salesRevenue,
      ordersRevenue,
      salesCount: sales.length,
      ordersCount: orders.length,
      monthlyBreakdown,
      categoryBreakdown,
      topProducts,
      paymentMethods,
      period: { from: fromParam, to: toParam },
    });
  } catch (error) {
    return fail(error, 500);
  }
}
