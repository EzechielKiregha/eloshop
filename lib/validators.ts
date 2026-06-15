import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
  costPrice: z.coerce.number().nonnegative(),
  stock: z.coerce.number().int().nonnegative(),
  sku: z.string().min(2),
  images: z.array(z.string().url()),
  categoryId: z.string().min(1)
});

export const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2)
});

export const checkoutSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(6),
  address: z.string().min(6),
  email: z.string().email().optional().or(z.literal("")),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.coerce.number().int().positive()
  })).min(1)
});

export const saleSchema = z.object({
  customerName: z.string().optional(),
  discount: z.coerce.number().nonnegative().default(0),
  paymentMethod: z.enum(["CASH", "MOBILE_MONEY", "CARD", "BANK_TRANSFER"]),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.coerce.number().int().positive()
  })).min(1)
});

export const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PREPARING", "READY", "DELIVERED", "CANCELLED"])
});
