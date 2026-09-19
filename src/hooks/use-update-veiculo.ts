"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  updateVeiculo,
  uploadVeiculoImagem,
  uploadMultiplasImagens,
  type VeiculoUpdateInput,
} from "@/services/admin-veiculos.service";

// ==========================================
// UPDATE VEÍCULO
// ==========================================

export function useUpdateVeiculo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      dados,
    }: {
      id: string;
      dados: Partial<VeiculoUpdateInput>;
    }) => updateVeiculo(id, dados),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-veiculos"] });
      queryClient.invalidateQueries({ queryKey: ["veiculos"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-veiculos", "detalhe", variables.id],
      });
      toast.success("Veículo atualizado!");
    },
    onError: (err) => {
      toast.error("Erro ao atualizar", {
        description: err instanceof Error ? err.message : "Tente novamente",
      });
    },
  });
}

// ==========================================
// UPLOAD DE UMA IMAGEM
// ==========================================

export function useUploadVeiculoImagem() {
  return useMutation({
    mutationFn: ({
      veiculoId,
      file,
    }: {
      veiculoId: string;
      file: File;
    }) => uploadVeiculoImagem(veiculoId, file),
    onError: (err) => {
      toast.error("Erro ao enviar imagem", {
        description: err instanceof Error ? err.message : "Tente novamente",
      });
    },
  });
}

// ==========================================
// UPLOAD DE MÚLTIPLAS IMAGENS
// ==========================================

export function useUploadMultiplasImagens() {
  return useMutation({
    mutationFn: ({
      veiculoId,
      files,
    }: {
      veiculoId: string;
      files: File[];
    }) => uploadMultiplasImagens(veiculoId, files),
    onError: (err) => {
      toast.error("Erro ao enviar imagens", {
        description: err instanceof Error ? err.message : "Tente novamente",
      });
    },
  });
}