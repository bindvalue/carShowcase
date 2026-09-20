import "server-only";
import { createClient } from "@supabase/supabase-js";
import { listAsaasPayments } from "@/lib/asaas/client";
import {
  getSupabaseUrl,
  getSupabaseServiceRoleKey,
} from "@/lib/env";

// ⚠️ Lazy — não roda no build
function getSupabaseAdmin() {
  return createClient(
    getSupabaseUrl(),
    getSupabaseServiceRoleKey(),
    { auth: { persistSession: false } }
  );
}

export interface AsaasPayment {
  id: string;
  value: number;
  netValue: number;
  status: string;
  dueDate: string;
  clientPaymentDate?: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
}

export async function getHistoricoPagamentos(
  userId: string,
  limit = 12
): Promise<AsaasPayment[]> {
  if (!userId) return [];

  const supabaseAdmin = getSupabaseAdmin();

  const { data: subscriber, error } = await supabaseAdmin
    .from("subscribers")
    .select("asaas_subscription_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[Asaas] Erro ao buscar subscriber:", error);
    return [];
  }

  if (!subscriber?.asaas_subscription_id) {
    return [];
  }

  try {
    const result = await listAsaasPayments({
      subscription: subscriber.asaas_subscription_id,
      limit,
    });
    return (result?.data ?? []) as AsaasPayment[];
  } catch (err) {
    console.error("[Asaas] Erro ao buscar pagamentos:", err);
    return [];
  }
}