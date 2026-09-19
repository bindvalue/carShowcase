"use client";

import { useState } from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Paleta pré-definida de cores comuns para veículos
export const CORES_PRONTAS = [
  { nome: "Preto", hex: "#000000" },
  { nome: "Branco", hex: "#FFFFFF" },
  { nome: "Prata", hex: "#C0C0C0" },
  { nome: "Cinza", hex: "#808080" },
  { nome: "Vermelho", hex: "#DC2626" },
  { nome: "Azul", hex: "#2563EB" },
  { nome: "Verde", hex: "#16A34A" },
  { nome: "Amarelo", hex: "#FACC15" },
  { nome: "Laranja", hex: "#F97316" },
  { nome: "Marrom", hex: "#78350F" },
  { nome: "Bege", hex: "#D4B996" },
  { nome: "Dourado", hex: "#CA8A04" },
  { nome: "Vinho", hex: "#7F1D1D" },
  { nome: "Roxo", hex: "#9333EA" },
  { nome: "Rosa", hex: "#EC4899" },
  { nome: "Grafite", hex: "#374151" },
  { nome: "Bordô", hex: "#991B1B" },
  { nome: "Champagne", hex: "#E5D8B6" },
];

interface ColorPickerButtonProps {
  hex: string;
  onChange: (hex: string) => void;
}

export function ColorPickerButton({ hex, onChange }: ColorPickerButtonProps) {
  const [open, setOpen] = useState(false);
  const [customHex, setCustomHex] = useState(hex);

  const handleSelectPredefined = (novoHex: string) => {
    onChange(novoHex);
    setCustomHex(novoHex);
    setOpen(false);
  };

  const handleCustomHexChange = (valor: string) => {
    // Remove # e caracteres inválidos
    const limpo = valor.replace(/[^0-9A-Fa-f]/g, "").slice(0, 6);
    const comHash = limpo ? `#${limpo}` : "";
    setCustomHex(comHash);
    if (limpo.length === 6) {
      onChange(comHash);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-11 w-16 shrink-0 p-1"
          aria-label="Escolher cor"
        >
          {hex ? (
            <span
              className="h-full w-full rounded-md border"
              style={{ backgroundColor: hex }}
            />
          ) : (
            <Palette className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-3 z-[100]"
        align="start"
        sideOffset={4}
      >
        <div className="space-y-4">
          {/* Paleta pré-definida */}
          <div>
            <Label className="text-xs text-muted-foreground">
              Cores comuns
            </Label>
            <div className="grid grid-cols-6 gap-1.5 mt-2">
              {CORES_PRONTAS.map((cor) => (
                <button
                  key={cor.hex}
                  type="button"
                  onClick={() => handleSelectPredefined(cor.hex)}
                  className={cn(
                    "aspect-square rounded-md border-2 transition-all hover:scale-110",
                    hex === cor.hex
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border"
                  )}
                  style={{ backgroundColor: cor.hex }}
                  title={cor.nome}
                  aria-label={cor.nome}
                />
              ))}
            </div>
          </div>

          {/* HEX custom */}
          <div>
            <Label className="text-xs text-muted-foreground">
              Ou digite o HEX
            </Label>
            <div className="flex items-center gap-2 mt-2">
              <span
                className="h-10 w-10 rounded-md border shrink-0"
                style={{ backgroundColor: customHex || "#ffffff" }}
              />
              <Input
                value={customHex}
                onChange={(e) => handleCustomHexChange(e.target.value)}
                placeholder="#RRGGBB"
                className="font-mono uppercase h-10"
                maxLength={7}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}