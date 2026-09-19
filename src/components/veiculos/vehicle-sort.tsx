"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { VeiculoOrdenacao } from "@/types/veiculo";

interface VehicleSortProps {
  value: VeiculoOrdenacao;
  onChange: (value: VeiculoOrdenacao) => void;
}

export function VehicleSort({ value, onChange }: VehicleSortProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as VeiculoOrdenacao)}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Ordenar por" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="recentes">Mais recentes</SelectItem>
        <SelectItem value="preco-asc">Menor preço</SelectItem>
        <SelectItem value="preco-desc">Maior preço</SelectItem>
        <SelectItem value="ano-desc">Mais novo</SelectItem>
        <SelectItem value="ano-asc">Mais antigo</SelectItem>
        <SelectItem value="km-asc">Menor KM</SelectItem>
      </SelectContent>
    </Select>
  );
}