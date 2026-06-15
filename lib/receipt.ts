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
  total: string | number;
  items: ReceiptLine[];
};

export async function createReceipt(input: ReceiptInput) {
  const lines = [
    "Elo'Shop",
    input.title,
    `Numéro: ${input.number}`,
    `Date: ${new Date().toLocaleDateString("fr-FR")}`,
    input.customerName ? `Client: ${input.customerName}` : null,
    input.paymentMethod ? `Paiement: ${input.paymentMethod}` : null,
    "",
    ...input.items.map((item) => `${item.name} x${item.quantity} - ${item.price}`),
    "",
    `Total: ${input.total}`
  ].filter(Boolean).join("\n");

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return `data:text/plain;charset=utf-8,${encodeURIComponent(lines)}`;
  }

  const blob = await put(`receipts/${input.number}.txt`, lines, {
    access: "public",
    contentType: "text/plain;charset=utf-8"
  });

  return blob.url;
}
