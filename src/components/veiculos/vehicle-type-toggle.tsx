"use client";

import { Car, Motorbike } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVehicleFilters } from "@/hooks/use-vehicle-filters";

export function VehicleTypeToggle() {
  const { getSingleParam, setParams } = useVehicleFilters();

  const tipoAtual = getSingleParam("tipo") as "carro" | "moto" | null;

  const handleClick = (tipo: "carro" | "moto") => {
    if (tipoAtual === tipo) {
      setParams({ tipo: null });
    } else {
      setParams({ tipo });
    }
  };

  return (
    <div className="rounded-full bg-muted p-1 flex gap-1">
      <button
        type="button"
        onClick={() => handleClick("carro")}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
          tipoAtual === "carro"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Car className="h-4 w-4" />
        Carros
      </button>

      <button
        type="button"
        onClick={() => handleClick("moto")}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
          tipoAtual === "moto"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Motorbike className="h-4 w-4" />
        Motos
      </button>
    </div>
  );
}