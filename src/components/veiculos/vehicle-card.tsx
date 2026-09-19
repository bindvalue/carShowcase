"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Fuel,
  Settings2,
  MapPin,
  Heart,
  Gauge,
  Palette,
  Car as CarIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  formatBRL,
  formatKM,
  getVeiculoSlug,
  capitalize,
} from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useCores } from "@/hooks/use-catalogos";
import type { Veiculo } from "@/types/veiculo";

interface VehicleCardProps {
  veiculo: Veiculo;
  className?: string;
}

export function VehicleCard({ veiculo, className }: VehicleCardProps) {
  const { data: cores = [] } = useCores();
  const corHex = cores.find((c) => c.nome === veiculo.cor)?.hex;

  const slug = getVeiculoSlug(veiculo);
  const isNovo = veiculo.ano >= new Date().getFullYear() - 1;

  return (
    <Card
      className={cn(
        "group overflow-hidden border-border/60 hover:border-border hover:shadow-lg transition-all duration-300 p-0",
        className
      )}
    >
      <Link href={`/veiculos/${slug}`} className="block">
        {/* Imagem */}
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {veiculo.imagem_capa ? (
            <Image
              src={veiculo.imagem_capa}
              alt={`${veiculo.marca} ${veiculo.modelo}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <CarIcon className="h-8 w-8" />
              <span className="text-xs">Sem imagem</span>
            </div>
          )}

          <div className="absolute top-3 left-3 flex gap-2">
            {isNovo && (
              <Badge className="bg-primary text-primary-foreground hover:bg-primary">
                Novo
              </Badge>
            )}
            <Badge
              variant="secondary"
              className="backdrop-blur-sm bg-background/80"
            >
              {veiculo.ano}
            </Badge>
          </div>

          <button
            onClick={(e) => e.preventDefault()}
            className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-red-500 transition-colors"
            aria-label="Favoritar"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
            {veiculo.marca} {veiculo.modelo}
          </h3>

          {/* Motor */}
          {veiculo.motor && (
            <p className="text-sm font-medium text-foreground/80 mt-0.5 line-clamp-1">
              {veiculo.motor}
            </p>
          )}

          {/* Linha 1: Ano · KM · Câmbio */}
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{veiculo.ano}</span>
            </div>

            <div className="flex items-center gap-1">
              <Gauge className="h-3.5 w-3.5" />
              <span className={veiculo.km == null ? "italic opacity-70" : ""}>
                {veiculo.km != null ? formatKM(veiculo.km) : "KM não informada"}
              </span>
            </div>

            {veiculo.cambio && (
              <div className="flex items-center gap-1">
                <Settings2 className="h-3.5 w-3.5" />
                <span>{capitalize(veiculo.cambio)}</span>
              </div>
            )}
          </div>

          {/* Linha 2: Combustível · Cor */}
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            {veiculo.combustivel && (
              <div className="flex items-center gap-1">
                <Fuel className="h-3.5 w-3.5" />
                <span>{capitalize(veiculo.combustivel)}</span>
              </div>
            )}

            {veiculo.cor && (
              <div className="flex items-center gap-1">
                {corHex ? (
                  <span
                    className="h-3 w-3 rounded-full border shrink-0"
                    style={{ backgroundColor: corHex }}
                    aria-label={`Cor: ${veiculo.cor}`}
                  />
                ) : (
                  <Palette className="h-3.5 w-3.5" />
                )}
                <span>{veiculo.cor}</span>
              </div>
            )}
          </div>

          <div className="mt-4">
            <p className="text-xs text-muted-foreground">A partir de</p>
            <p className="text-xl font-bold text-foreground">
              {formatBRL(veiculo.preco)}
            </p>
          </div>

          <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground border-t pt-3">
            <MapPin className="h-3.5 w-3.5" />
            <span>Contagem, MG</span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}