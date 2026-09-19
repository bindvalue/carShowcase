"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAdminVeiculos,
  getAdminVeiculosCounts,
  getMarcasParaFiltro,
  toggleVeiculoAtivo,
  deleteVeiculo,
  getVeiculoByIdAdmin,
  arquivarVeiculo,
  restaurarVeiculo,
  createVeiculo, 
  type AdminVeiculosFiltros,
  type VeiculoCreateInput, 
} from "@/services/admin-veiculos.service";

// ==========================================
// QUERIES
// ==========================================

export function useAdminVeiculos(filtros: AdminVeiculosFiltros = {}) {
  return useQuery({
    queryKey: ["admin-veiculos", filtros],
    queryFn: () => getAdminVeiculos(filtros),
    staleTime: 30 * 1000,
  });
}

export function useAdminVeiculosCounts() {
  return useQuery({
    queryKey: ["admin-veiculos", "counts"],
    queryFn: getAdminVeiculosCounts,
    staleTime: 30 * 1000,
  });
}

export function useMarcasParaFiltro() {
  return useQuery({
    queryKey: ["admin-veiculos", "marcas-filtro"],
    queryFn: getMarcasParaFiltro,
    staleTime: 5 * 60 * 1000,
  });
}

export function useVeiculoAdmin(id: string | null | undefined) {
  return useQuery({
    queryKey: ["admin-veiculos", "detalhe", id],
    queryFn: () => getVeiculoByIdAdmin(id!),
    enabled: !!id,
  });
}

// ==========================================
// MUTATIONS
// ==========================================

export function useToggleVeiculoAtivo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ativo,
    }: {
      id: string;
      ativo: boolean;
    }) => toggleVeiculoAtivo(id, ativo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-veiculos"] });
      queryClient.invalidateQueries({ queryKey: ["veiculos"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Status atualizado!");
    },
    onError: (err) => {
      toast.error("Erro ao atualizar", {
        description: err instanceof Error ? err.message : "Tente novamente",
      });
    },
  });
}

export function useDeleteVeiculo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteVeiculo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-veiculos"] });
      queryClient.invalidateQueries({ queryKey: ["veiculos"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Veículo excluído!");
    },
    onError: (err) => {
      toast.error("Erro ao excluir", {
        description: err instanceof Error ? err.message : "Tente novamente",
      });
    },
  });
}

// ==========================================
// ARQUIVAR VEÍCULO (vendido/removido)
// ==========================================

export function useArquivarVeiculo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "vendido" | "removido";
    }) => arquivarVeiculo(id, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-veiculos"] });
      queryClient.invalidateQueries({ queryKey: ["veiculos"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });

      toast.success(
        variables.status === "vendido"
          ? "Veículo marcado como vendido"
          : "Veículo removido do estoque",
        {
          description: data.imagensRemovidas > 0
            ? `${data.imagensRemovidas} ${data.imagensRemovidas === 1 ? "imagem apagada" : "imagens apagadas"}`
            : "Nenhuma imagem para apagar",
        }
      );
    },
    onError: (err) => {
      toast.error("Erro ao arquivar veículo", {
        description: err instanceof Error ? err.message : "Tente novamente",
      });
    },
  });
}

// ==========================================
// RESTAURAR VEÍCULO
// ==========================================

export function useRestaurarVeiculo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => restaurarVeiculo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-veiculos"] });
      queryClient.invalidateQueries({ queryKey: ["veiculos"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Veículo restaurado ao estoque!");
    },
    onError: (err) => {
      toast.error("Erro ao restaurar veículo", {
        description: err instanceof Error ? err.message : "Tente novamente",
      });
    },
  });
}

export function useCreateVeiculo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: VeiculoCreateInput) => createVeiculo(dados),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-veiculos"] });
      queryClient.invalidateQueries({ queryKey: ["veiculos"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Veículo cadastrado!", {
        description: `${data.marca} ${data.modelo} ${data.ano}`,
      });
    },
    onError: (err) => {
      toast.error("Erro ao cadastrar veículo", {
        description: err instanceof Error ? err.message : "Tente novamente",
      });
    },
  });
}