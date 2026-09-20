"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCores } from "@/hooks/use-catalogos";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Car as CarIcon,
  Motorbike,
  Edit,
  MoreVertical,
  Trash2,
  Eye,
  EyeOff,
  Gauge,
  Calendar,
  Palette,
  Settings2,
  Fuel,
  ExternalLink,
  ShoppingCart,
  RotateCcw,
  Ban,
  AlertTriangle,
  Tag,
  Cog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { formatBRL, formatKM, capitalize, getPlacaFinal } from "@/lib/formatters";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useToggleVeiculoAtivo,
  useDeleteVeiculo,
  useArquivarVeiculo,
  useRestaurarVeiculo,
} from "@/hooks/use-admin-veiculos";
import type { Veiculo } from "@/types/veiculo";
import { cn } from "@/lib/utils";

interface VehicleRowProps {
  veiculo: Veiculo;
  onEdit: (veiculo: Veiculo) => void;
}

export function VehicleRow({ veiculo, onEdit }: VehicleRowProps) {
  // â”€â”€â”€ Estados dos dialogs â”€â”€â”€
  const [openDelete, setOpenDelete] = useState(false);
  const [openArquivar, setOpenArquivar] = useState(false);

  // â”€â”€â”€ Mutations â”€â”€â”€
  const toggleMutation = useToggleVeiculoAtivo();
  const deleteMutation = useDeleteVeiculo();
  const arquivarMutation = useArquivarVeiculo();
  const restaurarMutation = useRestaurarVeiculo();
  const { data: cores = [] } = useCores();
  const corHex = cores.find((c) => c.nome === veiculo.cor)?.hex;

  // â”€â”€â”€ Handlers â”€â”€â”€
  const handleToggle = () => {
    toggleMutation.mutate({ id: veiculo.id, ativo: !veiculo.ativo });
  };

  const handleArquivar = (status: "vendido" | "removido") => {
    arquivarMutation.mutate(
      { id: veiculo.id, status },
      { onSuccess: () => setOpenArquivar(false) }
    );
  };

  const handleRestaurar = () => {
    restaurarMutation.mutate(veiculo.id);
  };

  const handleDelete = () => {
    deleteMutation.mutate(veiculo.id, {
      onSuccess: () => setOpenDelete(false),
    });
  };

  // â”€â”€â”€ Flags â”€â”€â”€
  const isDisponivel = veiculo.status === "disponivel";
  const isArquivado = !isDisponivel;

  // â”€â”€â”€ Specs â”€â”€â”€
  const specs = [
  {
    icon: Gauge,
    value: veiculo.km != null ? formatKM(veiculo.km) : "KM não informada",
    muted: veiculo.km == null,
  },
  {
    icon: Tag,
    value: getPlacaFinal(veiculo.placa)
      ? `Final ${getPlacaFinal(veiculo.placa)}`
      : null,
    muted: false,
  },
  { icon: Calendar, value: String(veiculo.ano), muted: false },
  // â”€â”€â”€ Motor (NOVO) â”€â”€â”€
  {
    icon: Cog,
    value: veiculo.motor,
    muted: !veiculo.motor,
  },
{
    icon: Palette,
    value: veiculo.cor,
    muted: !veiculo.cor,
    color: corHex,
  },
  {
    icon: Settings2,
    value: veiculo.cambio ? capitalize(veiculo.cambio) : null,
    muted: !veiculo.cambio,
  },
  {
    icon: Fuel,
    value: veiculo.combustivel ? capitalize(veiculo.combustivel) : null,
    muted: !veiculo.combustivel,
  },
].filter((s) => s.value);

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "group relative flex gap-4 border-b p-4 last:border-b-0 transition-colors",
          "hover:bg-muted/40",
          isArquivado && "opacity-75"
        )}
      >
        {/* â•â•â•â•â•â•â•â•â•â•â• IMAGEM â•â•â•â•â•â•â•â•â•â•â• */}
        <button
          type="button"
          onClick={() => onEdit(veiculo)}
          className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-muted border border-border/40 cursor-pointer"
        >
          {veiculo.imagem_capa ? (
            <Image
              src={veiculo.imagem_capa}
              alt={`${veiculo.marca} ${veiculo.modelo}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="112px"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <CarIcon className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </button>

        {/* â•â•â•â•â•â•â•â•â•â•â• INFO PRINCIPAL â•â•â•â•â•â•â•â•â•â•â• */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            {/* Título + Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => onEdit(veiculo)}
                className="text-base font-semibold tracking-tight hover:text-primary transition-colors truncate text-left"
              >
                {veiculo.marca} {veiculo.modelo}
              </button>

              {/* Badge de Tipo */}
              {veiculo.tipo === "moto" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 px-2 py-0.5 text-[10px] font-medium border border-orange-200/60 dark:border-orange-900/60">
                  <Motorbike className="h-3 w-3" />
                  Moto
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 px-2 py-0.5 text-[10px] font-medium border border-blue-200/60 dark:border-blue-900/60">
                  <CarIcon className="h-3 w-3" />
                  Carro
                </span>
              )}

              {/* Badge de Status do Veículo */}
              {veiculo.status === "vendido" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400 px-2 py-0.5 text-[10px] font-medium">
                  <ShoppingCart className="h-3 w-3" />
                  Vendido
                </span>
              )}

              {veiculo.status === "removido" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 px-2 py-0.5 text-[10px] font-medium">
                  <Ban className="h-3 w-3" />
                  Removido
                </span>
              )}

              {/* Badge de Ativo/Inativo (só disponíveis) */}
              {isDisponivel && (
                <>
                  {veiculo.ativo ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400 px-2 py-0.5 text-[10px] font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                      Ativo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 text-[10px] font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      Despublicado
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Especificações */}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {specs.map((spec, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  {spec.color ? (
                    <span
                      className="h-3 w-3 rounded-full border shrink-0"
                      style={{ backgroundColor: spec.color }}
                    />
                  ) : (
                    <spec.icon className="h-3.5 w-3.5 text-muted-foreground/70" />
                  )}
                  <span
                    className={cn(
                      "font-medium",
                      spec.muted
                        ? "italic text-muted-foreground/60 font-normal"
                        : "text-foreground/80"
                    )}
                  >
                    {spec.value}
                </span>
              </div>
            ))}
            </div>

            {/* Slug */}
            {veiculo.slug && (
              <div className="mt-2 hidden lg:flex items-center gap-1 text-[10px] text-muted-foreground/60 font-mono">
                <ExternalLink className="h-3 w-3" />
                <span className="truncate">/{veiculo.slug}</span>
              </div>
            )}
          </div>

          {/* Preço mobile */}
          <div className="lg:hidden mt-2">
            <p className="text-base font-bold tracking-tight">
              {formatBRL(veiculo.preco)}
            </p>
          </div>
        </div>

        {/* â•â•â•â•â•â•â•â•â•â•â• PREÇO (desktop) â•â•â•â•â•â•â•â•â•â•â• */}
        <div className="hidden lg:flex flex-col justify-center items-end px-4 shrink-0">
          <p className="text-lg font-bold tracking-tight">
            {formatBRL(veiculo.preco)}
          </p>
          {veiculo.km != null && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {formatKM(veiculo.km)}
            </p>
          )}
        </div>

        {/* â•â•â•â•â•â•â•â•â•â•â• AÇÃ•ES â•â•â•â•â•â•â•â•â•â•â• */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Toggle ativo (só disponível) */}
          {isDisponivel && (
            <div className="hidden lg:flex items-center gap-2 pr-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Switch
                      checked={!!veiculo.ativo}
                      onCheckedChange={handleToggle}
                      disabled={toggleMutation.isPending}
                      aria-label="Alterar status"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {veiculo.ativo ? "Despublicar" : "Publicar"}
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* Botões (telas grandes) */}
          <div className="hidden md:flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="h-9 w-9"
                >
                  <Link
                    href={`/veiculos/${veiculo.slug}`}
                    target="_blank"
                    aria-label="Ver no site"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Ver no site</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(veiculo)}
                  className="h-9 w-9"
                  aria-label="Editar"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Editar</TooltipContent>
            </Tooltip>

            {/* Arquivar (só disponível) */}
            {isDisponivel && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setOpenArquivar(true)}
                    className="h-9 w-9 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/40"
                    aria-label="Arquivar veículo"
                  >
                    <Ban className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Arquivar (vendido/remover)</TooltipContent>
              </Tooltip>
            )}

            {/* Restaurar (só arquivado) */}
            {isArquivado && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRestaurar}
                    disabled={restaurarMutation.isPending}
                    className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                    aria-label="Restaurar ao estoque"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Restaurar ao estoque</TooltipContent>
              </Tooltip>
            )}

            {/* Excluir permanente (só arquivado) */}
            {isArquivado && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setOpenDelete(true)}
                    className="h-9 w-9 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                    aria-label="Excluir permanentemente"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Excluir permanentemente</TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Menu â‹¯ (mobile) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 md:hidden"
                aria-label="Mais ações"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                {veiculo.marca} {veiculo.modelo}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link
                  href={`/veiculos/${veiculo.slug}`}
                  target="_blank"
                  className="cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver no site
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => onEdit(veiculo)}
                className="cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>

              {/* Opções para disponíveis */}
              {isDisponivel && (
                <>
                  <DropdownMenuItem
                    onClick={handleToggle}
                    className="cursor-pointer"
                    disabled={toggleMutation.isPending}
                  >
                    {veiculo.ativo ? (
                      <>
                        <EyeOff className="mr-2 h-4 w-4" />
                        Despublicar
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Publicar
                      </>
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setOpenArquivar(true);
                    }}
                    className="cursor-pointer text-orange-600 focus:text-orange-600 focus:bg-orange-50 dark:focus:bg-orange-950"
                    disabled={arquivarMutation.isPending}
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Arquivar veículo
                  </DropdownMenuItem>
                </>
              )}

              {/* Opções para arquivados */}
              {isArquivado && (
                <>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleRestaurar}
                    className="cursor-pointer text-blue-600 focus:text-blue-600 focus:bg-blue-50 dark:focus:bg-blue-950"
                    disabled={restaurarMutation.isPending}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Restaurar ao estoque
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setOpenDelete(true);
                    }}
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir permanentemente
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* â•â•â•â•â•â•â•â•â•â•â• DIALOG: ARQUIVAR (escolha vendido/removido) â•â•â•â•â•â•â•â•â•â•â• */}
        <Dialog open={openArquivar} onOpenChange={setOpenArquivar}>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Ban className="h-5 w-5 text-orange-600" />
                Arquivar veículo
              </DialogTitle>
              <DialogDescription className="pt-2">
                O que você quer fazer com{" "}
                <span className="font-semibold text-foreground">
                  {veiculo.marca} {veiculo.modelo} {veiculo.ano}
                </span>
                ?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/60 p-3 text-xs space-y-1">
                <p className="flex items-center gap-1.5 font-semibold text-orange-800 dark:text-orange-300">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  Todas as imagens serão apagadas do Storage
                </p>
                <p className="text-orange-700 dark:text-orange-400">
                  Isso libera espaço no servidor. O cadastro permanece no banco
                  para histórico.
                </p>
              </div>

              <p className="text-xs text-muted-foreground">
                Você pode restaurar o veículo depois, mas precisará subir as
                imagens novamente.
              </p>
            </div>

            <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setOpenArquivar(false)}
                disabled={arquivarMutation.isPending}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>

              <Button
                variant="outline"
                onClick={() => handleArquivar("removido")}
                disabled={arquivarMutation.isPending}
                className="w-full sm:w-auto text-orange-600 border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-950/40"
              >
                <Ban className="mr-2 h-4 w-4" />
                Remover do estoque
              </Button>

              <Button
                onClick={() => handleArquivar("vendido")}
                disabled={arquivarMutation.isPending}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Marcar como vendido
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* â•â•â•â•â•â•â•â•â•â•â• DIALOG: EXCLUIR PERMANENTEMENTE â•â•â•â•â•â•â•â•â•â•â• */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Excluir permanentemente?
            </DialogTitle>
            <DialogDescription className="pt-2 space-y-3">
              <span>
                Você está prestes a excluir{" "}
                <span className="font-semibold text-foreground">
                  {veiculo.marca} {veiculo.modelo} {veiculo.ano}
                </span>{" "}
                do banco de dados.
              </span>

              <span className="block rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 p-3 text-xs space-y-1">
                <span className="flex items-center gap-1.5 font-semibold text-red-800 dark:text-red-300">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  Ação irreversível
                </span>
                <span className="block text-red-700 dark:text-red-400">
                  O cadastro será <strong>removido do banco</strong> e{" "}
                  <strong>não poderá ser recuperado</strong>.
                </span>
              </span>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setOpenDelete(false)}
              disabled={deleteMutation.isPending}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending
                ? "Excluindo..."
                : "Sim, excluir permanentemente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </TooltipProvider>
  );
}