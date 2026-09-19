// scripts/testar-criar-assinatura.mjs
//
// Testa criar cliente + assinatura no Asaas sandbox
//
// Uso: node --env-file=.env.scripts scripts/testar-criar-assinatura.mjs

import { createClient } from "@supabase/supabase-js";

const ASAAS_URL = process.env.ASAAS_API_URL || "https://sandbox.asaas.com/api/v3";
const ASAAS_KEY = process.env.ASAAS_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!ASAAS_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Variáveis faltando. Verifique .env.scripts");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

// ═══════════════════════════════════════════════════════
// DADOS DE TESTE
// ═══════════════════════════════════════════════════════

const USER_ID = "370bd4ed-b32e-4876-a0f8-d0a807d51165"; // desenvolvimento
const EMAIL = "desenvolvimento@bindvalue.dev";
const NOME = "Wancar Teste Sandbox";
const CPF = "11144477735"; // CPF válido para testes
const TELEFONE = "31988887777";

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════

async function asaasFetch(endpoint, options = {}) {
  const response = await fetch(`${ASAAS_URL}${endpoint}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      access_token: ASAAS_KEY,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(`❌ Erro ${response.status}:`);
    console.error(JSON.stringify(data, null, 2));
    throw new Error(data?.errors?.[0]?.description || "Erro na API");
  }

  return data;
}

function calcularProximoDia15() {
  const hoje = new Date();
  const proximo = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 15);
  if (hoje.getDate() < 15) {
    proximo.setMonth(hoje.getMonth());
  }
  const ano = proximo.getFullYear();
  const mes = String(proximo.getMonth() + 1).padStart(2, "0");
  const dia = String(proximo.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

// ═══════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════

async function main() {
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║  TESTE: CRIAR ASSINATURA NO ASAAS SANDBOX        ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  // ─── 1. Verifica se já existe cliente com esse email ───
  console.log("🔍 Verificando se cliente já existe...");

  const buscaEmail = await asaasFetch(
    `/customers?email=${encodeURIComponent(EMAIL)}`
  );

  let customer;

  if (buscaEmail.totalCount > 0) {
    customer = buscaEmail.data[0];
    console.log(`ℹ️  Cliente já existe: ${customer.id}`);
  } else {
    console.log("📝 Criando cliente no Asaas...");

    customer = await asaasFetch("/customers", {
      method: "POST",
      body: {
        name: NOME,
        email: EMAIL,
        cpfCnpj: CPF,
        mobilePhone: TELEFONE,
        externalReference: USER_ID,
      },
    });

    console.log(`✅ Cliente criado: ${customer.id}`);
  }

  console.log(`   Nome: ${customer.name}`);
  console.log(`   Email: ${customer.email}`);
  console.log(`   externalReference: ${customer.externalReference}\n`);

  // ─── 2. Verifica se já existe assinatura ───
  console.log("🔍 Verificando se assinatura já existe...");

  const buscaAssinatura = await asaasFetch(
    `/subscriptions?customer=${customer.id}`
  );

  let subscription;

  if (buscaAssinatura.totalCount > 0) {
    subscription = buscaAssinatura.data[0];
    console.log(`ℹ️  Assinatura já existe: ${subscription.id}`);
  } else {
    const nextDueDate = calcularProximoDia15();
    console.log(`📅 Próximo vencimento: ${nextDueDate}`);
    console.log("📝 Criando assinatura...");

    subscription = await asaasFetch("/subscriptions", {
      method: "POST",
      body: {
        customer: customer.id,
        billingType: "BOLETO",
        value: 155.0,
        nextDueDate,
        cycle: "MONTHLY",
        description: "Assinatura Wancar Veículos — Plano Mensal",
        externalReference: USER_ID,
      },
    });

    console.log(`✅ Assinatura criada: ${subscription.id}`);
  }

  console.log(`   Valor: R$ ${subscription.value}`);
  console.log(`   Ciclo: ${subscription.cycle}`);
  console.log(`   Status: ${subscription.status}\n`);

  // ─── 3. Salva no banco ───
  console.log("💾 Salvando no banco de dados...");

  const { error } = await supabase.from("subscribers").upsert(
    {
      user_id: USER_ID,
      email: EMAIL,
      asaas_customer_id: customer.id,
      asaas_subscription_id: subscription.id,
      asaas_subscription_status: "ACTIVE",
      monthly_price: 155.0,
      next_due_date: new Date(
        subscription.nextDueDate + "T00:00:00"
      ).toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("❌ Erro ao salvar no banco:", error);
    process.exit(1);
  }

  console.log("✅ Salvo no banco!\n");

  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║  ✅ TESTE CONCLUÍDO COM SUCESSO                  ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  console.log(`🔗 Ver no painel Asaas sandbox:`);
  console.log(
    `   Cliente: https://sandbox.asaas.com/customer/show/${customer.id}`
  );
  console.log(
    `   Assinatura: https://sandbox.asaas.com/subscription/show/${subscription.id}\n`
  );
}

main().catch((err) => {
  console.error("\n❌ Erro:", err.message);
  process.exit(1);
});