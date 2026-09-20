"use client";

import { Combobox } from "@/components/ui/combobox";
import type { VeiculoOrdenacao } from "@/types/veiculo";

interface VehicleSortProps {
  value: VeiculoOrdenacao;
  onChange: (value: VeiculoOrdenacao) => void;
}

const OPCOES_ORDENACAO = [
  { value: "recentes", label: "Mais recentes" },
  { value: "preco-asc", label: "Menor preço" },
  { value: "preco-desc", label: "Maior preço" },
  { value: "ano-desc", label: "Mais novo" },
  { value: "ano-asc", label: "Mais antigo" },
  { value: "km-asc", label: "Menor KM" },
];

export function VehicleSort({ value, onChange }: VehicleSortProps) {
  return (
    <Combobox
      options={OPCOES_ORDENACAO}
      value={value}
      onChange={(v) => onChange(v as VeiculoOrdenacao)}
      placeholder="Ordenar por"
      searchPlaceholder="Buscar ordenação..."
      modal={false}
      className="w-full sm:w-[180px] !h-10"
    />
  );
}