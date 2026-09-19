"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { ColorPickerButton } from "./color-picker-button";
import { cn } from "@/lib/utils";

interface Cor {
  id: string;
  nome: string;
  hex: string | null;
}

interface ColorComboboxProps {
  cores: Cor[];
  value: string; // nome da cor selecionada
  onChange: (nome: string) => void;
  onCreate: (nome: string, hex: string) => Promise<string | null>;
  creating?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function ColorCombobox({
  cores,
  value,
  onChange,
  onCreate,
  creating = false,
  placeholder = "Selecione a cor",
  disabled = false,
}: ColorComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [novoNome, setNovoNome] = useState("");
  const [novoHex, setNovoHex] = useState("#000000");

  const selected = cores.find((c) => c.nome === value);

  const coresFiltradas = cores.filter((c) =>
    c.nome.toLowerCase().includes(search.trim().toLowerCase())
  );

  const buscaExata = cores.some(
    (c) => c.nome.toLowerCase() === search.trim().toLowerCase()
  );
  const podeCriar = search.trim().length > 0 && !buscaExata;

  const handleSelect = (nome: string) => {
    onChange(nome);
    setSearch("");
    setOpen(false);
  };

  const handleCreate = async () => {
    const nome = search.trim() || novoNome.trim();
    if (!nome || !novoHex || creating) return;

    const result = await onCreate(nome, novoHex);
    if (result) {
      onChange(result);
      setSearch("");
      setNovoNome("");
      setNovoHex("#000000");
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          disabled={disabled}
          className={cn(
            "w-full h-11 justify-between font-normal",
            !selected && "text-muted-foreground"
          )}
        >
          <span className="flex items-center gap-2 truncate">
            {selected?.hex && (
              <span
                className="h-3 w-3 rounded-full border shrink-0"
                style={{ backgroundColor: selected.hex }}
              />
            )}
            {selected ? selected.nome : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0 z-[100]"
        align="start"
        sideOffset={4}
        style={{ maxHeight: "400px" }}
        onWheel={(e) => e.stopPropagation()}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col max-h-[400px]">
          {/* Input de busca */}
          <div className="flex items-center border-b px-3 shrink-0">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              type="text"
              placeholder="Buscar cor..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setNovoNome(e.target.value);
              }}
              className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Lista */}
          <div
            className="overflow-y-auto overscroll-contain p-1 max-h-[240px]"
            onWheel={(e) => e.stopPropagation()}
          >
            {coresFiltradas.length > 0 ? (
              coresFiltradas.map((cor) => (
                <button
                  key={cor.id}
                  type="button"
                  onClick={() => handleSelect(cor.nome)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-left cursor-pointer",
                    "hover:bg-accent hover:text-accent-foreground",
                    value === cor.nome && "bg-accent"
                  )}
                >
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0",
                      value === cor.nome ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {cor.hex ? (
                    <span
                      className="h-3 w-3 rounded-full border shrink-0"
                      style={{ backgroundColor: cor.hex }}
                    />
                  ) : (
                    <span className="h-3 w-3 rounded-full border border-dashed shrink-0" />
                  )}
                  <span className="truncate">{cor.nome}</span>
                </button>
              ))
            ) : (
              <div className="px-3 py-6 text-center">
                <p className="text-xs text-muted-foreground">
                  {search.trim()
                    ? `Nenhuma cor "${search}" encontrada`
                    : "Nenhuma cor cadastrada"}
                </p>
              </div>
            )}
          </div>

          {/* Criar nova cor */}
          {podeCriar && (
            <div className="border-t p-3 space-y-3 shrink-0">
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Nova cor
                </p>
                <Input
                  placeholder="Nome da cor"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  className="h-9 mb-2"
                />
                <div className="flex items-center gap-2">
                  <ColorPickerButton
                    hex={novoHex}
                    onChange={setNovoHex}
                  />
                  <span className="text-xs font-mono text-muted-foreground">
                    {novoHex}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                size="sm"
                onClick={handleCreate}
                disabled={creating || !novoNome.trim() || !novoHex}
                className="w-full"
              >
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-3 w-3" />
                    Criar {`"${novoNome || search}"`}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}