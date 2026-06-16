"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCategories } from "@/hooks/useCategories";
import { categorySchema } from "@/lib/validators";
import type { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Tags } from "lucide-react";

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function CategoriesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const { data: categories, isLoading, createCategory, updateCategory, deleteCategory } = useCategories();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", slug: "" },
  });

  useEffect(() => {
    if (editing) {
      form.reset({ name: editing.name, slug: editing.slug, image: editing.image ?? "" });
    } else {
      form.reset({ name: "", slug: "", image: "" });
    }
  }, [editing, form]);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setDialogOpen(true);
  }

  async function onSubmit(values: CategoryFormValues) {
    try {
      if (editing) {
        await updateCategory.mutateAsync({ id: editing.id, data: values });
        toast({ title: "Catégorie mise à jour" });
      } else {
        await createCategory.mutateAsync(values);
        toast({ title: "Catégorie créée" });
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
      await deleteCategory.mutateAsync(deleteTarget.id);
      toast({ title: "Catégorie supprimée" });
      setDeleteTarget(null);
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer cette catégorie.", variant: "destructive" });
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
        <h1 className="text-2xl font-bold tracking-tight">Catégories</h1>
        <p className="text-sm text-zinc-500">Organisez le catalogue par familles de produits.</p>
      </div>

      {/* Toolbar */}
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une catégorie
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <Card className="rounded-2xl border p-5">
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </Card>
      ) : !categories || categories.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="Aucune catégorie"
          description="Commencez par ajouter votre première catégorie."
        >
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une catégorie
          </Button>
        </EmptyState>
      ) : (
        <Card className="rounded-2xl border p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-zinc-500">
                  <th className="px-5 py-3 font-medium">Catégorie</th>
                  <th className="px-5 py-3 font-medium">Identifiant</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-b last:border-0">
                    <td className="px-5 py-3 font-medium">{category.name}</td>
                    <td className="px-5 py-3 text-zinc-500">{category.slug}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(category)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(category)}>
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

      {/* Category form dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier la catégorie" : "Ajouter une catégorie"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Nom</Label>
              <Input id="cat-name" {...form.register("name")} />
              {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-slug">Slug</Label>
              <Input id="cat-slug" {...form.register("slug")} />
              {form.formState.errors.slug && <p className="text-xs text-red-500">{form.formState.errors.slug.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-image">Image URL (optionnel)</Label>
              <Input id="cat-image" placeholder="https://example.com/image.jpg" {...form.register("image")} />
              {form.formState.errors.image && <p className="text-xs text-red-500">{form.formState.errors.image.message}</p>}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); setEditing(null); }}>
                Annuler
              </Button>
              <Button type="submit" disabled={createCategory.isPending || updateCategory.isPending}>
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
        title="Supprimer la catégorie"
        description={`Voulez-vous vraiment supprimer « ${deleteTarget?.name} » ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="destructive"
        loading={deleteCategory.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
