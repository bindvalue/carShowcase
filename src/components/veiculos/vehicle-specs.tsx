import {
  Calendar,
  Gauge,
  Fuel,
  Settings2,
  Palette,
  Hash,
  Tag,
  Cog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getPlacaFinal, capitalize } from "@/lib/formatters";
import { useCores } from "@/hooks/use-catalogos";
import type { Veiculo } from "@/types/veiculo";

interface VehicleSpecsProps {
  veiculo: Veiculo;
}

type Spec = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  muted: boolean;
  color?: string;
};

export function VehicleSpecs({ veiculo }: VehicleSpecsProps) {
  const { data: cores = [] } = useCores();
  const corHex = cores.find((c) => c.nome === veiculo.cor)?.hex;
  const placaFinal = getPlacaFinal(veiculo.placa);

  const specs: Spec[] = [
    {
      icon: Calendar,
      label: "Ano",
      value: String(veiculo.ano),
      muted: false,
    },
    {
      icon: Gauge,
      label: "KM",
      value:
        veiculo.km != null
          ? veiculo.km.toLocaleString("pt-BR") + " km"
          : "Não informada",
      muted: veiculo.km == null,
    },
    {
      icon: Settings2,
      label: "Câmbio",
      value: veiculo.cambio ? capitalize(veiculo.cambio) : "—",
      muted: !veiculo.cambio,
    },
    {
      icon: Fuel,
      label: "Combustível",
      value: veiculo.combustivel ? capitalize(veiculo.combustivel) : "—",
      muted: !veiculo.combustivel,
    },
    {
      icon: Palette,
      label: "Cor",
      value: veiculo.cor || "—",
      muted: !veiculo.cor,
      color: corHex ?? undefined,
    },
    {
      icon: Hash,
      label: "Modelo",
      value: veiculo.modelo,
      muted: false,
    },
    ...(veiculo.motor
      ? [
          {
            icon: Cog,
            label: "Motor",
            value: veiculo.motor,
            muted: false,
          },
        ]
      : []),
    ...(placaFinal
      ? [
          {
            icon: Tag,
            label: "Placa (final)",
            value: placaFinal,
            muted: false,
          },
        ]
      : []),
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {specs.map((spec) => (
        <div
          key={spec.label}
          className="flex items-center gap-3 rounded-lg border bg-card p-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 shrink-0">
            <spec.icon className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{spec.label}</p>
            <div className="flex items-center gap-1.5">
              {spec.color && (
                <span
                  className="h-3 w-3 rounded-full border shrink-0"
                  style={{ backgroundColor: spec.color }}
                />
              )}
              <p
                className={cn(
                  "text-sm font-semibold truncate",
                  spec.muted && "italic text-muted-foreground font-normal",
                  spec.label === "Placa (final)" &&
                    "font-mono tracking-wider"
                )}
              >
                {spec.value}
              </p>
            </div>
          </div>f
        </div>
      ))}
    </div>
  );
}