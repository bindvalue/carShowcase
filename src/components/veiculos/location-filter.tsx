"use client";

import { useState } from "react";
import { MapPin, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVehicleFilters } from "@/hooks/use-vehicle-filters";
import { useEstadosDisponiveis } from "@/hooks/use-veiculos";

export function LocationFilter() {
  const { getSingleParam, setParams } = useVehicleFilters();
  const { data: estados = [] } = useEstadosDisponiveis();

  const estadoAtual = getSingleParam("estado") || "";
  const cidadeAtual = getSingleParam("cidade") || "";

  const [cidadeLocal, setCidadeLocal] = useState(cidadeAtual);

  const handleCidadeChange = () => {
    const valor = cidadeLocal.trim();
    setParams({ cidade: valor || null });
  };

  const handleEstadoChange = (value: string) => {
    setParams({
      estado: value === "todos" ? null : value,
      cidade: null,
    });
    setCidadeLocal("");
  };

  return (
    <div className="space-y-3">
      {/* Estado */}
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block">
          Estado
        </label>
        <Select
          value={estadoAtual || "todos"}
          onValueChange={handleEstadoChange}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Todos os estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os estados</SelectItem>
            {estados.map((uf) => (
              <SelectItem key={uf} value={uf}>
                {uf}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cidade */}
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block">
          Cidade
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Digite sua cidade"
            className="pl-10 pr-10 h-10"
            value={cidadeLocal}
            onChange={(e) => setCidadeLocal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCidadeChange();
            }}
            onBlur={handleCidadeChange}
          />
          {cidadeLocal && (
            <button
              type="button"
              onClick={() => {
                setCidadeLocal("");
                setParams({ cidade: null });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Limpar cidade"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">
          Pressione Enter para buscar
        </p>
      </div>
    </div>
  );
}