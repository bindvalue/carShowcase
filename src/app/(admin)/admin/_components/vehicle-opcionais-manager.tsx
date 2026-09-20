"use client";

import { useState, useMemo } from "react";
import { Plus, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useOpcionais, useCreateOpcional } from "@/hooks/use-opcionais";
import { cn } from "@/lib/utils";

interface VehicleOpcionaisManagerProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function VehicleOpcionaisManager({
  value,
  onChange,
}: VehicleOpcionaisManagerProps) {
  const [open, setOpen] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [search, setSearch] = useState("");

  const { data: opcionais = [], isLoading } = useOpcionais();
  const createMutation = useCreateOpcional();

  // Agrupa por categoria
  const porCategoria = useMemo(() => {
    return opcionais.reduce<Record<string, typeof opcionais>>((acc, o) => {
      if (!acc[o.categoria]) acc[o.categoria] = [];
      acc[o.categoria].push(o);
      return acc;
    }, {});
  }, [opcionais]);

  // Verifica se já adicionado
  const isAdicionado = (nome: string) =>
    value.some((v) => v.toLowerCase() === nome.toLowerCase());

  // Verifica se a busca atual existe na lista
  const buscaExiste = useMemo(() => {
    if (!search.trim()) return true;
    return opcionais.some(
      (o) => o.nome.toLowerCase() === search.trim().toLowerCase()
    );
  }, [search, opcionais]);

  const addItem = (item: string) => {
    const trimmed = item.trim();
    if (!trimmed) return;

    const jaExiste = value.some(
      (v) => v.toLowerCase() === trimmed.toLowerCase()
    );
    if (jaExiste) return;

    onChange([...value, trimmed]);
    setCustomInput("");
    setSearch("");
    setOpen(false);
  };

  const removeItem = (item: string) => {
    onChange(value.filter((v) => v !== item));
  };

  // Cria novo opcional no banco e adiciona ao veículo
  const handleCreateAndAdd = async () => {
    const nome = (search || customInput).trim();
    if (!nome) return;

    try {
      const novo = await createMutation.mutateAsync({ nome });
      addItem(novo.nome);
    } catch {
      // erro tratado no hook
    }
  };

  const handleCustomKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (buscaExiste) {
        addItem(customInput);
      } else {
        handleCreateAndAdd();
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* â”€â”€â”€ Chips dos itens selecionados â”€â”€â”€ */}
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-2 rounded-lg border bg-muted/20 p-3 min-h-[60px]">
          {value.map((item, i) => (
            <Badge
              key={`${item}-${i}`}
              variant="secondary"
              className="gap-1 pl-2.5 pr-1 py-1.5 text-xs font-normal"
            >
              <Check className="h-3 w-3 text-primary" />
              <span>{item}</span>
              <button
                type="button"
                onClick={() => removeItem(item)}
                className="ml-1 flex h-4 w-4 items-center justify-center rounded-full hover:bg-muted-foreground/20 transition-colors"
                aria-label={`Remover ${item}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-lg border border-dashed bg-muted/20 p-6 text-xs text-muted-foreground">
          Nenhum item adicionado ainda
        </div>
      )}

      {/* â”€â”€â”€ Adicionar itens â”€â”€â”€ */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Popover open={open} onOpenChange={setOpen} modal={false}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full sm:w-auto justify-start"
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar item
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[--radix-popover-trigger-width] sm:w-[440px] p-0 z-[100]"
            align="start"
            sideOffset={4}
            style={{ maxHeight: "400px" }}
            onWheel={(e) => e.stopPropagation()}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Command
              className="max-h-[400px]"
              shouldFilter={true}
              onWheel={(e) => e.stopPropagation()}
            >
              <CommandInput
                placeholder="Buscar item..."
                value={search}
                onValueChange={setSearch}
              />
              <CommandList
                className="max-h-[340px] overflow-y-auto overscroll-contain"
                onWheel={(e) => e.stopPropagation()}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <CommandEmpty>
                      {search.trim() ? (
                        <div className="px-2 py-4 text-center">
                          <p className="text-xs text-muted-foreground mb-2">
                            Nenhum item encontrado
                          </p>
                          <Button
                            size="sm"
                            onClick={handleCreateAndAdd}
                            disabled={createMutation.isPending}
                            className="w-full"
                          >
                            {createMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                Criando...
                              </>
                            ) : (
                              <>
                                <Plus className="mr-2 h-3 w-3" />
                                Criar {`"${search}"`}
                              </>
                            )}
                          </Button>
                        </div>
                      ) : (
                        "Digite para buscar"
                      )}
                    </CommandEmpty>

                    {Object.entries(porCategoria).map(
                      ([categoria, itens]) => (
                        <CommandGroup key={categoria} heading={categoria}>
                          {itens.map((item) => {
                            const jaAdd = isAdicionado(item.nome);
                            return (
                              <CommandItem
                                key={item.id}
                                value={item.nome}
                                onSelect={() => {
                                  if (!jaAdd) addItem(item.nome);
                                }}
                                disabled={jaAdd}
                                className="cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    jaAdd ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {item.nome}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      )
                    )}

                    {/* Criar item quando busca não existe */}
                    {search.trim() && !buscaExiste && !isLoading && (
                      <>
                        <CommandSeparator />
                        <CommandGroup>
                          <CommandItem
                            onSelect={handleCreateAndAdd}
                            className="cursor-pointer text-primary"
                            disabled={createMutation.isPending}
                          >
                            {createMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Criando...
                              </>
                            ) : (
                              <>
                                <Plus className="mr-2 h-4 w-4" />
                                Criar {`"${search}"`}
                              </>
                            )}
                          </CommandItem>
                        </CommandGroup>
                      </>
                    )}
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Input de item personalizado direto */}
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="Ou digite um item novo..."
            className="h-11 flex-1"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={handleCustomKeyDown}
          />
          <Button
            type="button"
            onClick={handleCustomKeyDown.length ? handleCreateAndAdd : undefined}
            disabled={!customInput.trim() || createMutation.isPending}
            className="h-11"
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {value.length === 0
            ? "Nenhum item"
            : `${value.length} ${value.length === 1 ? "item" : "itens"}`}
        </span>
        {value.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange([])}
            className="h-7 text-xs text-muted-foreground hover:text-destructive"
          >
            Remover todos
          </Button>
        )}
      </div>
    </div>
  );
}