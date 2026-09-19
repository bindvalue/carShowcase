"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getMarcas,
  createMarca,
} from "@/services/marcas.service";
import {
  getModelosPorMarca,
  createModelo,
} from "@/services/modelos.service";
import { getCores, createCor } from "@/services/cores.service";
import { getMotores, createMotor } from "@/services/motores.service";
// ═══════════════════════════════════════
// MARCAS
// ═══════════════════════════════════════

export function useMarcas() {
  return useQuery({
    queryKey: ["catalogos", "marcas"],
    queryFn: getMarcas,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateMarca() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nome: string) => createMarca(nome),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["catalogos", "marcas"] });
      toast.success(`Marca "${data.nome}" adicionada!`);
    },
    onError: (err) => {
      toast.error("Erro ao criar marca", {
        description: err instanceof Error ? err.message : "Tente novamente",
      });
    },
  });
}

// ═══════════════════════════════════════
// MODELOS
// ═══════════════════════════════════════

export function useModelos(marcaId?: string) {
  return useQuery({
    queryKey: ["catalogos", "modelos", marcaId ?? "todas"],
    queryFn: () => (marcaId ? getModelosPorMarca(marcaId) : Promise.resolve([])),
    staleTime: 10 * 60 * 1000,
    enabled: !!marcaId,
  });
}

export function useCreateModelo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ nome, marcaId }: { nome: string; marcaId: string }) =>
      createModelo(nome, marcaId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["catalogos", "modelos"],
      });
      toast.success(`Modelo "${data.nome}" adicionado!`);
    },
    onError: (err) => {
      toast.error("Erro ao criar modelo", {
        description: err instanceof Error ? err.message : "Tente novamente",
      });
    },
  });
}

// ═══════════════════════════════════════
// CORES
// ═══════════════════════════════════════

export function useCores() {
  return useQuery({
    queryKey: ["catalogos", "cores"],
    queryFn: getCores,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateCor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ nome, hex }: { nome: string; hex?: string }) =>
      createCor(nome, hex),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["catalogos", "cores"] });
      toast.success(`Cor "${data.nome}" adicionada!`);
    },
    onError: (err) => {
      toast.error("Erro ao criar cor", {
        description: err instanceof Error ? err.message : "Tente novamente",
      });
    },
  });
}
// ═══════════════════════════════════════
// MOTORES
// ═══════════════════════════════════════

export function useMotores() {
  return useQuery({
    queryKey: ["catalogos", "motores"],
    queryFn: getMotores,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateMotor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nome: string) => createMotor(nome),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["catalogos", "motores"] });
      toast.success(`Motor "${data.nome}" adicionado!`);
    },
    onError: (err) => {
      toast.error("Erro ao criar motor", {
        description: err instanceof Error ? err.message : "Tente novamente",
      });
    },
  });
}