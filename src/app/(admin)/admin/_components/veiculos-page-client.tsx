"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Package,
  CheckCircle2,
  FileX2,
  ShoppingCart,
  Trash2,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatCard } from "./stat-card";
import { VehicleRow } from "./vehicle-row";
import { VehicleEditModal } from "./vehicle-edit-sheet";
import {
  useAdminVeiculos,
  useAdminVeiculosCounts,
  useMarcasParaFiltro,
} from "@/hooks/use-admin-veiculos";
import { useDebounce } from "@/hooks/use-debounce";
import type { Veiculo } from "@/types/veiculo";

export function VeiculosPageClient() {
  const [search, setSearch] = useState("");
  const [statusVeiculo, setStatusVeiculo] = useState<
    "em_estoque" | "despublicados" | "vendidos" | "removidos" | "todos"
  >("em_estoque");
  const [marca, setMarca] = useState("todas");
  const [ordenacao, setOrdenacao] = useState<
    "recentes" | "antigos" | "preco-asc" | "preco-desc"
  >("recentes");
  const [page, setPage] = useState(1);

  const [editingVeiculo, setEditingVeiculo] = useState<Veiculo | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useAdminVeiculos({
    search: debouncedSearch || undefined,
    statusVeiculo,
    marca,
    ordenacao,
    page,
    perPage: 20,
  });

  const { data: counts } = useAdminVeiculosCounts();
  const { data: marcas = [] } = useMarcasParaFiltro();

  const veiculos = data?.veiculos ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const resetPage = () => setPage(1);

  const handleEdit = (veiculo: Veiculo) => {
    setEditingVeiculo(veiculo);
    setEditSheetOpen(true);
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* ═══════════ HEADER ═══════════ */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 tracking-tight">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              Veículos
            </h1>
            <p className="text-sm text-muted-foreground mt-2 ml-11">
              Gerencie seu estoque de veículos
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingVeiculo(null);
              setEditSheetOpen(true);
            }}
            className="h-11 px-5"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo veículo
          </Button>
        </div>

        {/* Cards de indicadores */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard
            label="Em estoque"
            sublabel="Disponíveis"
            value={counts?.emEstoque ?? 0}
            icon={CheckCircle2}
            tone="green"
            active={statusVeiculo === "em_estoque"}
            onClick={() => {
              setStatusVeiculo("em_estoque");
              resetPage();
            }}
          />
          <StatCard
            label="Despublicados"
            sublabel="Rascunhos"
            value={counts?.despublicados ?? 0}
            icon={FileX2}
            tone="gray"
            active={statusVeiculo === "despublicados"}
            onClick={() => {
              setStatusVeiculo("despublicados");
              resetPage();
            }}
          />
          <StatCard
            label="Vendidos"
            sublabel="Histórico"
            value={counts?.vendidos ?? 0}
            icon={ShoppingCart}
            tone="blue"
            active={statusVeiculo === "vendidos"}
            onClick={() => {
              setStatusVeiculo("vendidos");
              resetPage();
            }}
          />
          <StatCard
            label="Removidos"
            sublabel="Arquivados"
            value={counts?.removidos ?? 0}
            icon={Trash2}
            tone="red"
            active={statusVeiculo === "removidos"}
            onClick={() => {
              setStatusVeiculo("removidos");
              resetPage();
            }}
          />
          <StatCard
            label="Total"
            sublabel="Geral"
            value={counts?.total ?? 0}
            icon={Layers}
            tone="primary"
            active={statusVeiculo === "todos"}
            onClick={() => {
              setStatusVeiculo("todos");
              resetPage();
            }}
          />
        </div>
      </div>

      {/* Barra de filtros */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar por marca, modelo ou descrição..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPage();
            }}
            className="h-11 pl-10 pr-4 rounded-lg border-border/60"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Select
            value={statusVeiculo}
            onValueChange={(v) => {
              setStatusVeiculo(v as typeof statusVeiculo);
              resetPage();
            }}
          >
            <SelectTrigger className="h-11 w-[200px] rounded-lg border-border/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="em_estoque">
                📦 Em estoque {counts ? `(${counts.emEstoque})` : ""}
              </SelectItem>
              <SelectItem value="despublicados">
                📝 Despublicados {counts ? `(${counts.despublicados})` : ""}
              </SelectItem>
              <SelectItem value="vendidos">
                ✅ Vendidos {counts ? `(${counts.vendidos})` : ""}
              </SelectItem>
              <SelectItem value="removidos">
                🗑️ Removidos {counts ? `(${counts.removidos})` : ""}
              </SelectItem>
              <SelectItem value="todos">
                🔎 Todos os status {counts ? `(${counts.total})` : ""}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={marca}
            onValueChange={(v) => {
              setMarca(v);
              resetPage();
            }}
          >
            <SelectTrigger className="h-11 w-[180px] rounded-lg border-border/60">
              <SelectValue placeholder="Marca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as marcas</SelectItem>
              {marcas.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={ordenacao}
            onValueChange={(v) => {
              setOrdenacao(v as typeof ordenacao);
              resetPage();
            }}
          >
            <SelectTrigger className="h-11 w-[180px] rounded-lg border-border/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recentes">Mais recentes</SelectItem>
              <SelectItem value="antigos">Mais antigos</SelectItem>
              <SelectItem value="preco-desc">Maior preço</SelectItem>
              <SelectItem value="preco-asc">Menor preço</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista */}
      <Card className="border-border/60 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : veiculos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-lg font-semibold">
              Nenhum veículo encontrado
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {debouncedSearch ||
              marca !== "todas" ||
              statusVeiculo !== "em_estoque"
                ? "Tente ajustar os filtros."
                : "Comece cadastrando seu primeiro veículo."}
            </p>
            <Button
              onClick={() => {
                setEditingVeiculo(null);
                setEditSheetOpen(true);
              }}
              className="mt-4 h-11"
            >
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar veículo
            </Button>
          </div>
        ) : (
          <>
            <div>
              {veiculos.map((v) => (
                <VehicleRow key={v.id} veiculo={v} onEdit={handleEdit} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t p-4">
                <p className="text-xs text-muted-foreground">
                  Página {page} de {totalPages} · {total} veículos
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-9"
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="h-9"
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <VehicleEditModal
        veiculo={editingVeiculo}
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
      />
    </div>
  );
}