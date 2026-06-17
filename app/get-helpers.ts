"use server"

import { prisma } from "@/lib/prisma";

export const getCategories = async () => await prisma.category.findMany({ take: 6 });
export const getProductCount = async () => await prisma.product.count();
export const getProducts = async () => {
    return await prisma.product.findMany({
        take: 4,
        orderBy: { createdAt: "desc" },
        include: { category: true },
      });
}