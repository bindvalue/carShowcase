// src/services/asaas.read.service.ts
import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function getAssinaturaStatus(userId: string) {
  // ... (move a função de getAssinaturaStatus pra cá)
}

export async function getHistoricoPagamentos(userId: string, limit = 12) {
  // ... (move a função de getHistoricoPagamentos pra cá)
}