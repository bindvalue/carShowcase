// scripts/testar-webhook.mjs
//
// Simula o Asaas enviando um webhook para o seu localhost
//
// Uso:
//   1. Em um terminal: npm run dev
//   2. Em outro terminal: node --env-file=.env.scripts scripts/testar-webhook.mjs

const WEBHOOK_URL = "http://localhost:3000/api/webhooks/asaas";
const WEBHOOK_TOKEN =
  process.env.ASAAS_WEBHOOK_TOKEN ||
  "d279981ea31da397c6930de9083dfec4af0bc88a2a8bde4c7878c0e43fa47a40";

// ─── Dados do usuário de teste (desenvolvimento) ───
const USER_ID = "370bd4ed-b32e-4876-a0f8-d0a807d51165";
const CUSTOMER_ID = "cus_000009153490";

// ═══════════════════════════════════════════════════════
// PAYLOADS SIMULADOS
// ═══════════════════════════════════════════════════════

const eventos = {
  PAGAMENTO_OK: {
    id: "evt_test_pagamento_ok",
    event: "PAYMENT_RECEIVED",
    payment: {
      id: "pay_test_" + Date.now(),
      customer: CUSTOMER_ID,
      subscription: "sub_b8tn717m50h3kuy1",
      value: 155.0,
      netValue: 150.0,
      status: "RECEIVED",
      dueDate: "2026-10-15",
      clientPaymentDate: new Date().toISOString().split("T")[0],
      externalReference: USER_ID,
    },
  },
};

// ═══════════════════════════════════════════════════════
// ENVIA
// ═══════════════════════════════════════════════════════

async function enviarWebhook(nome, payload) {
  console.log(`\n📤 Enviando: ${nome}`);
  console.log(`   Evento: ${payload.event}`);
  console.log(`   User: ${payload.payment.externalReference}\n`);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "asaas-access-token": WEBHOOK_TOKEN,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`   ✅ Resposta ${response.status}:`, data);
    } else {
      console.log(`   ❌ Erro ${response.status}:`, data);
    }
  } catch (err) {
    console.error(`   ❌ Falha ao enviar:`, err.message);
    console.error(`   Certifique-se de que "npm run dev" está rodando.`);
  }
}

async function main() {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║  SIMULADOR DE WEBHOOK ASAAS                      ║");
  console.log("╚══════════════════════════════════════════════════╝");

  await enviarWebhook("Pagamento Recebido (R$ 155)", eventos.PAGAMENTO_OK);

  console.log("\n📋 Verifique o terminal do npm run dev");
  console.log("📋 Verifique o banco de dados\n");
}

main();