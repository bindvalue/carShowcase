"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useVeiculos } from "./use-veiculos";
import type { VeiculoOrdenacao, VeiculoFiltros } from "@/types/veiculo";

export function useFilteredVeiculos() {
  const searchParams = useSearchParams();

  const filtros: VeiculoFiltros = useMemo(() => {
    const marcas = searchParams.get("marca")?.split(",").filter(Boolean) ?? [];
    const modelos =
      searchParams.get("modelo")?.split(",").filter(Boolean) ?? [];
    const cambio = searchParams.get("cambio")?.split(",").filter(Boolean) ?? [];
    const combustivel =
      searchParams.get("combustivel")?.split(",").filter(Boolean) ?? [];
    const cor = searchParams.get("cor")?.split(",").filter(Boolean) ?? [];

    const anoMin = Number(searchParams.get("anoMin")) || undefined;
    const anoMax = Number(searchParams.get("anoMax")) || undefined;
    const precoMin = Number(searchParams.get("precoMin")) || undefined;
    const precoMax = Number(searchParams.get("precoMax")) || undefined;
    const kmMin = Number(searchParams.get("kmMin")) || undefined;
    const kmMax = Number(searchParams.get("kmMax")) || undefined;
    const search = searchParams.get("search") || undefined;
    const tipo = searchParams.get("tipo") as "carro" | "moto" | null;
    const cidade = searchParams.get("cidade") || undefined;
    const estado = searchParams.get("estado") || undefined;
    const ordenacao =
      (searchParams.get("ordem") as VeiculoOrdenacao) || "recentes";

    return {
      tipo: tipo || undefined,
      cidade,
      estado,
      marcas,
      modelos,
      cambio,
      combustivel,
      cor,
      anoMin,
      anoMax,
      precoMin,
      precoMax,
      kmMin,
      kmMax,
      search,
      ordenacao,
    };
  }, [searchParams]);

  const { data, isLoading, isError, error, refetch } = useVeiculos(filtros);

  const activeFilterChips = useMemo(() => {
    const chips: { key: string; value: string; label: string }[] = [];

    // ── Filtros novos ──
    if (filtros.tipo) {
      chips.push({
        key: "tipo",
        value: filtros.tipo,
        label: filtros.tipo === "carro" ? "Carros" : "Motos",
      });
    }

    if (filtros.estado) {
      chips.push({
        key: "estado",
        value: filtros.estado,
        label: filtros.estado,
      });
    }

    if (filtros.cidade) {
      chips.push({
        key: "cidade",
        value: filtros.cidade,
        label: filtros.cidade,
      });
    }

    // ── Filtros existentes ──
    filtros.marcas?.forEach((m) =>
      chips.push({ key: "marca", value: m, label: m })
    );
    filtros.modelos?.forEach((m) =>
      chips.push({ key: "modelo", value: m, label: m })
    );
    filtros.cambio?.forEach((c) =>
      chips.push({ key: "cambio", value: c, label: c })
    );
    filtros.combustivel?.forEach((c) =>
      chips.push({ key: "combustivel", value: c, label: c })
    );
    filtros.cor?.forEach((c) => chips.push({ key: "cor", value: c, label: c }));

    return chips;
  }, [filtros]);

  const hasFilters = activeFilterChips.length > 0;

  return {
    veiculos: data ?? [],
    loading: isLoading,
    error: isError ? error : null,
    refetch,
    activeFilterChips,
    hasFilters,
    totalSemFiltros: 0,
  };
}