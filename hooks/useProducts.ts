"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  type ProductFilters,
  type ProductPayload,
} from "@/services/products";

export function useProducts(filters?: ProductFilters) {
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ["products", filters],
    queryFn: () => getProducts(filters ?? {}),
  });

  const createMutation = useMutation({
    mutationFn: (data: ProductPayload) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductPayload> }) =>
      updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });

  return {
    ...productsQuery,
    createProduct: createMutation,
    updateProduct: updateMutation,
    deleteProduct: deleteMutation,
  };
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => getProduct(id),
    enabled: !!id,
  });
}
