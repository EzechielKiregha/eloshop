"use client";

import { Suspense, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { PublicHeader } from "@/components/public-header";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { getProducts } from "@/services/products";
import { getCategories } from "@/services/categories";
import type { Category, Product } from "@/lib/types";
import { useSearchParams } from "next/navigation";

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopSkeleton />}>
      <ShopContent />
    </Suspense>
  );
}

function ShopSkeleton() {
  return (
    <main>
      <PublicHeader />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-12 w-48 rounded-xl" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-2xl" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categorySlug, setCategorySlug] = useState(initialCategory);
  const [sort, setSort] = useState("newest");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  // Resolve category slug to id
  const resolvedCategoryId = categorySlug
    ? categories.find((c) => c.slug === categorySlug)?.id || categoryId
    : categoryId;

  const { data, isLoading } = useQuery({
    queryKey: ["products", search, resolvedCategoryId, sort],
    queryFn: () =>
      getProducts({
        search: search || undefined,
        categoryId: resolvedCategoryId || undefined,
        sort,
        pageSize: 50,
      }),
  });

  const products: Product[] = data?.data || [];

  const clearFilters = () => {
    setSearch("");
    setCategoryId("");
    setCategorySlug("");
    setSort("newest");
  };

  const hasFilters = search || categoryId || categorySlug || sort !== "newest";

  const FiltersContent = () => (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium">Catégorie</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => {
              setCategoryId("");
              setCategorySlug("");
            }}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${!resolvedCategoryId ? "border-zinc-900 bg-gold-400 text-white dark:border-zinc-50 dark:bg-gold-400 dark:text-zinc-900" : "hover:border-zinc-400"}`}
          >
            Tous
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setCategoryId(cat.id);
                setCategorySlug("");
              }}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${resolvedCategoryId === cat.id ? "border-zinc-900 bg-gold-400 text-white dark:border-zinc-50 dark:bg-gold-400 dark:text-zinc-900" : "hover:border-zinc-400"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium">Tri</p>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="mt-3 ">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="text-gold-600 dark:text-zinc-100">
            <SelectItem value="newest" className="dark:hover:text-gold-500">
              Plus récents
            </SelectItem>
            <SelectItem value="price_asc" className="dark:hover:text-gold-500">
              Prix croissant
            </SelectItem>
            <SelectItem value="price_desc" className="dark:hover:text-gold-500">
              Prix décroissant
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="mr-1 h-3 w-3" /> Effacer les filtres
        </Button>
      )}
    </div>
  );

  return (
    <main>
      <PublicHeader />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 border-b pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
              Catalogue
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              Boutique
            </h1>
          </div>
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Rechercher un produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Desktop filters */}
          <aside className="hidden rounded-2xl border bg-white p-5 shadow-sm dark:bg-zinc-900 lg:block">
            <h2 className="font-semibold">Filtres</h2>
            <div className="mt-5">
              <FiltersContent />
            </div>
          </aside>

          <div>
            {/* Mobile filters */}
            <div className="mb-5 flex items-center justify-between lg:hidden">
              <Sheet
                open={mobileFiltersOpen}
                onOpenChange={setMobileFiltersOpen}
              >
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="mr-2 h-4 w-4" /> Filtres
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filtres</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FiltersContent />
                  </div>
                </SheetContent>
              </Sheet>
              <p className="text-sm text-zinc-500">
                {products.length} produit{products.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Product grid */}
            {isLoading ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square w-full rounded-2xl" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-lg font-medium">Aucun produit trouvé</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Essayez d&apos;ajuster vos filtres
                </p>
                {hasFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={clearFilters}
                  >
                    Effacer les filtres
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
