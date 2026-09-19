"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface VehicleGalleryProps {
  imagens: string[];
  alt: string;
}

export function VehicleGallery({ imagens, alt }: VehicleGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(false);

  if (!imagens.length) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-xl bg-muted text-muted-foreground">
        Sem imagens disponíveis
      </div>
    );
  }

  const next = () => setCurrent((c) => (c + 1) % imagens.length);
  const prev = () => setCurrent((c) => (c - 1 + imagens.length) % imagens.length);

  return (
    <div className="space-y-3">
      {/* Imagem principal */}
      <div className="group relative aspect-[16/10] overflow-hidden rounded-xl bg-muted">
        <Image
          src={imagens[current]}
          alt={`${alt} - Foto ${current + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 66vw"
          priority
        />

        {/* Setas */}
        {imagens.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
              aria-label="Próxima foto"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Contador */}
        <div className="absolute bottom-3 right-3 rounded-full bg-background/80 backdrop-blur-sm px-3 py-1 text-xs font-medium">
          {current + 1} / {imagens.length}
        </div>

        {/* Botão expandir */}
        <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <button
            className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
            aria-label="Ampliar"
            >
            <Expand className="h-4 w-4" />
            </button>
        </DialogTrigger>

        <DialogContent
            className="!max-w-[95vw] !w-[95vw] !h-[90vh] !p-0 !gap-0 !bg-background overflow-hidden flex flex-col"
            showCloseButton={true}
        >
            {/* Imagem em tela cheia */}
            <div className="relative flex-1 w-full bg-black/95">
            <Image
                src={imagens[current]}
                alt={alt}
                fill
                className="object-contain"
                sizes="95vw"
                priority
            />

            {/* Setas no modal */}
            {imagens.length > 1 && (
                <>
                <button
                    onClick={prev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                    aria-label="Foto anterior"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                    onClick={next}
                    className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                    aria-label="Próxima foto"
                >
                    <ChevronRight className="h-6 w-6" />
                </button>
                </>
            )}

            {/* Contador no modal */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-background/80 backdrop-blur-sm px-4 py-1.5 text-sm font-medium">
                {current + 1} / {imagens.length}
            </div>
            </div>

            {/* Miniaturas no rodapé */}
            {imagens.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto bg-background border-t shrink-0">
                {imagens.map((img, i) => (
                <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={cn(
                    "relative h-20 w-28 shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                    i === current
                        ? "border-primary"
                        : "border-transparent hover:border-border"
                    )}
                >
                    <Image
                    src={img}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="112px"
                    />
                </button>
                ))}
            </div>
            )}
        </DialogContent>
        </Dialog>
      </div>

      {/* Miniaturas */}
      {imagens.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {imagens.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                i === current
                  ? "border-primary"
                  : "border-transparent hover:border-border"
              )}
              aria-label={`Ver foto ${i + 1}`}
            >
              <Image src={img} alt="" fill className="object-cover" sizes="96px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}