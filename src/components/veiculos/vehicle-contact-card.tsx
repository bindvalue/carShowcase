"use client";

import { MessageCircle, Phone, Shield, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatBRL } from "@/lib/formatters";
import { SITE_CONFIG } from "@/lib/constants";
import type { Veiculo } from "@/types/veiculo";

interface VehicleContactCardProps {
  veiculo: Veiculo;
}

export function VehicleContactCard({ veiculo }: VehicleContactCardProps) {
  // Mensagem pré-formatada para o WhatsApp
  const mensagem = `Olá! Tenho interesse no ${veiculo.marca} ${veiculo.modelo} ${veiculo.ano} (anúncio #${veiculo.id.slice(0, 8)}). Ainda está disponível?`;

  // Usa o whatsapp_link do veículo ou o padrão do site
  const whatsappNumber = veiculo.whatsapp_link || SITE_CONFIG.whatsappDefault;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensagem)}`;

  // Simulação de parcela em 60x com juros
  const parcela = (veiculo.preco * 1.15) / 60;

  const handleShare = async () => {
    if (typeof navigator === "undefined") return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${veiculo.marca} ${veiculo.modelo}`,
          url: window.location.href,
        });
      } catch {
        // Usuário cancelou o compartilhamento — silencioso
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <Card className="sticky top-24 border-border/60 overflow-hidden">
      <CardContent className="p-6">
        {/* Preço */}
        <div>
          <p className="text-sm text-muted-foreground">A partir de</p>
          <p className="text-3xl font-bold text-foreground">
            {formatBRL(veiculo.preco)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            ou 60x de{" "}
            <span className="font-semibold text-foreground">
              {formatBRL(parcela)}
            </span>
          </p>
        </div>

        {/* Botões principais */}
        <div className="mt-6 space-y-3">
          <Button
            asChild
            size="lg"
            className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base"
          >
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-5 w-5" />
              Falar no WhatsApp
            </a>
          </Button>

          <Button asChild size="lg" variant="outline" className="w-full h-12">
            <a href={`tel:+${whatsappNumber}`}>
              <Phone className="mr-2 h-5 w-5" />
              Ligar agora
            </a>
          </Button>
        </div>

        {/* Ações secundárias */}
        <div className="mt-4 flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1">
            <Heart className="mr-2 h-4 w-4" />
            Favoritar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={handleShare}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Compartilhar
          </Button>
        </div>

        {/* Selo de confiança */}
        <div className="mt-6 flex items-start gap-3 rounded-lg bg-muted/50 p-3">
          <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-semibold">Anúncio verificado</p>
            <p className="text-muted-foreground mt-0.5">
              Documentação e procedência conferidas pela nossa equipe.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}