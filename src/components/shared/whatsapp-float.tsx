"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/hooks/use-site-settings";

export function WhatsAppFloat() {
  const { settings, loading } = useSiteSettings();
  const [showTooltip, setShowTooltip] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Mostra o tooltip depois de 3 segundos
  useEffect(() => {
    if (dismissed) return;
    const timer = setTimeout(() => setShowTooltip(true), 3000);
    return () => clearTimeout(timer);
  }, [dismissed]);

  // Não renderiza se estiver desabilitado
  if (loading || settings.whatsapp_enabled !== "true") return null;
  if (!settings.whatsapp_number) return null;

  const url = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(
    settings.whatsapp_message
  )}`;

  return (
    <>
      {/* Balão com mensagem (aparece após 3s) */}
      {showTooltip && !dismissed && (
        <div className="fixed bottom-24 right-6 z-50 max-w-[280px] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="relative rounded-2xl border bg-background p-4 shadow-xl">
            <button
              onClick={() => {
                setShowTooltip(false);
                setDismissed(true);
              }}
              className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border bg-background text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Fechar"
            >
              <X className="h-3 w-3" />
            </button>

            <p className="text-sm font-semibold">Precisa de ajuda?</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {settings.whatsapp_message}
            </p>

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Iniciar conversa
            </a>

            {/* Setinha do balão */}
            <div className="absolute -bottom-2 right-6 h-4 w-4 rotate-45 border-b border-r bg-background" />
          </div>
        </div>
      )}

      {/* Botão flutuante principal */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={settings.whatsapp_label}
        className={cn(
          "group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition-all",
          "hover:scale-110 hover:bg-green-700 hover:shadow-xl",
          "focus:outline-none focus:ring-4 focus:ring-green-500/30"
        )}
        onMouseEnter={() => setShowTooltip(true)}
      >
        {/* Pulso animado */}
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-green-500 opacity-30" />

        <MessageCircle className="h-7 w-7 transition-transform group-hover:scale-110" />
      </a>
    </>
  );
}