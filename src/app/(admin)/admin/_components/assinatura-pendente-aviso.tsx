import { Info } from "lucide-react";

interface AssinaturaPendenteAvisoProps {
  /**
   * Se `true`, mostra mensagem mais urgente (bloqueado).
   * Se `false`, mostra mensagem "pendente" (tolerância).
   */
  bloqueado?: boolean;
}

export function AssinaturaPendenteAviso({
  bloqueado = false,
}: AssinaturaPendenteAvisoProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 mt-0.5">
        <Info className="h-4 w-4 text-destructive/70" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-foreground">
          {bloqueado
            ? "Assinatura inativa"
            : "Assinatura aguardando pagamento"}
        </p>
        <p className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">
          {bloqueado
            ? "O acesso à edição de veículos está desabilitado até a regularização do pagamento."
            : "Regularize o pagamento para manter o acesso completo à edição de veículos."}
        </p>
      </div>
    </div>
  );
}