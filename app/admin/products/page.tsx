"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { productSchema } from "@/lib/validators";
import { money } from "@/lib/numbers";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, ShoppingBag } from "lucide-react";

type ProductFormValues = z.infer<typeof productSchema>;

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const { data: productsData, isLoading } = useProducts({ search: search || undefined });
  const { data: categories } = useCategories();
  const { createProduct, updateProduct, deleteProduct } = useProducts();

  const products = productsData?.data ?? [];

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", slug: "", description: "", price: 0, costPrice: 0,
      stock: 0, sku: "", images: [], categoryId: "",
    },
  });

  useEffect(() => {
    if (editing) {
      form.reset({
        name: editing.name,
        slug: editing.slug,
        description: editing.description,
        price: editing.price,
        costPrice: editing.costPrice,
        stock: editing.stock,
        sku: editing.sku,
        images: editing.images,
        categoryId: editing.categoryId,
      });
    } else {
      form.reset({
        name: "", slug: "", description: "", price: 0, costPrice: 0,
        stock: 0, sku: "", images: [], categoryId: "",
      });
    }
  }, [editing, form]);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setDialogOpen(true);
  }

  async function onSubmit(values: ProductFormValues) {
    try {
      if (editing) {
        await updateProduct.mutateAsync({ id: editing.id, data: values });
        toast({ title: "Produit mis à jour" });
      } else {
        await createProduct.mutateAsync(values);
        toast({ title: "Produit créé" });
      }
      setDialogOpen(false);
      setEditing(null);
    } catch {
      toast({ title: "Erreur", description: "Une erreur est survenue.", variant: "destructive" });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteProduct.mutateAsync(deleteTarget.id);
      toast({ title: "Produit supprimé" });
      setDeleteTarget(null);
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer ce produit.", variant: "destructive" });
    }
  }

  // Auto-generate slug from name
  const watchedName = form.watch("name");
  useEffect(() => {
    if (!editing) {
      form.setValue("slug", watchedName.toLowerCase().replace(/\s+/g, "-"));
    }
  }, [watchedName, editing, form]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Produits</h1>
        <p className="text-sm text-zinc-500">Gérez les articles, les prix, les catégories et les niveaux de stock.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un produit
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <Card className="rounded-2xl border p-5">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </Card>
      ) : products.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Aucun produit"
          description={search ? "Aucun produit ne correspond à votre recherche." : "Commencez par ajouter votre premier produit."}
        >
          {!search && (
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un produit
            </Button>
          )}
        </EmptyState>
      ) : (
        <Card className="rounded-2xl border p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-zinc-500">
                  <th className="px-5 py-3 font-medium">Produit</th>
                  <th className="px-5 py-3 font-medium">Catégorie</th>
                  <th className="px-5 py-3 font-medium">Prix</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">SKU</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b last:border-0">
                    <td className="px-5 py-3 font-medium">{product.name}</td>
                    <td className="px-5 py-3">{product.category?.name ?? "—"}</td>
                    <td className="px-5 py-3">{money(product.price)}</td>
                    <td className="px-5 py-3">{product.stock}</td>
                    <td className="px-5 py-3 text-zinc-500">{product.sku}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(product)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Product form dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier le produit" : "Ajouter un produit"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" {...form.register("slug")} />
              {form.formState.errors.slug && <p className="text-xs text-red-500">{form.formState.errors.slug.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" {...form.register("description")} />
              {form.formState.errors.description && <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Prix</Label>
                <Input id="price" type="number" {...form.register("price")} />
                {form.formState.errors.price && <p className="text-xs text-red-500">{form.formState.errors.price.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="costPrice">Prix coûtant</Label>
                <Input id="costPrice" type="number" {...form.register("costPrice")} />
                {form.formState.errors.costPrice && <p className="text-xs text-red-500">{form.formState.errors.costPrice.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" {...form.register("stock")} />
                {form.formState.errors.stock && <p className="text-xs text-red-500">{form.formState.errors.stock.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" {...form.register("sku")} />
                {form.formState.errors.sku && <p className="text-xs text-red-500">{form.formState.errors.sku.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select
                value={form.watch("categoryId")}
                onValueChange={(val) => form.setValue("categoryId", val, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.categoryId && <p className="text-xs text-red-500">{form.formState.errors.categoryId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Image URL</Label>
              <Input
                id="images"
                placeholder="https://example.com/image.jpg"
                value={form.watch("images")?.[0] ?? ""}
                onChange={(e) => form.setValue("images", e.target.value ? [e.target.value] : [], { shouldValidate: true })}
              />
              {form.formState.errors.images && <p className="text-xs text-red-500">{form.formState.errors.images.message}</p>}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); setEditing(null); }}>
                Annuler
              </Button>
              <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending}>
                {editing ? "Enregistrer" : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Supprimer le produit"
        description={`Voulez-vous vraiment supprimer « ${deleteTarget?.name} » ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="destructive"
        loading={deleteProduct.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
