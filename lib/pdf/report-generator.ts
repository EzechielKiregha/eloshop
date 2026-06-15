import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface ContentSection {
  title: string;
  type: "table" | "keyValue" | "text";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export async function generateReportPdf(
  sections: ContentSection[],
  title: string,
  dateRange: string,
): Promise<Buffer> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const PAGE_WIDTH = doc.internal.pageSize.getWidth();
  const PAGE_HEIGHT = doc.internal.pageSize.getHeight();
  const MARGIN = 20;

  let yPos = MARGIN;

  // ─── Header ──────────────────────────────────────────────────
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("KAMEGA Shop", PAGE_WIDTH / 2, yPos, { align: "center" });
  yPos += 10;

  doc.setFontSize(14);
  doc.text(title, PAGE_WIDTH / 2, yPos, { align: "center" });
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Periode : ${dateRange}`, PAGE_WIDTH / 2, yPos, { align: "center" });
  yPos += 12;

  // ─── Sections ────────────────────────────────────────────────
  for (const section of sections) {
    if (yPos > PAGE_HEIGHT - 40) {
      doc.addPage();
      yPos = MARGIN;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(section.title, MARGIN, yPos);
    yPos += 8;

    switch (section.type) {
      case "table": {
        const { headers, rows } = section.data;
        autoTable(doc, {
          head: headers ? [headers] : [],
          body: rows,
          startY: yPos,
          margin: { left: MARGIN, right: MARGIN },
          headStyles: {
            fillColor: [24, 24, 27],
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
          styles: { fontSize: 9, cellPadding: 3 },
          alternateRowStyles: { fillColor: [250, 250, 250] },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        yPos = (doc as any).lastAutoTable.finalY + 10;
        break;
      }
      case "keyValue": {
        doc.setFontSize(9);
        const entries = Object.entries(section.data);
        for (const [key, value] of entries) {
          if (yPos > PAGE_HEIGHT - 30) {
            doc.addPage();
            yPos = MARGIN;
          }
          doc.setFont("helvetica", "bold");
          doc.text(key, MARGIN, yPos);
          doc.setFont("helvetica", "normal");
          doc.text(String(value), MARGIN + 55, yPos);
          yPos += 6;
        }
        yPos += 5;
        break;
      }
      case "text": {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const contentWidth = PAGE_WIDTH - MARGIN * 2;
        const textLines = doc.splitTextToSize(section.data, contentWidth);
        if (yPos + textLines.length * 5 > PAGE_HEIGHT - 30) {
          doc.addPage();
          yPos = MARGIN;
        }
        doc.text(textLines, MARGIN, yPos);
        yPos += textLines.length * 5 + 5;
        break;
      }
    }
  }

  // ─── Footer on all pages ─────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(220, 220, 220);
    doc.line(MARGIN, PAGE_HEIGHT - 20, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 20);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text("KAMEGA Shop - Rapport de revenus", MARGIN, PAGE_HEIGHT - 15);
    doc.text(`Page ${i} / ${pageCount}`, PAGE_WIDTH / 2, PAGE_HEIGHT - 15, { align: "center" });
    doc.text(
      `Genere le ${new Date().toLocaleDateString("fr-FR")}`,
      PAGE_WIDTH - MARGIN,
      PAGE_HEIGHT - 15,
      { align: "right" },
    );
    doc.setTextColor(0, 0, 0);
  }

  return Buffer.from(doc.output("arraybuffer"));
}
