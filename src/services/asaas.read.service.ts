// src/services/asaas.read.service.ts
import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl, getSupabaseServiceRoleKey } from "@/lib/env";

function getSupabaseAdmin() {
  return createClient(
    getSupabaseUrl(),
    getSupabaseServiceRoleKey(),
    { auth: { persistSession: false } }
  );
}

export async function getAssinaturaStatus(userId: string) {
  // ... (move a função de getAssinaturaStatus pra cá)
}

export async function getHistoricoPagamentos(userId: string, limit = 12) {
  // ... (move a função de getHistoricoPagamentos pra cá)
}