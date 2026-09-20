import "server-only";
import {
  getAsaasApiUrl,
  getAsaasApiKey,
  isAsaasSandbox as isAsaasSandboxEnv,
} from "@/lib/env";

// ═══════════════════════════════════════════════════════
// CONFIG (lazy — lê env vars quando chamado)
// ═══════════════════════════════════════════════════════

const REQUEST_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 2;

interface AsaasConfig {
  url: string;
  key: string;
  isSandbox: boolean;
}

function getAsaasConfig(): AsaasConfig {
  return {
    url: getAsaasApiUrl(),
    key: getAsaasApiKey(),
    isSandbox: isAsaasSandbox(),
  };
}

// ═══════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════

interface AsaasRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  idempotencyKey?: string;
}

interface AsaasErrorResponse {
  errors?: Array<{ code?: string; description?: string }>;
}

export interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
  externalReference?: string;
}

export interface AsaasSubscription {
  id: string;
  customer: string;
  value: number;
  nextDueDate: string;
  cycle: string;
  status: string;
  externalReference?: string;
}

export interface AsaasPayment {
  id: string;
  customer: string;
  subscription?: string;
  value: number;
  netValue: number;
  status: string;
  dueDate: string;
  clientPaymentDate?: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
}

// ═══════════════════════════════════════════════════════
// CORE FETCH
// ═══════════════════════════════════════════════════════

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function asaasFetch<T>(
  endpoint: string,
  options: AsaasRequestOptions = {}
): Promise<T> {
  const config = getAsaasConfig();
  const { method = "GET", body, idempotencyKey } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    access_token: config.key,
    "User-Agent": "WancarVeiculos/1.0",
  };
  if (idempotencyKey) {
    headers["X-Idempotency-Key"] = idempotencyKey;
  }

  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(`${config.url}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        cache: "no-store",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      const rawText = await response.text();
      let data: unknown = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        // resposta não-JSON
      }

      // Retry em 429 e 5xx
      if (
        (response.status === 429 || response.status >= 500) &&
        attempt < MAX_RETRIES
      ) {
        const wait = 500 * Math.pow(2, attempt);
        await sleep(wait);
        continue;
      }

      if (!response.ok) {
        const err = data as AsaasErrorResponse | null;
        const desc =
          err?.errors?.[0]?.description ||
          `Erro ${response.status} na API do Asaas`;
        // Log enxuto — só status e endpoint, sem body
        console.error(`[Asaas] ${response.status} ${method} ${endpoint}`);
        throw new Error(desc);
      }

      return data as T;
    } catch (err) {
      lastError = err;

      const isNetworkError =
        err instanceof Error &&
        (err.name === "TimeoutError" ||
          err.name === "AbortError" ||
          err.message.includes("fetch failed"));

      if (isNetworkError && attempt < MAX_RETRIES) {
        const wait = 500 * Math.pow(2, attempt);
        await sleep(wait);
        continue;
      }

      throw err;
    }
  }

  throw lastError ?? new Error("[Asaas] Falha desconhecida");
}

// ═══════════════════════════════════════════════════════
// CUSTOMERS
// ═══════════════════════════════════════════════════════

export async function createAsaasCustomer(data: {
  name: string;
  email: string;
  cpfCnpj: string;
  phone?: string;
  mobilePhone?: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  province?: string;
  externalReference?: string;
}): Promise<AsaasCustomer> {
  return asaasFetch("/customers", {
    method: "POST",
    body: data,
    idempotencyKey: data.externalReference
      ? `customer-${data.externalReference}`
      : undefined,
  });
}

export async function getAsaasCustomer(
  customerId: string
): Promise<AsaasCustomer> {
  return asaasFetch(`/customers/${customerId}`);
}

// ═══════════════════════════════════════════════════════
// SUBSCRIPTIONS
// ═══════════════════════════════════════════════════════

export async function createAsaasSubscription(data: {
  customer: string;
  billingType: "BOLETO" | "PIX" | "CREDIT_CARD" | "UNDEFINED";
  value: number;
  nextDueDate: string;
  cycle: "MONTHLY";
  description?: string;
  externalReference?: string;
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo?: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone?: string;
  };
}): Promise<AsaasSubscription> {
  return asaasFetch("/subscriptions", {
    method: "POST",
    body: data,
    idempotencyKey: data.externalReference
      ? `sub-${data.externalReference}-${data.nextDueDate}`
      : undefined,
  });
}

export async function cancelAsaasSubscription(
  subscriptionId: string
): Promise<{ deleted: boolean; id: string }> {
  return asaasFetch(`/subscriptions/${subscriptionId}`, {
    method: "DELETE",
  });
}

// ═══════════════════════════════════════════════════════
// PAYMENTS
// ═══════════════════════════════════════════════════════

export async function listAsaasPayments(params: {
  customer?: string;
  subscription?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: AsaasPayment[]; totalCount: number }> {
  const query = new URLSearchParams();
  if (params.customer) query.set("customer", params.customer);
  if (params.subscription) query.set("subscription", params.subscription);
  if (params.status) query.set("status", params.status);
  if (params.limit) query.set("limit", String(params.limit));
  if (params.offset) query.set("offset", String(params.offset));

  return asaasFetch(`/payments?${query.toString()}`);
}

// ═══════════════════════════════════════════════════════
// HELPERS DE AMBIENTE
// ═══════════════════════════════════════════════════════

export function isAsaasSandbox(): boolean {
  return getAsaasConfig().isSandbox;
}