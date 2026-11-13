"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { sincronizarAssinaturaAction } from "@/actions/assinatura.actions";

export function AssinaturaSincronizarButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function handleClick() {
    setMsg(null);
    startTransition(async () => {
      const res = await sincronizarAssinaturaAction();
      if (!res.success) {
        setMsg(res.error ?? "Erro ao sincronizar");
        return;
      }
      if (res.subscribed) {
        setMsg("Pagamento confirmado! Acesso liberado.");
        router.refresh();
      } else {
        setMsg("Nenhum pagamento confirmado encontrado no Asaas.");
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-[12px] font-medium text-foreground transition hover:bg-muted disabled:opacity-60"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${pending ? "animate-spin" : ""}`} />
        {pending ? "Sincronizando..." : "Já paguei – sincronizar pagamento"}
      </button>
      {msg && <p className="text-[12px] text-muted-foreground">{msg}</p>}
    </div>
  );
}
