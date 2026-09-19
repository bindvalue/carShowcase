import { FileText, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL } from "@/lib/formatters";

interface Pagamento {
  id: string;
  value: number;
  netValue: number;
  status: string;
  dueDate: string;
  clientPaymentDate?: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
}

interface AssinaturaHistoryProps {
  pagamentos: Pagamento[];
}

const STATUS_MAP: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle2 }
> = {
  RECEIVED: { label: "Pago", variant: "default", icon: CheckCircle2 },
  CONFIRMED: { label: "Confirmado", variant: "default", icon: CheckCircle2 },
  PENDING: { label: "Aguardando", variant: "secondary", icon: Clock },
  OVERDUE: { label: "Vencido", variant: "destructive", icon: XCircle },
  REFUNDED: { label: "Estornado", variant: "outline", icon: XCircle },
};

export function AssinaturaHistory({ pagamentos }: AssinaturaHistoryProps) {
  if (pagamentos.length === 0) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Histórico de pagamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-8 w-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">
              Nenhum pagamento registrado ainda.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Histórico de pagamentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {pagamentos.map((pag) => {
            const statusInfo =
              STATUS_MAP[pag.status] || {
                label: pag.status,
                variant: "outline" as const,
                icon: Clock,
              };
            const Icon = statusInfo.icon;
            const dataRef = pag.clientPaymentDate || pag.dueDate;

            return (
              <div
                key={pag.id}
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/40 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {new Date(dataRef + "T00:00:00").toLocaleDateString(
                      "pt-BR",
                      { day: "2-digit", month: "long", year: "numeric" }
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Vencimento:{" "}
                    {new Date(pag.dueDate + "T00:00:00").toLocaleDateString(
                      "pt-BR"
                    )}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-bold">{formatBRL(pag.value)}</p>
                  <Badge variant={statusInfo.variant} className="text-[10px] mt-1">
                    {statusInfo.label}
                  </Badge>
                </div>

                {pag.invoiceUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="shrink-0"
                  >
                    <a
                      href={pag.invoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileText className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}