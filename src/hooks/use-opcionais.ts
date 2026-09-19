"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getOpcionais,
  createOpcional,
  deleteOpcional,
} from "@/services/opcionais.service";

// ==========================================
// QUERIES
// ==========================================

export function useOpcionais() {
  return useQuery({
    queryKey: ["opcionais"],
    queryFn: getOpcionais,
    staleTime: 10 * 60 * 1000, // 10 min
  });
}

// ==========================================
// MUTATIONS
// ==========================================

export function useCreateOpcional() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      nome,
      categoria,
    }: {
      nome: string;
      categoria?: string;
    }) => createOpcional(nome, categoria),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["opcionais"] });
      toast.success(`"${data.nome}" adicionado!`);
    },
    onError: (err) => {
      toast.error("Erro ao criar opcional", {
        description: err instanceof Error ? err.message : "Tente novamente",
      });
    },
  });
}

export function useDeleteOpcional() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteOpcional(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opcionais"] });
      toast.success("Opcional removido!");
    },
    onError: (err) => {
      toast.error("Erro ao remover", {
        description: err instanceof Error ? err.message : "Tente novamente",
      });
    },
  });
}