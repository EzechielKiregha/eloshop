"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type UiState = {
  sidebarOpen: boolean;
  compactTables: boolean;
  setSidebarOpen: (open: boolean) => void;
  setCompactTables: (compact: boolean) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      compactTables: false,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setCompactTables: (compactTables) => set({ compactTables })
    }),
    { name: "kamegashop-ui" }
  )
);
