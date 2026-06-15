"use client";

import { create } from "zustand";

export type PosItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

type PosState = {
  items: PosItem[];
  discount: number;
  addItem: (item: Omit<PosItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setDiscount: (discount: number) => void;
  clearSale: () => void;
};

export const usePosStore = create<PosState>((set) => ({
  items: [],
  discount: 0,
  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((posItem) => posItem.productId === item.productId);
      if (existing) {
        return {
          items: state.items.map((posItem) =>
            posItem.productId === item.productId ? { ...posItem, quantity: posItem.quantity + 1 } : posItem
          )
        };
      }

      return { items: [...state.items, { ...item, quantity: 1 }] };
    }),
  removeItem: (productId) =>
    set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),
  updateQuantity: (productId, quantity) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.productId === productId ? { ...item, quantity: Math.max(quantity, 1) } : item
      )
    })),
  setDiscount: (discount) => set({ discount: Math.max(discount, 0) }),
  clearSale: () => set({ items: [], discount: 0 })
}));
