"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function useVehicleFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Lê um parâmetro (único ou lista)
  const getParam = useCallback(
    (key: string): string[] => {
      const value = searchParams.get(key);
      return value ? value.split(",").filter(Boolean) : [];
    },
    [searchParams]
  );

  const getSingleParam = useCallback(
    (key: string): string | null => {
      return searchParams.get(key);
    },
    [searchParams]
  );

  // Atualiza a URL com novos parâmetros
  const setParams = useCallback(
    (updates: Record<string, string | string[] | number | null | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
          params.delete(key);
        } else if (Array.isArray(value)) {
          params.set(key, value.join(","));
        } else {
          params.set(key, String(value));
        }
      });

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // Adiciona/remove um item de um filtro multi-seleção
  const toggleArrayParam = useCallback(
    (key: string, value: string) => {
      const current = getParam(key);
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];

      setParams({ [key]: next });
    },
    [getParam, setParams]
  );

  // Limpa todos os filtros
  const clearFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  return {
    getParam,
    getSingleParam,
    setParams,
    toggleArrayParam,
    clearFilters,
    searchParams,
  };
}