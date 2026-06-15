"use client";

import { useState } from "react";
import { useCustomers } from "@/hooks/useCustomers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { Search, Users, ChevronLeft, ChevronRight } from "lucide-react";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useCustomers({
    search: search || undefined,
    page,
    pageSize: 10,
  });

  const customers = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
        <p className="text-sm text-zinc-500">Consultez les profils clients et l&apos;historique de leurs commandes.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Rechercher un client..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
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
      ) : customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun client"
          description={search ? "Aucun client ne correspond à votre recherche." : "Les clients apparaîtront ici."}
        />
      ) : (
        <Card className="rounded-2xl border p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-zinc-500">
                  <th className="px-5 py-3 font-medium">Nom</th>
                  <th className="px-5 py-3 font-medium">Téléphone</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Rôle</th>
                  <th className="px-5 py-3 font-medium">Date d&apos;inscription</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b last:border-0">
                    <td className="px-5 py-3 font-medium">{customer.name}</td>
                    <td className="px-5 py-3">{customer.phone}</td>
                    <td className="px-5 py-3 text-zinc-500">{customer.email ?? "—"}</td>
                    <td className="px-5 py-3">
                      <Badge variant={customer.role === "ADMIN" ? "default" : "secondary"}>
                        {customer.role === "ADMIN" ? "Admin" : "Client"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-zinc-500">
                      {new Date(customer.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Précédent
          </Button>
          <span className="text-sm text-zinc-500">
            Page {page} sur {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Suivant
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
