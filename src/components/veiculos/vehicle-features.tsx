import { Check, Car } from "lucide-react";
import { parseOpcionais } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface VehicleFeaturesProps {
  opcionais: string[] | null;
}

export function VehicleFeatures({ opcionais }: VehicleFeaturesProps) {
  const items = parseOpcionais(opcionais);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        Nenhum item adicional informado para este veículo.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b bg-muted/40 px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Car className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold leading-none">
              Itens do veículo
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Equipamentos inclusos neste anúncio
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Check className="h-3 w-3" />
          {items.length} {items.length === 1 ? "item" : "itens"}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className={cn(
              "flex items-start gap-3 px-5 py-3.5 border-b border-border/60 last:border-b-0",
              index % 3 === 2 && "lg:border-b-0",
              index % 2 === 1 && "sm:border-b-0 lg:border-b",
              "hover:bg-muted/40 transition-colors"
            )}
          >
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-3 w-3 text-primary" strokeWidth={3} />
            </div>
            <span className="text-sm leading-snug text-foreground">
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}