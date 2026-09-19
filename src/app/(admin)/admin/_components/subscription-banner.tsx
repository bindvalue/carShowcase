import Link from "next/link";
import { AlertTriangle, ArrowRight, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { calcularStatusAssinatura } from "@/lib/subscription";
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from "@/lib/env";
import { Button } from "@/components/ui/button";

const supabaseAdmin = createAdminClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export async function SubscriptionBanner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: subscriber } = await supabaseAdmin
    .from("subscribers")
    .select("subscribed, is_lifetime, subscription_end")
    .eq("user_id", user.id)
    .maybeSingle();

  const info = calcularStatusAssinatura(
    subscriber as {
      subscribed: boolean;
      is_lifetime: boolean;
      subscription_end: string | null;
    } | null
  );

  // ═══════════ SEM AVISO ═══════════
  if (info.status === "vitalicio" || info.status === "sem_assinatura") {
    return null;
  }

  // ═══════════ AVISO PROATIVO (faltando ≤ 7 dias) ═══════════
  if (info.status === "ativo" && info.diasRestantes <= 7) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
              Sua assinatura vence em{" "}
              {info.diasRestantes === 1
                ? "1 dia"
                : `${info.diasRestantes} dias`}
            </p>
            <p className="text-xs text-amber-800/80 dark:text-amber-200/80 mt-0.5">
              Renove para não perder o acesso à edição de veículos.
            </p>
          </div>
        </div>

        <Button asChild className="h-10 shrink-0">
          <Link href="/admin/assinatura">
            Ver assinatura
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  // ═══════════ TOLERÂNCIA ═══════════
  if (info.status === "tolerancia") {
    const diasAtraso = Math.abs(info.diasRestantes);

    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
              Sua assinatura venceu há{" "}
              {diasAtraso === 1 ? "1 dia" : `${diasAtraso} dias`}
            </p>
            <p className="text-xs text-amber-800/80 dark:text-amber-200/80 mt-0.5">
              Regularize antes que o acesso seja bloqueado.
            </p>
          </div>
        </div>

        <Button asChild className="h-10 shrink-0">
          <Link href="/admin/assinatura">
            Regularizar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  // ═══════════ BLOQUEADO ═══════════
  if (info.status === "bloqueado") {
    const diasAtraso = Math.abs(info.diasRestantes);

    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </div>
          <div>
            <p className="text-sm font-semibold text-destructive">
              Sua assinatura está vencida
            </p>
            <p className="text-xs text-destructive/80 mt-0.5">
              Há {diasAtraso} {diasAtraso === 1 ? "dia" : "dias"} em atraso. O
              acesso à edição de veículos foi bloqueado.
            </p>
          </div>
        </div>

        <Button asChild variant="destructive" className="h-10 shrink-0">
          <Link href="/admin/assinatura">
            Regularizar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return null;
}