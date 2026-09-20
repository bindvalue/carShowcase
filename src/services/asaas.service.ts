import "server-only";
import {
  createAsaasCustomer,
  createAsaasSubscription,
  cancelAsaasSubscription,
  listAsaasPayments,
} from "@/lib/asaas/client";
import { createClient } from "@supabase/supabase-js";
import {
  getSupabaseUrl,
  getSupabaseServiceRoleKey,
} from "@/lib/env";
import { PLANO } from "@/lib/plano";

// ═══════════════════════════════════════════════════════
// SUPABASE ADMIN (lazy)
// ═══════════════════════════════════════════════════════

function getSupabaseAdmin() {
  return createClient(
    getSupabaseUrl(),
    getSupabaseServiceRoleKey(),
    { auth: { persistSession: false } }
  );
}

// ═══════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════

export interface CriarAssinaturaInput {
  userId: string;
  email: string;
  nome: string;
  cpfCnpj: string;
  telefone?: string;
  billingType: "BOLETO" | "PIX" | "CREDIT_CARD";
  nextDueDate: string;
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
}

interface AsaasPayment {
  id: string;
  value: number;
  netValue: number;
  status: string;
  dueDate: string;
  clientPaymentDate?: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
}

export interface PagamentoPendente {
  id: string;
  value: number;
  dueDate: string;
  status: string;
  invoiceUrl: string | null;
  bankSlipUrl: string | null;
}

// ═══════════════════════════════════════════════════════
// CRIAR CLIENTE + ASSINATURA
// ═══════════════════════════════════════════════════════

export async function criarAssinatura(input: CriarAssinaturaInput) {
  const supabaseAdmin = getSupabaseAdmin();

  const { userId, email, nome, cpfCnpj, telefone, billingType, nextDueDate } =
    input;

  if (!userId) throw new Error("userId é obrigatório");
  if (!email) throw new Error("email é obrigatório");
  if (!nome) throw new Error("nome é obrigatório");
  if (!cpfCnpj) throw new Error("cpfCnpj é obrigatório");
  if (!billingType) throw new Error("billingType é obrigatório");
  if (!nextDueDate) throw new Error("nextDueDate é obrigatório");

  const cpfLimpo = cpfCnpj.replace(/\D/g, "");
  if (cpfLimpo.length !== 11 && cpfLimpo.length !== 14) {
    throw new Error("CPF/CNPJ inválido");
  }

  const { data: existente, error: erroBusca } = await supabaseAdmin
    .from("subscribers")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (erroBusca) {
    console.error("[Asaas] Erro ao buscar subscriber:", erroBusca);
    throw new Error("Falha ao consultar assinatura existente");
  }

  if (existente?.asaas_customer_id && existente.subscribed) {
    return {
      jaAssinante: true,
      customerId: existente.asaas_customer_id,
      subscriptionId: existente.asaas_subscription_id,
      nextDueDate: existente.next_due_date ?? nextDueDate,
    };
  }

  let customerId = existente?.asaas_customer_id;

  if (!customerId) {
    try {
      const customer = await createAsaasCustomer({
        name: nome,
        email,
        cpfCnpj: cpfLimpo,
        mobilePhone: telefone?.replace(/\D/g, ""),
        externalReference: userId,
      });

      if (!customer?.id) {
        throw new Error("Asaas não retornou ID do cliente");
      }

      customerId = customer.id;
    } catch (err) {
      console.error("[Asaas] Erro ao criar customer:", err);
      throw new Error(
        err instanceof Error
          ? `Erro ao criar cliente: ${err.message}`
          : "Falha ao criar cliente no Asaas"
      );
    }
  }

  let subscriptionId: string;
  try {
    const subscription = await createAsaasSubscription({
      customer: customerId,
      billingType,
      value: PLANO.valor,
      nextDueDate,
      cycle: PLANO.ciclo,
      description: PLANO.descricao,
      externalReference: userId,
      creditCard: input.creditCard,
      creditCardHolderInfo: input.creditCardHolderInfo,
    });

    if (!subscription?.id) {
      throw new Error("Asaas não retornou ID da assinatura");
    }
    subscriptionId = subscription.id;
  } catch (err) {
    console.error("[Asaas] Erro ao criar subscription:", err);
    throw new Error(
      err instanceof Error ? err.message : "Falha ao criar assinatura no Asaas"
    );
  }

  const { error: erroUpsert } = await supabaseAdmin.from("subscribers").upsert(
    {
      user_id: userId,
      email,
      asaas_customer_id: customerId,
      asaas_subscription_id: subscriptionId,
      asaas_subscription_status: "ACTIVE",
      subscribed: true,
      monthly_price: PLANO.valor,
      next_due_date: nextDueDate,
      subscription_end: nextDueDate,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (erroUpsert) {
    console.error("[Asaas] Erro ao salvar no banco:", erroUpsert);
    try {
      await cancelAsaasSubscription(subscriptionId);
    } catch (rollbackErr) {
      console.error("[Asaas] Falha no rollback:", rollbackErr);
    }
    throw new Error("Falha ao salvar assinatura no banco");
  }

  return { jaAssinante: false, customerId, subscriptionId, nextDueDate };
}

// ═══════════════════════════════════════════════════════
// CANCELAR
// ═══════════════════════════════════════════════════════

export async function cancelarAssinatura(userId: string) {
  const supabaseAdmin = getSupabaseAdmin();

  if (!userId) throw new Error("userId é obrigatório");

  const { data: subscriber, error: erroBusca } = await supabaseAdmin
    .from("subscribers")
    .select("asaas_subscription_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (erroBusca) throw new Error("Falha ao consultar assinatura");
  if (!subscriber?.asaas_subscription_id) {
    throw new Error("Assinatura não encontrada");
  }

  try {
    await cancelAsaasSubscription(subscriber.asaas_subscription_id);
  } catch (err) {
    console.error("[Asaas] Erro ao cancelar no Asaas:", err);
    throw new Error("Falha ao cancelar assinatura no Asaas");
  }

  const { error: erroUpdate } = await supabaseAdmin
    .from("subscribers")
    .update({
      subscribed: false,
      asaas_subscription_status: "INACTIVE",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (erroUpdate) {
    throw new Error(
      "Assinatura cancelada no Asaas, mas falhou ao atualizar banco"
    );
  }

  return { success: true };
}

// ═══════════════════════════════════════════════════════
// BUSCAR STATUS
// ═══════════════════════════════════════════════════════

export async function getAssinaturaStatus(userId: string) {
  if (!userId) {
    return { temAssinatura: false, subscribed: false };
  }

  const supabaseAdmin = getSupabaseAdmin();

  const { data: subscriber, error } = await supabaseAdmin
    .from("subscribers")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[Asaas] Erro ao buscar status:", error);
    return { temAssinatura: false, subscribed: false };
  }
  if (!subscriber) {
    return { temAssinatura: false, subscribed: false };
  }

  return {
    temAssinatura: !!subscriber.asaas_customer_id,
    subscribed: subscriber.subscribed ?? false,
    customerId: subscriber.asaas_customer_id ?? undefined,
    subscriptionId: subscriber.asaas_subscription_id ?? undefined,
    subscriptionStatus: subscriber.asaas_subscription_status ?? undefined,
    subscriptionEnd: subscriber.subscription_end ?? undefined,
    nextDueDate: subscriber.next_due_date ?? undefined,
    lastPaymentAt: subscriber.last_payment_at ?? undefined,
    lastPaymentValue: subscriber.last_payment_value ?? undefined,
    monthlyPrice: subscriber.monthly_price ?? undefined,
    isLifetime: subscriber.is_lifetime ?? false,
    email: subscriber.email ?? undefined,
  };
}

// ═══════════════════════════════════════════════════════
// HISTÓRICO DE PAGAMENTOS
// ═══════════════════════════════════════════════════════

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
  if (!subscriber?.asaas_subscription_id) return [];

  try {
    const result = await listAsaasPayments({
      subscription: subscriber.asaas_subscription_id,
      limit,
    });
    return (result?.data ?? []) as AsaasPayment[];
  } catch (err) {
    console.error("[Asaas] Erro ao buscar histórico:", err);
    return [];
  }
}

// ═══════════════════════════════════════════════════════
// PRÓXIMO PAGAMENTO PENDENTE
// ═══════════════════════════════════════════════════════

export async function getProximoPagamentoPendente(
  userId: string
): Promise<PagamentoPendente | null> {
  if (!userId) return null;

  const supabaseAdmin = getSupabaseAdmin();

  const { data: subscriber, error } = await supabaseAdmin
    .from("subscribers")
    .select("asaas_subscription_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !subscriber?.asaas_subscription_id) return null;

  try {
    const subscriptionId = subscriber.asaas_subscription_id;

    const [pending, overdue] = await Promise.all([
      listAsaasPayments({
        subscription: subscriptionId,
        status: "PENDING",
        limit: 5,
      }),
      listAsaasPayments({
        subscription: subscriptionId,
        status: "OVERDUE",
        limit: 5,
      }),
    ]);

    type PaymentRow = {
      id: string;
      value: number;
      dueDate: string;
      status: string;
      invoiceUrl?: string;
      bankSlipUrl?: string;
    };

    const todos: PaymentRow[] = [
      ...((pending?.data ?? []) as PaymentRow[]),
      ...((overdue?.data ?? []) as PaymentRow[]),
    ];

    if (todos.length === 0) return null;

    const proximo = todos.sort((a, b) =>
      a.dueDate.localeCompare(b.dueDate)
    )[0];

    return {
      id: proximo.id,
      value: proximo.value,
      dueDate: proximo.dueDate,
      status: proximo.status,
      invoiceUrl: proximo.invoiceUrl ?? null,
      bankSlipUrl: proximo.bankSlipUrl ?? null,
    };
  } catch (err) {
    console.error("[Asaas] Erro ao buscar pagamento pendente:", err);
    return null;
  }
}