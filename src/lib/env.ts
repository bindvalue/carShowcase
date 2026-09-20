// src/lib/env.ts
//
// ⚠️ Todas as variáveis são expostas via FUNÇÕES, não constantes.
// Motivo: o `next build` do Cloudflare executa o código no top-level
// dos módulos durante o "Collecting page data", mas NÃO tem as env vars
// disponíveis (elas só existem em runtime no Worker).
//
// Se exportarmos `const SUPABASE_URL = process.env.X`, o valor vira
// `undefined` no build → `createClient` explode → build falha.
//
// Com funções, o `process.env` só é lido QUANDO a função é chamada
// (em runtime, no Worker), quando as vars estão disponíveis.

// ═══════════════════════════════════════════════════════
// SUPABASE
// ═══════════════════════════════════════════════════════

export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("[env] NEXT_PUBLIC_SUPABASE_URL não configurada");
  return url;
}

export function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error("[env] NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada");
  return key;
}

export function getSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("[env] SUPABASE_SERVICE_ROLE_KEY não configurada");
  return key;
}

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

export function getAsaasApiKey(): string {
  const raw = process.env.NEXT_PUBLIC_ASAAS_API_KEY ?? "";
  if (!raw) throw new Error("[env] NEXT_PUBLIC_ASAAS_API_KEY não configurada");
  return raw.startsWith("$") ? raw : `$${raw}`;
}

export function getAsaasApiUrl(): string {
  return process.env.NEXT_PUBLIC_ASAAS_API_URL ?? "https://api.asaas.com/v3";
}

export function isAsaasSandbox(): boolean {
  return getAsaasApiUrl().includes("sandbox");
}

export function getAsaasWebhookToken(): string | undefined {
  return process.env.NEXT_PUBLIC_ASAAS_WEBHOOK_TOKEN ?? undefined;
}