"use client";

import { useState, useTransition } from "react";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  CreditCard,
  AlertTriangle,
  ExternalLink,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatBRL } from "@/lib/formatters";
import { cancelarAssinatura } from "@/actions/assinatura.actions";
import { PLANO } from "@/lib/plano";

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// TIPOS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

interface AssinaturaStatus {
  temAssinatura: boolean;
  subscribed: boolean;
  customerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: string;
  subscriptionEnd?: string;
  nextDueDate?: string;
  lastPaymentAt?: string;
  lastPaymentValue?: number;
  monthlyPrice?: number;
  isLifetime?: boolean;
  email?: string;
}

interface PagamentoPendente {
  id: string;
  value: number;
  dueDate: string;
  status: string;
  invoiceUrl: string | null;
  bankSlipUrl: string | null;
}

interface AssinaturaCardProps {
  status: AssinaturaStatus;
  pagamentoPendente?: PagamentoPendente | null;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// COMPONENTE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export function AssinaturaCard({
  status,
  pagamentoPendente,
}: AssinaturaCardProps) {
  const [openCancel, setOpenCancel] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleCancelar = () => {
    startTransition(async () => {
      const result = await cancelarAssinatura();
      if (result.success) {
        toast.success("Assinatura cancelada");
        setOpenCancel(false);
      } else {
        toast.error(result.error || "Erro ao cancelar");
      }
    });
  };

  // â•â•â•â•â•â•â•â•â•â•â• VITALÃCIO â•â•â•â•â•â•â•â•â•â•â•
  if (status.isLifetime) {
    return (
      <Card className="border-green-200 dark:border-green-900/60 bg-green-50/30 dark:bg-green-950/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Acesso VitalÃ­cio
            </CardTitle>
            <Badge className="bg-green-600 hover:bg-green-600">
              Sem expiraÃ§Ã£o
            </Badge>
          </div>
          <CardDescription>
            VocÃª tem acesso vitalÃ­cio ao sistema. Nenhuma cobranÃ§a serÃ¡ feita.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // â•â•â•â•â•â•â•â•â•â•â• SEM ASSINATURA â•â•â•â•â•â•â•â•â•â•â•
  if (!status.temAssinatura) {
    return (
      <Card className="border-orange-200 dark:border-orange-900/60 bg-orange-50/30 dark:bg-orange-950/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Sem assinatura ativa
            </CardTitle>
          </div>
          <CardDescription>
            Ative sua assinatura para continuar usando o sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Plano Ãºnico: <strong>{PLANO.valorFormatado}/mÃªs</strong> com
            vencimento no dia que vocÃª escolher (atÃ© dia 15).
          </p>
        </CardContent>
      </Card>
    );
  }

  // â•â•â•â•â•â•â•â•â•â•â• ASSINATURA ATIVA â•â•â•â•â•â•â•â•â•â•â•
  const isAtiva = status.subscribed;
  const vencimento = status.subscriptionEnd
    ? new Date(status.subscriptionEnd)
    : null;

  return (
    <>
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Assinatura
            </CardTitle>
            {isAtiva ? (
              <Badge className="bg-green-600 hover:bg-green-600">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Ativa
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="mr-1 h-3 w-3" />
                Inativa
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* â”€â”€â”€ Info â”€â”€â”€ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Valor mensal</p>
              <p className="text-lg font-bold">
                {formatBRL(status.monthlyPrice || 155)}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">VÃ¡lido atÃ©</p>
              <p className="text-lg font-bold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                {vencimento ? vencimento.toLocaleDateString("pt-BR") : "â€”"}
              </p>
            </div>

            {status.nextDueDate && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  PrÃ³ximo vencimento
                </p>
                <p className="text-sm font-medium">
                  {new Date(status.nextDueDate).toLocaleDateString("pt-BR")}
                </p>
              </div>
            )}

            {status.lastPaymentAt && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Ãšltimo pagamento
                </p>
                <p className="text-sm font-medium">
                  {new Date(status.lastPaymentAt).toLocaleDateString("pt-BR")}{" "}
                  Â· {formatBRL(status.lastPaymentValue || 0)}
                </p>
              </div>
            )}
          </div>

          {/* â•â•â•â•â•â•â•â•â•â•â• PAGAMENTO PENDENTE â•â•â•â•â•â•â•â•â•â•â• */}
          {pagamentoPendente && (
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 mt-0.5">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {pagamentoPendente.status === "OVERDUE"
                      ? "Boleto vencido"
                      : "Boleto aguardando pagamento"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Vencimento em{" "}
                    <span className="text-foreground">
                      {new Date(
                        pagamentoPendente.dueDate + "T00:00:00"
                      ).toLocaleDateString("pt-BR")}
                    </span>{" "}
                    Â· Valor{" "}
                    <span className="text-foreground font-medium">
                      {formatBRL(pagamentoPendente.value)}
                    </span>
                  </p>
                </div>
              </div>

              {pagamentoPendente.invoiceUrl && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-10 text-[14px] font-medium border-border hover:bg-foreground hover:text-background transition-colors"
                >
                  <a
                    href={pagamentoPendente.invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-3.5 w-3.5" />
                    Abrir boleto
                  </a>
                </Button>
              )}

              <p className="text-[11px] text-muted-foreground text-center">
                O acesso Ã© liberado automaticamente apÃ³s a confirmaÃ§Ã£o.
              </p>
            </div>
          )}

          {/* â”€â”€â”€ AÃ§Ãµes â”€â”€â”€ */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setOpenCancel(true)}
              className="h-11 text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancelar assinatura
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* â”€â”€â”€ Dialog de cancelamento â”€â”€â”€ */}
      <Dialog open={openCancel} onOpenChange={setOpenCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Cancelar assinatura?
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2">
                <p>
                  Ao cancelar, vocÃª manterÃ¡ acesso atÃ©{" "}
                  <strong>
                    {vencimento
                      ? vencimento.toLocaleDateString("pt-BR")
                      : "o fim do perÃ­odo atual"}
                  </strong>
                  . Depois disso, o sistema serÃ¡ bloqueado.
                </p>
                <p className="text-xs text-muted-foreground">
                  VocÃª pode reativar a qualquer momento.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setOpenCancel(false)}
              disabled={isPending}
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelar}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                "Sim, cancelar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}