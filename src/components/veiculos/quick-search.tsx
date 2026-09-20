"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { useMarcas, useModelos } from "@/hooks/use-catalogos";
import { CAMBIO_OPTIONS } from "@/lib/constants";

export function QuickSearch() {
  const router = useRouter();

  const [marca, setMarca] = useState<string>("");
  const [modelo, setModelo] = useState<string>("");
  const [ano, setAno] = useState<string>("");
  const [precoMax, setPrecoMax] = useState<string>("");
  const [cambio, setCambio] = useState<string>("");

  // ─── Dados reais do banco ───
  const { data: marcas = [] } = useMarcas();

  const marcaIdSelecionada = useMemo(() => {
    if (!marca) return undefined;
    const m = marcas.find((x) => x.nome === marca);
    return m?.id;
  }, [marca, marcas]);

  const { data: modelos = [] } = useModelos(marcaIdSelecionada);

  // Anos disponíveis (últimos 15 anos)
  const anos = useMemo(() => {
    const anoAtual = new Date().getFullYear();
    return Array.from({ length: 16 }, (_, i) => String(anoAtual - i));
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (marca) params.set("marca", marca);
    if (modelo) params.set("modelo", modelo);
    if (ano) {
      params.set("anoMin", ano);
      params.set("anoMax", ano);
    }
    if (precoMax) params.set("precoMax", precoMax);
    if (cambio) params.set("cambio", cambio);

    router.push(`/veiculos?${params.toString()}`);
  };

  // Opções dos Combobox
  const opcoesMarcas = [
    { value: "all", label: "Todas as marcas" },
    ...marcas.map((m) => ({ value: m.nome, label: m.nome })),
  ];

  const opcoesModelos = modelos.map((m) => ({
    value: m.nome,
    label: m.nome,
  }));

  const opcoesAnos = anos.map((a) => ({ value: a, label: a }));

  const opcoesCambio = CAMBIO_OPTIONS.map((c) => ({
    value: c.value,
    label: c.label,
  }));

  const opcoesPreco = [
    { value: "50000", label: "Até R$ 50.000" },
    { value: "80000", label: "Até R$ 80.000" },
    { value: "120000", label: "Até R$ 120.000" },
    { value: "180000", label: "Até R$ 180.000" },
    { value: "250000", label: "Até R$ 250.000" },
    { value: "500000", label: "Até R$ 500.000" },
  ];

  return (
    <div className="rounded-2xl border bg-background p-6 shadow-xl">
      <div className="mb-4 flex items-center gap-2">
        <Search className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-lg">Busca rápida</h2>
      </div>

      <div className="space-y-3">
        {/* Marca */}
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Marca
          </label>
          <div className="mt-1">
            <Combobox
              options={opcoesMarcas}
              value={marca || "all"}
              onChange={(v) => {
                setMarca(v === "all" ? "" : v);
                setModelo("");
              }}
              placeholder="Todas as marcas"
              searchPlaceholder="Buscar marca..."
              className="!h-11"
            />
          </div>
        </div>

        {/* Modelo */}
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Modelo
          </label>
          <div className="mt-1">
            <Combobox
              options={opcoesModelos}
              value={modelo}
              onChange={setModelo}
              placeholder={
                marcaIdSelecionada
                  ? "Todos os modelos"
                  : "Escolha a marca primeiro"
              }
              searchPlaceholder="Buscar modelo..."
              disabled={!marcaIdSelecionada}
              className="!h-11"
            />
          </div>
        </div>

        {/* Grid: Ano + Câmbio */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Ano
            </label>
            <div className="mt-1">
              <Combobox
                options={opcoesAnos}
                value={ano}
                onChange={setAno}
                placeholder="Todos"
                searchPlaceholder="Buscar ano..."
                className="!h-11"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Câmbio
            </label>
            <div className="mt-1">
              <Combobox
                options={opcoesCambio}
                value={cambio}
                onChange={setCambio}
                placeholder="Todos"
                searchPlaceholder="Buscar câmbio..."
                className="!h-11"
              />
            </div>
          </div>
        </div>

        {/* Preço máximo */}
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Preço máximo
          </label>
          <div className="mt-1">
            <Combobox
              options={opcoesPreco}
              value={precoMax}
              onChange={setPrecoMax}
              placeholder="Sem limite"
              searchPlaceholder="Buscar preço..."
              className="!h-11"
            />
          </div>
        </div>

        <Button
          onClick={handleSearch}
          size="lg"
          className="w-full h-12 mt-2 text-base font-semibold"
        >
          <Search className="mr-2 h-5 w-5" />
          Buscar veículos
        </Button>
      </div>
    </div>
  );
}