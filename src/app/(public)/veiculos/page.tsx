"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleGrid } from "@/components/veiculos/vehicle-grid";
import { VehicleSort } from "@/components/veiculos/vehicle-sort";
import { ActiveFilters } from "@/components/veiculos/active-filters";
import { FilterCollapse } from "@/components/veiculos/filter-collapse";
import { FilterMobileDrawer } from "@/components/veiculos/filter-mobile-drawer";
import { useVehicleFilters } from "@/hooks/use-vehicle-filters";
import { useFilteredVeiculos } from "@/hooks/use-filtered-veiculos";
import type { VeiculoOrdenacao } from "@/types/veiculo";

function VehicleCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border animate-pulse">
      <div className="aspect-[16/10] w-full bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 bg-muted rounded" />
        <div className="h-3 w-1/2 bg-muted rounded" />
        <div className="h-3 w-2/3 bg-muted rounded" />
        <div className="h-8 w-1/3 mt-4 bg-muted rounded" />
      </div>
    </div>
  );
}

function VeiculosContent() {
  const { getSingleParam, setParams, toggleArrayParam, clearFilters } =
    useVehicleFilters();

  const { veiculos, loading, error, activeFilterChips } = useFilteredVeiculos();

  const ordem = (getSingleParam("ordem") as VeiculoOrdenacao) || "recentes";

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">Veículos</span>
      </nav>

      <div className="flex gap-8">
        {/* ⬇️ Sidebar com collapse (desktop) */}
        <FilterCollapse />

        {/* Conteúdo principal */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold">Veículos</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {loading
                    ? "Carregando..."
                    : `${veiculos.length} ${
                        veiculos.length === 1
                          ? "veículo encontrado"
                          : "veículos encontrados"
                      }`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* ⬇️ Bottom sheet (mobile) */}
                <FilterMobileDrawer
                  activeCount={activeFilterChips.length}
                />

                <VehicleSort
                  value={ordem}
                  onChange={(v) => setParams({ ordem: v })}
                />
              </div>
            </div>

            <ActiveFilters
              filters={activeFilterChips}
              onRemove={(key, value) => toggleArrayParam(key, value)}
              onClearAll={clearFilters}
            />
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <VehicleCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-lg font-semibold text-destructive">
                Erro ao carregar veículos
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "Tente novamente."}
              </p>
            </div>
          ) : veiculos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-lg font-semibold">
                Nenhum veículo encontrado
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Tente ajustar os filtros ou limpar a busca.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={clearFilters}
              >
                Limpar filtros
              </Button>
            </div>
          ) : (
            <VehicleGrid veiculos={veiculos} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function VeiculosPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-6">Carregando...</div>
      }
    >
      <VeiculosContent />
    </Suspense>
  );
}