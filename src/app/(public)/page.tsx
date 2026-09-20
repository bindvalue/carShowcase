"use client";

import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleCard } from "@/components/veiculos/vehicle-card";
import { VehicleSort } from "@/components/veiculos/vehicle-sort";
import { ActiveFilters } from "@/components/veiculos/active-filters";
import { FilterCollapse } from "@/components/veiculos/filter-collapse";
import { FilterMobileDrawer } from "@/components/veiculos/filter-mobile-drawer";
import { useVehicleFilters } from "@/hooks/use-vehicle-filters";
import { useFilteredVeiculos } from "@/hooks/use-filtered-veiculos";
import { useTotalVeiculosAtivos } from "@/hooks/use-veiculos";
import type { VeiculoOrdenacao } from "@/types/veiculo";

function VehicleCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border">
      <Skeleton className="aspect-[16/10] w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-8 w-1/3 mt-4" />
      </div>
    </div>
  );
}

function HomeContent() {
  const { getSingleParam, setParams, toggleArrayParam, clearFilters } =
    useVehicleFilters();

  const { veiculos, loading, error, activeFilterChips, hasFilters } =
    useFilteredVeiculos();

  const { data: totalAtivos = 0 } = useTotalVeiculosAtivos();

  const ordem = (getSingleParam("ordem") as VeiculoOrdenacao) || "recentes";

  const veiculosExibidos = hasFilters ? veiculos : veiculos.slice(0, 6);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-zinc-100 via-background to-background">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        />

        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium mb-6">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              {totalAtivos}{" "}
              {totalAtivos === 1
                ? "veículo disponível"
                : "veículos disponíveis"}
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              Encontre o carro dos seus{" "}
              <span className="text-primary">sonhos</span>
            </h1>

            <p className="mt-5 text-base text-muted-foreground md:text-lg">
              Milhares de veículos selecionados, com procedência garantida e as
              melhores condições do mercado.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">
                  Procedência garantida
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <BadgeCheck className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">Revisão completa</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">Melhores preços</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTEÚDO */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
          <span>Home</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">
            {hasFilters ? "Resultados filtrados" : "Destaques"}
          </span>
        </nav>

        <div className="flex gap-8">
          {/* ⬇️ Sidebar com collapse (desktop) */}
          <FilterCollapse />

          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {hasFilters
                      ? "Resultados filtrados"
                      : "Destaques da semana"}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {loading
                      ? "Carregando..."
                      : hasFilters
                      ? `${veiculos.length} ${
                          veiculos.length === 1
                            ? "veículo encontrado"
                            : "veículos encontrados"
                        }`
                      : "Os veículos mais procurados dos últimos 7 dias"}
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

            {/* GRID */}
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
            ) : veiculosExibidos.length === 0 ? (
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
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {veiculosExibidos.map((veiculo) => (
                    <VehicleCard key={veiculo.id} veiculo={veiculo} />
                  ))}
                </div>

                {!hasFilters && veiculos.length > 6 && (
                  <div className="mt-10 flex flex-col items-center gap-3">
                    <Button
                      asChild
                      size="lg"
                      className="w-full sm:w-auto px-8"
                    >
                      <Link href="/veiculos">
                        Ver catálogo completo
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      {totalAtivos} veículos disponíveis no total
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold md:text-3xl">
            Não encontrou o que procurava?
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Fale com nossa equipe e encontraremos o veículo ideal para você.
          </p>
          <Button size="lg" className="mt-6">
            Falar com um especialista
          </Button>
        </div>
      </section>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-6">Carregando...</div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}