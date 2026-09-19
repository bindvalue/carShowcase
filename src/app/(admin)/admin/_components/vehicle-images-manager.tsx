"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Upload,
  X,
  Star,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUploadMultiplasImagens } from "@/hooks/use-update-veiculo";
import { toast } from "sonner";

interface VehicleImagesManagerProps {
  /** ID do veículo — null em modo criação */
  veiculoId: string | null;
  /** URLs das imagens já salvas no banco */
  imagens: string[];
  /** URL da capa atual (pode ser uma das imagens ou uma URL separada) */
  capaAtual: string | null;
  /** Callback quando muda imagens + capa */
  onChange: (imagens: string[], novaCapa: string | null) => void;
  /** Arquivos aguardando upload (modo criação) */
  pendingFiles?: File[];
  onPendingFilesChange?: (files: File[]) => void;
}

export function VehicleImagesManager({
  veiculoId,
  imagens,
  capaAtual,
  onChange,
  pendingFiles = [],
  onPendingFilesChange,
}: VehicleImagesManagerProps) {
  const [uploading, setUploading] = useState(false);
  const uploadMutation = useUploadMultiplasImagens();

  const isCreating = !veiculoId;

  // ═══════════ UPLOAD ═══════════
  const handleUpload = async (files: FileList) => {
    if (files.length === 0) return;

    // ─── MODO CRIAÇÃO: guarda em memória ───
    if (isCreating) {
      const novos = Array.from(files);
      const todasPending = [...pendingFiles, ...novos];
      onPendingFilesChange?.(todasPending);

      // Se ainda não tem capa e essa é a primeira leva, define a primeira como capa
      if (!capaAtual && todasPending.length > 0) {
        // A capa será a primeira URL após o upload.
        // Como ainda estamos em memória, salvamos a "intenção" no componente pai
        // (ele vai resolver isso após upload)
      }

      toast.success(
        `${novos.length} ${novos.length === 1 ? "foto selecionada" : "fotos selecionadas"}!`
      );
      return;
    }

    // ─── MODO EDIÇÃO: faz upload imediato ───
    setUploading(true);
    try {
      const novasUrls = await uploadMutation.mutateAsync({
        veiculoId,
        files: Array.from(files),
      });

      const imagensAtualizadas = [...imagens, ...novasUrls];
      const novaCapa = capaAtual ?? novasUrls[0] ?? null;

      onChange(imagensAtualizadas, novaCapa);
      toast.success(
        `${novasUrls.length} ${novasUrls.length === 1 ? "foto enviada" : "fotos enviadas"}!`
      );
    } finally {
      setUploading(false);
    }
  };

  // ═══════════ AÇÕES ═══════════
  const handleRemove = (url: string) => {
    const novasImagens = imagens.filter((img) => img !== url);
    const novaCapa = capaAtual === url ? (novasImagens[0] ?? null) : capaAtual;
    onChange(novasImagens, novaCapa);
  };

  const handleRemovePending = (index: number) => {
    const novas = pendingFiles.filter((_, i) => i !== index);
    onPendingFilesChange?.(novas);
  };

  const handleSetCapa = (url: string) => {
    onChange(imagens, url);
    toast.success("Capa definida!");
  };

  // ─── Definir uma "capa pendente" (modo criação) ───
  const [capaPendenteIndex, setCapaPendenteIndex] = useState(0);

  const totalImagens = imagens.length + pendingFiles.length;

  return (
    <div className="space-y-4">
      {/* ═══════════ ÁREA DE UPLOAD ═══════════ */}
      <label
        htmlFor="upload-multiplas"
        className={cn(
          "flex flex-col items-center justify-center gap-2 cursor-pointer",
          "rounded-xl border-2 border-dashed border-border/60 p-6",
          "transition-colors hover:bg-muted/30 hover:border-primary/40",
          uploading && "opacity-50 pointer-events-none"
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
            <p className="text-sm font-medium">Enviando fotos...</p>
          </>
        ) : (
          <>
            <Upload className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm font-medium">
              {isCreating
                ? "Clique para selecionar as fotos"
                : "Clique para enviar mais fotos"}
            </p>
            <p className="text-xs text-muted-foreground">
              Você pode escolher várias de uma vez (JPG, PNG, WebP)
            </p>
          </>
        )}
        <input
          id="upload-multiplas"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleUpload(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {/* ═══════════ GRID DE IMAGENS ═══════════ */}
      {totalImagens === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center rounded-lg border border-dashed">
          <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            Nenhuma foto {isCreating ? "selecionada" : "cadastrada"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {isCreating
              ? "Selecione fotos — depois defina qual será a capa."
              : "Envie fotos para começar."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {/* ═══ IMAGENS JÁ SALVAS (modo edição) ═══ */}
            {imagens.map((url, index) => {
              const isCapa = url === capaAtual;
              return (
                <div
                  key={`url-${url}-${index}`}
                  className={cn(
                    "group relative aspect-[4/3] overflow-hidden rounded-lg border-2 transition-all",
                    isCapa
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border/60 hover:border-border"
                  )}
                >
                  <Image
                    src={url}
                    alt={`Foto ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  />

                  {/* Badge "Capa" */}
                  {isCapa && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-semibold shadow-sm">
                      <Star className="h-3 w-3 fill-current" />
                      Capa
                    </div>
                  )}

                  {/* Overlay com ações */}
                  <div
                    className={cn(
                      "absolute inset-0 flex items-center justify-center gap-2",
                      "bg-black/60 backdrop-blur-sm opacity-0 transition-opacity",
                      "group-hover:opacity-100"
                    )}
                  >
                    {!isCapa && (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => handleSetCapa(url)}
                        className="h-8 text-xs"
                      >
                        <Star className="mr-1 h-3 w-3" />
                        Definir capa
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      onClick={() => handleRemove(url)}
                      className="h-8 w-8"
                      aria-label="Remover"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Número */}
                  <div className="absolute bottom-2 right-2 rounded-full bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 text-[10px] font-medium">
                    {index + 1}
                  </div>
                </div>
              );
            })}

            {/* ═══ ARQUIVOS PENDENTES (modo criação) ═══ */}
            {pendingFiles.map((file, index) => {
              const previewUrl = URL.createObjectURL(file);
              const isCapaPendente = index === capaPendenteIndex;
              return (
                <div
                  key={`pending-${file.name}-${index}`}
                  className={cn(
                    "group relative aspect-[4/3] overflow-hidden rounded-lg border-2 transition-all",
                    isCapaPendente
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-dashed border-amber-300 dark:border-amber-800"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt={file.name}
                    className="absolute inset-0 h-full w-full object-cover"
                    onLoad={() => URL.revokeObjectURL(previewUrl)}
                  />

                  {/* Badge "Capa" */}
                  {isCapaPendente && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-semibold shadow-sm">
                      <Star className="h-3 w-3 fill-current" />
                      Capa
                    </div>
                  )}

                  {/* Overlay com ações */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100">
                    {!isCapaPendente && (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => setCapaPendenteIndex(index)}
                        className="h-8 text-xs"
                      >
                        <Star className="mr-1 h-3 w-3" />
                        Definir capa
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      onClick={() => handleRemovePending(index)}
                      className="h-8 w-8"
                      aria-label="Remover"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Número */}
                  <div className="absolute bottom-2 right-2 rounded-full bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 text-[10px] font-medium">
                    {imagens.length + index + 1}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ═══════════ DICA ═══════════ */}
          <p className="text-xs text-muted-foreground text-center">
            💡 Passe o mouse sobre uma foto e clique em{" "}
            <strong>Definir capa</strong> para destacá-la.
            {isCreating && " As fotos serão enviadas ao cadastrar o veículo."}
          </p>
        </>
      )}
    </div>
  );
}