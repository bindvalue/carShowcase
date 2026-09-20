import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import {
  calcularStatusAssinatura,
  podeGerenciarVeiculos,
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
 * Guarda de proteção para páginas de veículos.
 * Redireciona para /admin/assinatura se o usuário está bloqueado.
 *
 * Uso: chame no topo de qualquer página do admin/veiculos.
 */
export async function guardVeiculosAccess() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

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

  if (!podeGerenciarVeiculos(info)) {
    redirect("/admin/assinatura?bloqueado=true");
  }
}