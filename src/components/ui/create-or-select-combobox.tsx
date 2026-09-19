"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, Loader2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface CreateOrSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CreateOrSelectComboboxProps {
  options: CreateOrSelectOption[];
  value: string;
  onChange: (value: string) => void;
  onCreate: (nome: string) => Promise<string | null>;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  createLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  creating?: boolean;
  className?: string;
}

export function CreateOrSelectCombobox({
  options,
  value,
  onChange,
  onCreate,
  placeholder = "Selecione...",
  searchPlaceholder = "Buscar...",
  emptyText = "Nada encontrado.",
  createLabel = "Criar",
  disabled = false,
  loading = false,
  creating = false,
  className,
}: CreateOrSelectComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const optionsFiltradas = useMemo(() => {
    const termo = search.trim().toLowerCase();
    if (!termo) return options;
    return options.filter((o) => o.label.toLowerCase().includes(termo));
  }, [options, search]);

  const buscaExata = useMemo(() => {
    const termo = search.trim().toLowerCase();
    if (!termo) return false;
    return options.some((o) => o.label.toLowerCase() === termo);
  }, [options, search]);

  const podeCriar = search.trim().length > 0 && !buscaExata;

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    } else {
      setSearch("");
    }
  }, [open]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setSearch("");
    setOpen(false);
  };

  const handleCreate = async () => {
    if (!podeCriar || creating) return;
    const nome = search.trim();
    const result = await onCreate(nome);
    if (result) {
      onChange(result);
      setSearch("");
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
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full h-11 justify-between font-normal",
            !selected && "text-muted-foreground",
            className
          )}
        >
          <span className="flex items-center gap-2 truncate">
            {selected?.icon}
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0 z-[100]"
        align="start"
        sideOffset={4}
        style={{ maxHeight: "360px" }}
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="max-h-[360px] flex flex-col">
          {/* ═══════════ INPUT DE BUSCA (nativo) ═══════════ */}
          <div className="flex items-center border-b px-3 shrink-0">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              ref={inputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && podeCriar) {
                  e.preventDefault();
                  handleCreate();
                }
              }}
              className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* ═══════════ LISTA DE OPÇÕES ═══════════ */}
          <div
            className="max-h-[280px] overflow-y-auto overscroll-contain p-1"
            onWheel={(e) => e.stopPropagation()}
          >
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : optionsFiltradas.length > 0 ? (
              optionsFiltradas.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-left cursor-pointer",
                    "hover:bg-accent hover:text-accent-foreground",
                    value === option.value && "bg-accent"
                  )}
                >
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.icon}
                  <span className="truncate">{option.label}</span>
                </button>
              ))
            ) : (
              <div className="px-3 py-6 text-center">
                <p className="text-xs text-muted-foreground">
                  {search.trim()
                    ? `Nenhum resultado para "${search}"`
                    : emptyText}
                </p>
              </div>
            )}
          </div>

          {/* ═══════════ BOTÃO "CRIAR X" ═══════════ */}
          {podeCriar && (
            <div className="border-t p-1 shrink-0">
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm font-medium text-primary text-left cursor-pointer",
                  "hover:bg-primary/10 transition-colors",
                  creating && "opacity-50 cursor-not-allowed"
                )}
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 shrink-0" />
                    {createLabel} {`"${search}"`}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}