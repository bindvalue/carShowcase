"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getVeiculos,
  getVeiculosDestaque,
  getVeiculoById,
  getVeiculoBySlug,
  getMarcasDisponiveis,
  getModelosDisponiveis,
  getCoresDisponiveis,
  getTotalVeiculosAtivos,
  getEstadosDisponiveis,
  getCidadesDisponiveis,
} from "@/services/veiculos.service";
import type { VeiculoFiltros } from "@/types/veiculo";

// ==========================================
// QUERIES DE VEÍCULOS
// ==========================================

export function useVeiculos(filtros: VeiculoFiltros = {}) {
  return useQuery({
    queryKey: ["veiculos", filtros],
    queryFn: () => getVeiculos(filtros),
  });
}

export function useVeiculosDestaque(limit = 6) {
  return useQuery({
    queryKey: ["veiculos", "destaque", limit],
    queryFn: () => getVeiculosDestaque(limit),
  });
}

export function useVeiculo(id: string | null | undefined) {
  return useQuery({
    queryKey: ["veiculo", id],
    queryFn: () => getVeiculoById(id!),
    enabled: !!id,
  });
}

export function useVeiculoBySlug(slug: string | null | undefined) {
  return useQuery({
    queryKey: ["veiculo", "slug", slug],
    queryFn: () => getVeiculoBySlug(slug!),
    enabled: !!slug,
  });
}

// ==========================================
// QUERIES DE FILTROS
// ==========================================

export function useMarcasDisponiveis() {
  return useQuery({
    queryKey: ["filtros", "marcas"],
    queryFn: getMarcasDisponiveis,
    staleTime: 5 * 60 * 1000,
  });
}

export function useModelosDisponiveis(marcas?: string[]) {
  return useQuery({
    queryKey: ["filtros", "modelos", marcas ?? []],
    queryFn: () => getModelosDisponiveis(marcas),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCoresDisponiveis() {
  return useQuery({
    queryKey: ["filtros", "cores"],
    queryFn: getCoresDisponiveis,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTotalVeiculosAtivos() {
  return useQuery({
    queryKey: ["veiculos", "total-ativos"],
    queryFn: getTotalVeiculosAtivos,
    staleTime: 5 * 60 * 1000,
  });
}

export function useEstadosDisponiveis() {
  return useQuery({
    queryKey: ["filtros", "estados"],
    queryFn: getEstadosDisponiveis,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCidadesDisponiveis(estado?: string) {
  return useQuery({
    queryKey: ["filtros", "cidades", estado ?? "todos"],
    queryFn: () => getCidadesDisponiveis(estado),
    staleTime: 5 * 60 * 1000,
  });
}