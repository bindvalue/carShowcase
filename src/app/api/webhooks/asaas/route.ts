import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  ASAAS_WEBHOOK_TOKEN,
} from "@/lib/env";

const WEBHOOK_TOKEN = ASAAS_WEBHOOK_TOKEN;
const DIAS_TOLERANCIA_ATRASO = 5;

// ⚠️ Cria o cliente DENTRO da função (lazy) — não no top-level
function getSupabaseAdmin() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

interface AsaasPaymentPayload {
  id: string;
  customer: string;
  subscription?: string;
  value: number;
  netValue: number;
  status: string;
  dueDate: string;
  paymentDate?: string;
  clientPaymentDate?: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  description?: string;
  externalReference?: string;
}

interface AsaasSubscriptionPayload {
  id: string;
  customer: string;
  status: string;
  externalReference?: string;
}

interface AsaasWebhookPayload {
  id: string;
  event: string;
  payment?: AsaasPaymentPayload;
  subscription?: AsaasSubscriptionPayload;
}

export async function POST(request: Request) {
  const inicio = Date.now();

  try {
    if (!WEBHOOK_TOKEN) {
      console.error("[Webhook Asaas] ASAAS_WEBHOOK_TOKEN não configurado");
      return NextResponse.json({ error: "Config inválida" }, { status: 500 });
    }

    const token = request.headers.get("asaas-access-token");
    if (token !== WEBHOOK_TOKEN) {
      console.error("[Webhook Asaas] Token inválido");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = (await request.json()) as AsaasWebhookPayload;

    const userId =
      payload.payment?.externalReference ??
      payload.subscription?.externalReference;

    console.log("[Webhook Asaas] recebido", {
      event: payload.event,
      paymentId: payload.payment?.id,
      subscriptionId: payload.subscription?.id,
      userId,
      value: payload.payment?.value,
      status: payload.payment?.status,
    });

    if (!userId) {
      return NextResponse.json({ received: true, warning: "no_user_id" });
    }

    switch (payload.event) {
      case "PAYMENT_RECEIVED":
      case "PAYMENT_CONFIRMED":
        await handlePaymentSuccess(userId, payload);
        break;
      case "PAYMENT_OVERDUE":
        await handlePaymentOverdue(userId, payload);
        break;
      case "PAYMENT_REFUNDED":
      case "PAYMENT_DELETED":
      case "PAYMENT_RECEIVED_IN_CASH_UNDONE":
      case "PAYMENT_CHARGEBACK_REQUESTED":
      case "PAYMENT_CHARGEBACK_DISPUTE":
        await handlePaymentCancelled(userId, payload);
        break;
      case "SUBSCRIPTION_DELETED":
      case "SUBSCRIPTION_INACTIVATED":
        await handleSubscriptionCancelled(userId, payload);
        break;
      default:
        console.log(`[Webhook Asaas] Evento ignorado: ${payload.event}`);
    }

    console.log(`[Webhook Asaas] OK em ${Date.now() - inicio}ms`);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Webhook Asaas] ERRO:", err);
    return NextResponse.json({ received: true, error: "logged" });
  }
}

async function handlePaymentSuccess(userId: string, payload: AsaasWebhookPayload) {
  const payment = payload.payment;
  if (!payment) return;

  const supabase = getSupabaseAdmin();

  const proximoVencimento = addMesClampado(payment.dueDate);

  const { data: subscriber } = await supabase
    .from("subscribers")
    .select("id, email, is_lifetime")
    .eq("user_id", userId)
    .maybeSingle();

  if (!subscriber) return;

  const { error } = await supabase
    .from("subscribers")
    .update({
      subscribed: true,
      asaas_subscription_status: "ACTIVE",
      last_payment_id: payment.id,
      last_payment_at: payment.clientPaymentDate
        ? new Date(payment.clientPaymentDate).toISOString()
        : new Date().toISOString(),
      last_payment_value: payment.value,
      next_due_date: proximoVencimento,
      subscription_end: proximoVencimento,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    console.error("[Webhook Asaas] Erro ao atualizar pagamento:", error);
  }
}

async function handlePaymentOverdue(userId: string, payload: AsaasWebhookPayload) {
  const payment = payload.payment;
  if (!payment) return;

  const supabase = getSupabaseAdmin();
  const diasAtraso = calcularDiasAtraso(payment.dueDate);

  const { data: subscriber } = await supabase
    .from("subscribers")
    .select("email, is_lifetime")
    .eq("user_id", userId)
    .maybeSingle();

  if (!subscriber || subscriber.is_lifetime) return;

  if (diasAtraso > DIAS_TOLERANCIA_ATRASO) {
    await supabase
      .from("subscribers")
      .update({
        subscribed: false,
        asaas_subscription_status: "OVERDUE",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
  }
}

async function handlePaymentCancelled(userId: string, payload: AsaasWebhookPayload) {
  const supabase = getSupabaseAdmin();

  const { data: subscriber } = await supabase
    .from("subscribers")
    .select("is_lifetime")
    .eq("user_id", userId)
    .maybeSingle();

  if (!subscriber || subscriber.is_lifetime) return;

  await supabase
    .from("subscribers")
    .update({
      subscribed: false,
      asaas_subscription_status: "INACTIVE",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
}

async function handleSubscriptionCancelled(userId: string, payload: AsaasWebhookPayload) {
  const supabase = getSupabaseAdmin();

  const { data: subscriber } = await supabase
    .from("subscribers")
    .select("is_lifetime")
    .eq("user_id", userId)
    .maybeSingle();

  if (!subscriber || subscriber.is_lifetime) return;

  await supabase
    .from("subscribers")
    .update({
      subscribed: false,
      asaas_subscription_status: "INACTIVE",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
}

function addMesClampado(yyyymmdd: string): string {
  const [ano, mes, dia] = yyyymmdd.split("-").map(Number);
  const anoAlvo = mes === 12 ? ano + 1 : ano;
  const mesAlvo = mes === 12 ? 1 : mes + 1;
  const ultimoDia = new Date(anoAlvo, mesAlvo, 0).getDate();
  const diaAlvo = Math.min(dia, ultimoDia);
  return `${anoAlvo}-${String(mesAlvo).padStart(2, "0")}-${String(diaAlvo).padStart(2, "0")}`;
}

function calcularDiasAtraso(yyyymmdd: string): number {
  const [ano, mes, dia] = yyyymmdd.split("-").map(Number);
  const vencimento = new Date(ano, mes - 1, dia, 0, 0, 0, 0);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.floor((hoje.getTime() - vencimento.getTime()) / 86_400_000);
}