"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getSettings, updateSettings } from "@/services/settings.service";

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Record<string, string | null>) =>
      updateSettings(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success("Configurações salvas!");
    },
    onError: (err) => {
      toast.error("Erro ao salvar", {
        description: err instanceof Error ? err.message : "Tente novamente",
      });
    },
  });
}