"use client";

import { useMemo } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FilterSection } from "./filter-section";
import { PriceRangeFilter } from "./price-range-filter";
import { YearRangeFilter } from "./year-range-filter";
import { KmRangeFilter } from "./km-range-filter";
import { VehicleTypeToggle } from "./vehicle-type-toggle";
import { LocationFilter } from "./location-filter";
import { useVehicleFilters } from "@/hooks/use-vehicle-filters";
import { CAMBIO_OPTIONS, COMBUSTIVEL_OPTIONS } from "@/lib/constants";

// â•â•â•â•â•â•â•â•â•â•â• NOVOS HOOKS (banco de dados) â•â•â•â•â•â•â•â•â•â•â•
import { useMarcas, useModelos, useCores } from "@/hooks/use-catalogos";

interface VehicleFiltersProps {
  onClose?: () => void;
}

export function VehicleFilters({ onClose }: VehicleFiltersProps) {
  const { getParam, toggleArrayParam, setParams, clearFilters } =
    useVehicleFilters();

  // â•â•â•â•â•â•â•â•â•â•â• DADOS DO BANCO â•â•â•â•â•â•â•â•â•â•â•
  const { data: marcas = [], isLoading: loadingMarcas } = useMarcas();
  const { data: cores = [], isLoading: loadingCores } = useCores();

  // â”€â”€â”€ Modelos filtrados pela(s) marca(s) selecionada(s) â”€â”€â”€
  const marcasSelecionadas = getParam("marca");
  const marcaIdSelecionada = useMemo(() => {
    if (marcasSelecionadas.length !== 1) return undefined;
    const marca = marcas.find((m) => m.nome === marcasSelecionadas[0]);
    return marca?.id;
  }, [marcasSelecionadas, marcas]);

  const { data: modelos = [], isLoading: loadingModelos } =
    useModelos(marcaIdSelecionada);

  // â”€â”€â”€ SeleÃ§Ãµes atuais â”€â”€â”€
  const modelosSelecionados = getParam("modelo");
  const cambioSelecionado = getParam("cambio");
  const combustivelSelecionado = getParam("combustivel");
  const coresSelecionadas = getParam("cor");

  // â”€â”€â”€ Ranges â”€â”€â”€
  const anoMin = Number(getParam("anoMin")[0]) || 1990;
  const anoMax = Number(getParam("anoMax")[0]) || new Date().getFullYear() + 1;
  const precoMin = Number(getParam("precoMin")[0]) || 0;
  const precoMax = Number(getParam("precoMax")[0]) || 1_000_000;
  const kmMin = Number(getParam("kmMin")[0]) || 0;
  const kmMax = Number(getParam("kmMax")[0]) || 500_000;

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <h2 className="font-semibold text-lg">Filtros</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs h-7"
          >
            Limpar
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden h-7 w-7"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Toggle Carros/Motos */}
      <div className="pt-4">
        <VehicleTypeToggle />
      </div>

      {/* LocalizaÃ§Ã£o */}
      <FilterSection title="LocalizaÃ§Ã£o">
        <LocationFilter />
      </FilterSection>

      {/* â”€â”€â”€ MARCA (do banco) â”€â”€â”€ */}
      <FilterSection title="Marca">
        {loadingMarcas ? (
          <p className="text-xs text-muted-foreground py-2">Carregando...</p>
        ) : marcas.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">
            Nenhuma marca cadastrada.
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {marcas.map((marca) => (
              <label
                key={marca.id}
                className="flex items-center gap-2 cursor-pointer text-sm hover:text-foreground"
              >
                <Checkbox
                  checked={marcasSelecionadas.includes(marca.nome)}
                  onCheckedChange={() =>
                    toggleArrayParam("marca", marca.nome)
                  }
                />
                <span>{marca.nome}</span>
              </label>
            ))}
          </div>
        )}
      </FilterSection>

      {/* â”€â”€â”€ MODELO (do banco, filtrado por marca) â”€â”€â”€ */}
      <FilterSection title="Modelo" defaultOpen={false}>
        {!marcaIdSelecionada ? (
          <p className="text-xs text-muted-foreground py-2">
            Selecione uma marca primeiro.
          </p>
        ) : loadingModelos ? (
          <p className="text-xs text-muted-foreground py-2">Carregando...</p>
        ) : modelos.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">
            Nenhum modelo para essa marca.
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {modelos.map((modelo) => (
              <label
                key={modelo.id}
                className="flex items-center gap-2 cursor-pointer text-sm hover:text-foreground"
              >
                <Checkbox
                  checked={modelosSelecionados.includes(modelo.nome)}
                  onCheckedChange={() =>
                    toggleArrayParam("modelo", modelo.nome)
                  }
                />
                <span>{modelo.nome}</span>
              </label>
            ))}
          </div>
        )}
      </FilterSection>

      {/* PreÃ§o */}
      <FilterSection title="PreÃ§o">
        <PriceRangeFilter
          min={0}
          max={500000}
          currentMin={precoMin}
          currentMax={precoMax}
          onApply={(min, max) => setParams({ precoMin: min, precoMax: max })}
        />
      </FilterSection>

      {/* Ano */}
      <FilterSection title="Ano">
        <YearRangeFilter
          min={1990}
          max={new Date().getFullYear() + 1}
          currentMin={anoMin}
          currentMax={anoMax}
          onApply={(min, max) => setParams({ anoMin: min, anoMax: max })}
        />
      </FilterSection>

      {/* KM */}
      <FilterSection title="Quilometragem">
        <KmRangeFilter
          min={0}
          max={500000}
          currentMin={kmMin}
          currentMax={kmMax}
          onApply={(min, max) => setParams({ kmMin: min, kmMax: max })}
        />
      </FilterSection>

      {/* CÃ¢mbio */}
      <FilterSection title="CÃ¢mbio" defaultOpen={false}>
        <div className="space-y-2">
          {CAMBIO_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 cursor-pointer text-sm hover:text-foreground"
            >
              <Checkbox
                checked={cambioSelecionado.includes(opt.value)}
                onCheckedChange={() => toggleArrayParam("cambio", opt.value)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* CombustÃ­vel */}
      <FilterSection title="CombustÃ­vel" defaultOpen={false}>
        <div className="space-y-2">
          {COMBUSTIVEL_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 cursor-pointer text-sm hover:text-foreground"
            >
              <Checkbox
                checked={combustivelSelecionado.includes(opt.value)}
                onCheckedChange={() =>
                  toggleArrayParam("combustivel", opt.value)
                }
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* â”€â”€â”€ COR (do banco) â”€â”€â”€ */}
      <FilterSection title="Cor" defaultOpen={false}>
        {loadingCores ? (
          <p className="text-xs text-muted-foreground py-2">Carregando...</p>
        ) : cores.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">
            Nenhuma cor cadastrada.
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {cores.map((cor) => (
              <label
                key={cor.id}
                className="flex items-center gap-2 cursor-pointer text-sm hover:text-foreground"
              >
                <Checkbox
                  checked={coresSelecionadas.includes(cor.nome)}
                  onCheckedChange={() => toggleArrayParam("cor", cor.nome)}
                />
                {cor.hex && (
                  <span
                    className="h-3 w-3 rounded-full border shrink-0"
                    style={{ backgroundColor: cor.hex }}
                  />
                )}
                <span>{cor.nome}</span>
              </label>
            ))}
          </div>
        )}
      </FilterSection>
    </div>
  );
}