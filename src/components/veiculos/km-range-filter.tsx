"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatKM } from "@/lib/formatters";

interface KmRangeFilterProps {
  min: number;
  max: number;
  currentMin?: number;
  currentMax?: number;
  onApply: (min: number, max: number) => void;
}

export function KmRangeFilter({
  min,
  max,
  currentMin,
  currentMax,
  onApply,
}: KmRangeFilterProps) {
  const [localMin, setLocalMin] = useState<string>(
    currentMin != null ? String(currentMin) : ""
  );
  const [localMax, setLocalMax] = useState<string>(
    currentMax != null ? String(currentMax) : ""
  );

  useEffect(() => {
    setLocalMin(currentMin != null ? String(currentMin) : "");
  }, [currentMin]);

  useEffect(() => {
    setLocalMax(currentMax != null ? String(currentMax) : "");
  }, [currentMax]);

  const handleApply = () => {
    const minVal = localMin === "" ? min : Number(localMin);
    const maxVal = localMax === "" ? max : Number(localMax);
    onApply(minVal, maxVal);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-muted-foreground">Mínimo</label>
          <Input
            type="number"
            inputMode="numeric"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            className="h-9"
            placeholder="0"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Máximo</label>
          <Input
            type="number"
            inputMode="numeric"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            className="h-9"
            placeholder="0"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {formatKM(localMin === "" ? min : Number(localMin))} —{" "}
        {formatKM(localMax === "" ? max : Number(localMax))}
      </p>

      <Button
        size="sm"
        variant="outline"
        className="w-full"
        onClick={handleApply}
      >
        Aplicar faixa
      </Button>
    </div>
  );
}