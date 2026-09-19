// src/lib/env.ts

// ═══════════════════════════════════════════════════════
// SUPABASE
// ═══════════════════════════════════════════════════════

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ═══════════════════════════════════════════════════════
// ASAAS
// ═══════════════════════════════════════════════════════
//
// ⚠️ A chave no .env.local está SEM o "$" no começo.
// Motivo: o parser do Next/dotenv interpreta "$VAR" como variável e
// substitui por string vazia. Então removemos o "$" do .env e
// re-adicionamos AQUI no código.
//
// A chave do Asaas exige o "$" no começo. Sem ele → 401.

const rawAsaasKey = process.env.NEXT_PUBLIC_ASAAS_API_KEY ?? "";

export const ASAAS_API_KEY = rawAsaasKey
  ? rawAsaasKey.startsWith("$")
    ? rawAsaasKey
    : `$${rawAsaasKey}`
  : "";

export const ASAAS_API_URL =
  process.env.NEXT_PUBLIC_ASAAS_API_URL ?? "https://api.asaas.com/v3";

export const ASAAS_IS_SANDBOX = ASAAS_API_URL.includes("sandbox");

export const ASAAS_WEBHOOK_TOKEN =
  process.env.ASAAS_WEBHOOK_TOKEN ?? undefined;

  import { z } from "zod";

z.config({
  jitless: true,
});