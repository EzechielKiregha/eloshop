import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { put } from "@vercel/blob";

type ReceiptLine = {
  name: string;
  quantity: number;
  price: string | number;
};

type ReceiptInput = {
  number: string;
  title: string;
  customerName?: string | null;
  paymentMethod?: string;
  discount?: number;
  subtotal?: string | number;
  total: string | number;
  items: ReceiptLine[];
};

export async function createReceipt(input: ReceiptInput): Promise<string> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const PAGE_WIDTH = doc.internal.pageSize.getWidth();
  const MARGIN = 20;
  let y = MARGIN;

  // ─── Header ──────────────────────────────────────────────────
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(212, 175, 55);
  doc.text("BOUTIQUE KAMEGA", PAGE_WIDTH / 2, y, { align: "center" });
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Habillement Mixte — Style • Élégance • Qualité", PAGE_WIDTH / 2, y, { align: "center" });
  y += 12;

  // Gold divider
  doc.setDrawColor(212, 175, 55);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  doc.setTextColor(0, 0, 0);
  y += 8;

  // ─── Receipt info ────────────────────────────────────────────
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(input.title, PAGE_WIDTH / 2, y, { align: "center" });
  y += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const infoRows: [string, string][] = [
    ["Numero", input.number],
    ["Date", new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })],
  ];
  if (input.customerName) infoRows.push(["Client", input.customerName]);
  if (input.paymentMethod) infoRows.push(["Paiement", input.paymentMethod]);

  for (const [label, value] of infoRows) {
    doc.setFont("helvetica", "bold");
    doc.text(label + " :", MARGIN, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, MARGIN + 35, y);
    y += 6;
  }
  y += 6;

  // ─── Items table ─────────────────────────────────────────────
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Produit", "Qte", "Prix unit.", "Total"]],
    body: input.items.map((item) => {
      const unitPrice = typeof item.price === "number" ? item.price : parseFloat(String(item.price).replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
      const lineTotal = unitPrice * item.quantity;
      return [
        item.name,
        String(item.quantity),
        typeof item.price === "string" ? item.price : `${item.price.toFixed(2)} USD`,
        `${lineTotal.toFixed(2)} USD`,
      ];
    }),
    headStyles: {
      fillColor: [30, 30, 30],
      textColor: [212, 175, 55],
      fontStyle: "bold",
      fontSize: 9,
    },
    styles: { fontSize: 9, cellPadding: 4 },
    alternateRowStyles: { fillColor: [250, 250, 250] },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 10;

  // ─── Summary ─────────────────────────────────────────────────
  doc.setDrawColor(220, 220, 220);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 8;

  const summaryX = PAGE_WIDTH - MARGIN;

  if (input.subtotal) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Sous-total : ${input.subtotal}`, summaryX, y, { align: "right" });
    y += 6;
  }

  if (input.discount && input.discount > 0) {
    doc.setTextColor(220, 38, 38);
    doc.text(`Remise : -${input.discount.toFixed(2)} USD`, summaryX, y, { align: "right" });
    doc.setTextColor(0, 0, 0);
    y += 6;
  }

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(`Total : ${input.total}`, summaryX, y, { align: "right" });
  y += 16;

  // ─── Footer ──────────────────────────────────────────────────
  doc.setDrawColor(220, 220, 220);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Merci pour votre achat !", PAGE_WIDTH / 2, y, { align: "center" });
  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("BOUTIQUE KAMEGA — Habillement Mixte", PAGE_WIDTH / 2, y, { align: "center" });
  y += 5;
  doc.text("Butembo, Nord-Kivu, RDC  |  +243 978 638 104", PAGE_WIDTH / 2, y, { align: "center" });
  y += 8;
  doc.setDrawColor(212, 175, 55);
  doc.line(MARGIN + 20, y, PAGE_WIDTH - MARGIN - 20, y);
  y += 6;
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 100, 100);
  doc.text("Les marchandises achetées ne sont ni remises ni échangées", PAGE_WIDTH / 2, y, { align: "center" });

  // ─── Generate PDF buffer ─────────────────────────────────────
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

  // If no blob token, return a data URL
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    const base64 = pdfBuffer.toString("base64");
    return `data:application/pdf;base64,${base64}`;
  }

  // Upload to Vercel Blob
  const blob = await put(`receipts/${input.number}.pdf`, pdfBuffer, {
    access: "public",
    contentType: "application/pdf",
  });

  return blob.url;
}
