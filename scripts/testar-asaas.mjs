// scripts/testar-asaas.mjs
//
// Testa a conexão com a API do Asaas
//
// Uso: node --env-file=.env.scripts scripts/testar-asaas.mjs

const ASAAS_API_URL = process.env.ASAAS_API_URL || "https://api.asaas.com/v3";
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

if (!ASAAS_API_KEY) {
  console.error("❌ ASAAS_API_KEY não configurada no .env.scripts");
  process.exit(1);
}

async function testar() {
  console.log("\n🔍 Testando conexão com Asaas...\n");
  console.log(`🌐 URL: ${ASAAS_API_URL}`);
  console.log(`🔑 Key: ${ASAAS_API_KEY.slice(0, 15)}...\n`);

  try {
    // Testa listando clientes (endpoint simples)
    const response = await fetch(`${ASAAS_API_URL}/customers?limit=1`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        access_token: ASAAS_API_KEY,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Erro ${response.status}:`);
      console.error(JSON.stringify(data, null, 2));
      process.exit(1);
    }

    console.log("✅ Conexão OK!");
    console.log(`📊 Total de clientes: ${data.totalCount || 0}`);
    console.log(`📋 Primeiro cliente:`, data.data?.[0]?.name || "(nenhum)");
    console.log("");
  } catch (err) {
    console.error("❌ Erro inesperado:", err.message);
    process.exit(1);
  }
}

testar();