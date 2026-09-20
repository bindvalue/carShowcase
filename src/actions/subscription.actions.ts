"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import {
  calcularStatusAssinatura,
  podeGerenciarVeiculos,
  type SubscriptionInfo,
} from "@/lib/subscription";
import {
  getSupabaseUrl,
  getSupabaseServiceRoleKey,
} from "@/lib/env";

// ⚠️ Lazy — não roda no build
function getSupabaseAdmin() {
  return createAdminClient(
    getSupabaseUrl(),
    getSupabaseServiceRoleKey(),
    { auth: { persistSession: false } }
  );
}

/**
 * Retorna o status de assinatura do usuário logado.
 */
export async function getMeuStatusAssinatura(): Promise<SubscriptionInfo | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const supabaseAdmin = getSupabaseAdmin();

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

  return info;
}

/**
 * Verifica se o usuário logado pode gerenciar veículos.
 */
export async function possoGerenciarVeiculos(): Promise<boolean> {
  const info = await getMeuStatusAssinatura();
  if (!info) return false;
  return podeGerenciarVeiculos(info);
}