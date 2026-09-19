"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface YearRangeFilterProps {
  min: number;
  max: number;
  currentMin?: number;
  currentMax?: number;
  onApply: (min: number, max: number) => void;
}

export function YearRangeFilter({
  min,
  max,
  currentMin,
  currentMax,
  onApply,
}: YearRangeFilterProps) {
  const [localMin, setLocalMin] = useState<string>(
    currentMin != null ? String(currentMin) : ""
  );
  const [localMax, setLocalMax] = useState<string>(
    currentMax != null ? String(currentMax) : ""
  );

  // Sincroniza quando os valores externos mudam (limpar filtros, etc.)
  useEffect(() => {
    setLocalMin(currentMin != null ? String(currentMin) : "");
  }, [currentMin]);

  useEffect(() => {
    setLocalMax(currentMax != null ? String(currentMax) : "");
  }, [currentMax]);

  // Gera lista de anos (do mais recente para o mais antigo)
  const anos = Array.from({ length: 15 }, (_, i) => max - i); // últimos 15 anos

  const handleApply = () => {
    const minVal = localMin === "" ? min : Number(localMin);
    const maxVal = localMax === "" ? max : Number(localMax);
    onApply(minVal, maxVal);
  };

  const handleClickYear = (ano: number) => {
    // Clica no chip → aplica ano específico
    setLocalMin(String(ano));
    setLocalMax(String(ano));
    onApply(ano, ano);
  };

  // Verifica se um ano está ativo (selecionado)
  const isYearActive = (ano: number) => {
    return (
      localMin === String(ano) && localMax === String(ano)
    );
  };

  return (
    <div className="space-y-4">
      {/* Range numérico */}
      <div>
        <label className="text-xs font-medium text-muted-foreground">
          Escolher um intervalo
        </label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Input
            type="number"
            inputMode="numeric"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            className="h-10"
            placeholder="Ano mínimo"
          />
          <Input
            type="number"
            inputMode="numeric"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            className="h-10"
            placeholder="Ano máximo"
          />
        </div>
      </div>

      {/* Chips de anos */}
      <div>
        <label className="text-xs font-medium text-muted-foreground">
          Escolher um ano específico
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {anos.map((ano) => (
            <button
              key={ano}
              type="button"
              onClick={() => handleClickYear(ano)}
              className={cn(
                "flex h-10 min-w-[60px] items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors",
                isYearActive(ano)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:bg-muted hover:border-foreground/30"
              )}
            >
              {ano}
            </button>
          ))}
        </div>
      </div>

      {/* Botão aplicar (para o range numérico) */}
      <Button
        size="sm"
        variant="outline"
        className="w-full"
        onClick={handleApply}
      >
        Aplicar intervalo
      </Button>
    </div>
  );
}