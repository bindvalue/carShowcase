"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
          <Select
            value={marca}
            onValueChange={(v) => {
              setMarca(v === "all" ? "" : v);
              setModelo("");
            }}
          >
            <SelectTrigger className="h-11 mt-1">
              <SelectValue placeholder="Todas as marcas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as marcas</SelectItem>
              {marcas.map((m) => (
                <SelectItem key={m.id} value={m.nome}>
                  {m.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Modelo */}
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Modelo
          </label>
          <Select
            value={modelo}
            onValueChange={setModelo}
            disabled={!marcaIdSelecionada}
          >
            <SelectTrigger className="h-11 mt-1">
              <SelectValue
                placeholder={
                  marcaIdSelecionada
                    ? "Todos os modelos"
                    : "Escolha a marca primeiro"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {modelos.map((m) => (
                <SelectItem key={m.id} value={m.nome}>
                  {m.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid: Ano + Câmbio */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Ano
            </label>
            <Select value={ano} onValueChange={setAno}>
              <SelectTrigger className="h-11 mt-1">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                {anos.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Câmbio
            </label>
            <Select value={cambio} onValueChange={setCambio}>
              <SelectTrigger className="h-11 mt-1">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                {CAMBIO_OPTIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Preço máximo */}
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Preço máximo
          </label>
          <Select value={precoMax} onValueChange={setPrecoMax}>
            <SelectTrigger className="h-11 mt-1">
              <SelectValue placeholder="Sem limite" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50000">Até R$ 50.000</SelectItem>
              <SelectItem value="80000">Até R$ 80.000</SelectItem>
              <SelectItem value="120000">Até R$ 120.000</SelectItem>
              <SelectItem value="180000">Até R$ 180.000</SelectItem>
              <SelectItem value="250000">Até R$ 250.000</SelectItem>
              <SelectItem value="500000">Até R$ 500.000</SelectItem>
            </SelectContent>
          </Select>
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