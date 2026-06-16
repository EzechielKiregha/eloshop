"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { put } from "@vercel/blob";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { toast } from "@/hooks/use-toast";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ShoppingBag,
  ImageIcon,
  X,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ProductFormValues = z.infer<typeof productSchema>;

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [imageFiles, setImageFiles] = useState<Array<File | string>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { data: productsData, isLoading } = useProducts({
    search: search || undefined,
  });
  const { data: categories } = useCategories();
  const { createProduct, updateProduct, deleteProduct } = useProducts();

  const products = productsData?.data ?? [];

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: 0,
      costPrice: 0,
      stock: 0,
      sku: "",
      images: [],
      categoryId: "",
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
      setImageFiles(editing.images ?? []);
    } else {
      form.reset({
        name: "",
        slug: "",
        description: "",
        price: 0,
        costPrice: 0,
        stock: 0,
        sku: "",
        images: [],
        categoryId: "",
      });
      setImageFiles([]);
    }
    setUrlInput("");
  }, [editing, form]);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setDialogOpen(true);
  }

  const handleAddImages = (fileList: FileList) => {
    const incoming = Array.from(fileList).slice(0, 6 - imageFiles.length);
    setImageFiles((prev) => [...prev, ...incoming]);
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddUrl = () => {
    const url = urlInput.trim();
    if (!url || imageFiles.length >= 6) return;
    try {
      new URL(url);
      setImageFiles((prev) => [...prev, url]);
      setUrlInput("");
    } catch {
      toast({ title: "URL invalide", variant: "destructive" });
    }
  };

  async function onSubmit(values: ProductFormValues) {
    try {
      setIsUploading(true);
      const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
      const blobStoreId = process.env.NEXT_PUBLIC_BLOB_STORE_ID;

      const uploadedUrls = await Promise.all(
        imageFiles.map(async (f) => {
          if (typeof f === "string") return f;
          if (!blobToken) throw new Error("BLOB_READ_WRITE_TOKEN is missing.");
          const blob = await put(`products/images/${Date.now()}-${f.name}`, f, {
            access: "public",
            token: blobToken,
            storeId: blobStoreId,
          });
          return blob.url;
        }),
      );
      setIsUploading(false);

      const payload = { ...values, images: uploadedUrls };

      if (editing) {
        await updateProduct.mutateAsync({ id: editing.id, data: payload });
        toast({ title: "Produit mis à jour" });
      } else {
        await createProduct.mutateAsync(payload);
        toast({ title: "Produit créé" });
      }
      setDialogOpen(false);
      setEditing(null);
      setImageFiles([]);
    } catch (err) {
      console.log(err);
      setIsUploading(false);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue.",
        variant: "destructive",
      });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteProduct.mutateAsync(deleteTarget.id);
      toast({ title: "Produit supprimé" });
      setDeleteTarget(null);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer ce produit.",
        variant: "destructive",
      });
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
        <p className="text-sm text-zinc-500">
          Gérez les articles, les prix, les catégories et les niveaux de stock.
        </p>
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
          description={
            search
              ? "Aucun produit ne correspond à votre recherche."
              : "Commencez par ajouter votre premier produit."
          }
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
                    <td className="px-5 py-3">
                      {product.category?.name ?? "—"}
                    </td>
                    <td className="px-5 py-3">{money(product.price)}</td>
                    <td className="px-5 py-3">{product.stock}</td>
                    <td className="px-5 py-3 text-zinc-500">{product.sku}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(product)}
                        >
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
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Modifier le produit" : "Ajouter un produit"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" {...form.register("slug")} />
              {form.formState.errors.slug && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.slug.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" {...form.register("description")} />
              {form.formState.errors.description && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Prix</Label>
                <Input id="price" type="number" {...form.register("price")} />
                {form.formState.errors.price && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.price.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="costPrice">Prix coûtant</Label>
                <Input
                  id="costPrice"
                  type="number"
                  {...form.register("costPrice")}
                />
                {form.formState.errors.costPrice && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.costPrice.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" {...form.register("stock")} />
                {form.formState.errors.stock && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.stock.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" {...form.register("sku")} />
                {form.formState.errors.sku && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.sku.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select
                value={form.watch("categoryId")}
                onValueChange={(val) =>
                  form.setValue("categoryId", val, { shouldValidate: true })
                }
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
              {form.formState.errors.categoryId && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.categoryId.message}
                </p>
              )}
            </div>

            {/* Image Upload / URL Section */}
            <div className="space-y-2">
              <Label>Images du produit</Label>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WEBP — max 5MB chacune — jusqu&apos;à 6 images
              </p>

              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">
                    <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
                    Uploader
                  </TabsTrigger>
                  <TabsTrigger value="url">
                    <Link2 className="mr-1.5 h-3.5 w-3.5" />
                    URL
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="mt-3">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {imageFiles.map((f, i) => {
                      const src =
                        f instanceof File ? URL.createObjectURL(f) : f;
                      return (
                        <div
                          key={i}
                          className="relative aspect-square rounded-lg overflow-hidden border border-border group"
                        >
                          <Image
                            src={src}
                            alt={`product-img-${i}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(i)}
                            className="absolute top-1 right-1 size-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="size-3" />
                          </button>
                          {isUploading && f instanceof File && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {imageFiles.length < 6 && (
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={isUploading}
                        className={cn(
                          "aspect-square rounded-lg border-2 border-dashed border-gold-400/60 flex flex-col items-center justify-center gap-1",
                          "text-muted-foreground hover:border-gold-500 hover:bg-gold-50 dark:hover:bg-gold-950/20 transition-colors",
                          isUploading && "opacity-50 cursor-not-allowed",
                        )}
                      >
                        <ImageIcon className="size-5" />
                        <span className="text-[11px]">Ajouter</span>
                      </button>
                    )}
                  </div>
                  <input
                    ref={imageInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files && handleAddImages(e.target.files)
                    }
                  />
                </TabsContent>
                <TabsContent value="url" className="mt-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddUrl();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddUrl}
                      disabled={imageFiles.length >= 6}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {imageFiles.filter((f) => typeof f === "string").length >
                    0 && (
                    <div className="mt-2 space-y-1">
                      {imageFiles.map((f, i) =>
                        typeof f === "string" ? (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-xs text-zinc-500"
                          >
                            <span className="truncate flex-1">{f}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(i)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="size-3" />
                            </button>
                          </div>
                        ) : null,
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              {form.formState.errors.images && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.images.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  setEditing(null);
                }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={
                  isUploading ||
                  createProduct.isPending ||
                  updateProduct.isPending
                }
              >
                {isUploading
                  ? "Upload en cours..."
                  : editing
                    ? "Enregistrer"
                    : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
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
