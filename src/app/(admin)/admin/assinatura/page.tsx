import { Suspense } from "react";
import { CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  getAssinaturaStatus,
  getHistoricoPagamentos,
  getProximoPagamentoPendente,
} from "@/services/asaas.service";
import { AssinaturaCard } from "../_components/assinatura-card";
import { AssinaturaHistory } from "../_components/assinatura-history";
import { AssinaturaForm } from "../_components/assinatura-form";
import { Skeleton } from "@/components/ui/skeleton";
import { AssinaturaPendenteAviso } from "../_components/assinatura-pendente-aviso";

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// CONTEÃšDO (server component assÃ­ncrono)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

async function AssinaturaContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [status, pagamentos, pagamentoPendente] = await Promise.all([
    getAssinaturaStatus(user.id),
    getHistoricoPagamentos(user.id).catch(() => []),
    getProximoPagamentoPendente(user.id).catch(() => null),
  ]);

  // â•â•â•â•â•â•â•â•â•â•â• 3 ESTADOS â•â•â•â•â•â•â•â•â•â•â•
  // 1. Nunca assinou â†’ mostra form + aviso "sem assinatura"
  // 2. Assinou mas inadimplente â†’ aviso "inativo" + histÃ³rico
  // 3. Ativo â†’ card normal

  const nuncaAssinou = !status.temAssinatura && !status.isLifetime;
  const inadimplente =
    status.temAssinatura && !status.subscribed && !status.isLifetime;

  // Aviso aparece em QUALQUER caso onde o acesso estÃ¡ bloqueado
  const mostrarAviso = !status.isLifetime && (nuncaAssinou || inadimplente);

  return (
    <div className="space-y-6">
      {mostrarAviso && (
        <AssinaturaPendenteAviso bloqueado={inadimplente} />
      )}

      <AssinaturaCard
        status={status}
        pagamentoPendente={pagamentoPendente}
      />

      {/* FormulÃ¡rio sÃ³ se nunca assinou */}
      {nuncaAssinou && <AssinaturaForm />}

      {/* HistÃ³rico sempre que tiver pagamento */}
      {pagamentos.length > 0 && <AssinaturaHistory pagamentos={pagamentos} />}
    </div>
  );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// LOADING
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function AssinaturaLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-72 w-full rounded-xl" />
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// PÃGINA (export default)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export default function AssinaturaPage() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          Assinatura
        </h1>
        <p className="text-sm text-muted-foreground mt-2 ml-11">
          Gerencie sua assinatura mensal e visualize seus pagamentos.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Suspense fallback={<AssinaturaLoading />}>
          <AssinaturaContent />
        </Suspense>
      </div>
    </div>
  );
}