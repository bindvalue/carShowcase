import "server-only";
import {
  createAsaasCustomer,
  createAsaasSubscription,
  cancelAsaasSubscription,
} from "@/lib/asaas/client";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

const PLANO = {
  valor: 155.0,
  ciclo: "MONTHLY" as const,
  descricao: "Assinatura Wancar Veículos — Plano Mensal",
};

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

export async function criarAssinatura(input: CriarAssinaturaInput) {
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

  if (erroBusca) throw new Error("Falha ao consultar assinatura existente");

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
    const customer = await createAsaasCustomer({
      name: nome,
      email,
      cpfCnpj: cpfLimpo,
      mobilePhone: telefone?.replace(/\D/g, ""),
      externalReference: userId,
    });
    if (!customer?.id) throw new Error("Asaas não retornou ID do cliente");
    customerId = customer.id;
  }

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

  if (!subscription?.id) throw new Error("Asaas não retornou ID da assinatura");

  const { error: erroUpsert } = await supabaseAdmin.from("subscribers").upsert(
    {
      user_id: userId,
      email,
      asaas_customer_id: customerId,
      asaas_subscription_id: subscription.id,
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
    try {
      await cancelAsaasSubscription(subscription.id);
    } catch (rollbackErr) {
      console.error("[Asaas] Falha no rollback:", rollbackErr);
    }
    throw new Error("Falha ao salvar assinatura no banco");
  }

  return {
    jaAssinante: false,
    customerId,
    subscriptionId: subscription.id,
    nextDueDate,
  };
}

export async function cancelarAssinatura(userId: string) {
  if (!userId) throw new Error("userId é obrigatório");

  const { data: subscriber } = await supabaseAdmin
    .from("subscribers")
    .select("asaas_subscription_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!subscriber?.asaas_subscription_id) {
    throw new Error("Assinatura não encontrada");
  }

  await cancelAsaasSubscription(subscriber.asaas_subscription_id);

  await supabaseAdmin
    .from("subscribers")
    .update({
      subscribed: false,
      asaas_subscription_status: "INACTIVE",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  return { success: true };
}