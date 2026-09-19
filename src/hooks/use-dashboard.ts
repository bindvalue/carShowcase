"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  getDashboardStats,
  getVeiculosPorMarca,
  getCadastrosUltimos30Dias,
  getUltimosVeiculos,
  getVeiculosSemKm,
} from "@/services/dashboard.service";

// ==========================================
// HOOK: Força refetch em todas as queries do dashboard
// ==========================================

export function useDashboardRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("dashboard-veiculos")
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE
          schema: "public",
          table: "veiculos",
        },
        () => {
          // Invalida todas as queries do dashboard
          queryClient.invalidateQueries({ queryKey: ["dashboard"] });
          queryClient.invalidateQueries({ queryKey: ["veiculos"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

// ==========================================
// HOOKS DE DADOS
// ==========================================

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: getDashboardStats,
    staleTime: 30 * 1000, // 30s
  });
}

export function useVeiculosPorMarca() {
  return useQuery({
    queryKey: ["dashboard", "por-marca"],
    queryFn: getVeiculosPorMarca,
    staleTime: 60 * 1000,
  });
}

export function useCadastrosUltimos30Dias() {
  return useQuery({
    queryKey: ["dashboard", "cadastros-30d"],
    queryFn: getCadastrosUltimos30Dias,
    staleTime: 60 * 1000,
  });
}

export function useUltimosVeiculos(limit = 5) {
  return useQuery({
    queryKey: ["dashboard", "ultimos", limit],
    queryFn: () => getUltimosVeiculos(limit),
    staleTime: 30 * 1000,
  });
}

export function useVeiculosSemKm(limit = 5) {
  return useQuery({
    queryKey: ["dashboard", "sem-km", limit],
    queryFn: () => getVeiculosSemKm(limit),
    staleTime: 30 * 1000,
  });
}