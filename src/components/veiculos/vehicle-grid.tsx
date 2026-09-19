import { VehicleCard } from "./vehicle-card";
import type { Veiculo } from "@/types/veiculo";

interface VehicleGridProps {
  veiculos: Veiculo[];
}

export function VehicleGrid({ veiculos }: VehicleGridProps) {
  if (veiculos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-semibold">Nenhum veículo encontrado</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Tente ajustar os filtros ou limpar a busca.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {veiculos.map((veiculo) => (
        <VehicleCard key={veiculo.id} veiculo={veiculo} />
      ))}
    </div>
  );
}