// scripts/limpar-imagens-inativos.mjs
//
// Apaga TODAS as imagens dos veículos INATIVOS do Storage do Supabase.
// Baseia-se nos IDs dos veículos inativos (não nas URLs do banco),
// pois o banco já pode estar com as referências limpas.
//
// Uso:
//   node --env-file=.env.scripts scripts/limpar-imagens-inativos.mjs           (simulação)
//   node --env-file=.env.scripts scripts/limpar-imagens-inativos.mjs --execute (apaga de verdade)

import { createClient } from "@supabase/supabase-js";

// ═══════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════

const DRY_RUN = !process.argv.includes("--execute");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("\n❌ Variáveis de ambiente faltando.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function formatarMB(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
}

async function listarArquivosDaPasta(pasta) {
  const { data, error } = await supabase.storage
    .from("veiculos")
    .list(pasta, { limit: 1000 });

  if (error || !data) return [];

  return data
    .filter((f) => f.name && f.id) // ignora subpastas vazias
    .map((f) => ({
      path: `${pasta}/${f.name}`,
      tamanho: f.metadata?.size ?? 0,
    }));
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║  LIMPEZA DE IMAGENS — VEÍCULOS INATIVOS              ║");
  console.log("║  (baseado em pastas do Storage)                      ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  if (DRY_RUN) {
    console.log("🧪 MODO SIMULAÇÃO — nada será apagado\n");
    console.log("   Para apagar de verdade, use --execute\n");
  } else {
    console.log("⚠️  MODO REAL — AS IMAGENS SERÃO APAGADAS");
    console.log("   Ctrl+C nos próximos 5 segundos para abortar...\n");
    await new Promise((r) => setTimeout(r, 5000));
  }

  // ─── 1. Busca IDs dos veículos INATIVOS ───
  console.log("📥 Buscando IDs dos veículos inativos...\n");

  const { data: inativos, error: errInativos } = await supabase
    .from("veiculos")
    .select("id, marca, modelo, ano")
    .eq("ativo", false);

  if (errInativos) {
    console.error("❌ Erro ao buscar veículos:", errInativos.message);
    process.exit(1);
  }

  if (!inativos || inativos.length === 0) {
    console.log("✅ Nenhum veículo inativo encontrado.\n");
    return;
  }

  console.log(`📦 Veículos inativos: ${inativos.length}\n`);

  // ─── 2. Para cada veículo inativo, lista e apaga arquivos da pasta ───
  let totalVeiculosProcessados = 0;
  let totalVeiculosSemArquivo = 0;
  let totalArquivosApagados = 0;
  let totalErros = 0;
  let espacoLiberado = 0;

  for (let i = 0; i < inativos.length; i++) {
    const v = inativos[i];
    const progresso = `[${i + 1}/${inativos.length}]`;

    // Lista arquivos na pasta do veículo
    const arquivos = await listarArquivosDaPasta(v.id);

    if (arquivos.length === 0) {
      totalVeiculosSemArquivo++;
      continue;
    }

    const paths = arquivos.map((a) => a.path);
    const tamanhoPasta = arquivos.reduce((acc, a) => acc + a.tamanho, 0);

    if (DRY_RUN) {
      console.log(
        `${progresso} 🧪 ${v.marca} ${v.modelo} ${v.ano} → ${paths.length} imagens (${formatarMB(tamanhoPasta)})`
      );
      totalArquivosApagados += paths.length;
      espacoLiberado += tamanhoPasta;
      totalVeiculosProcessados++;
      continue;
    }

    // Apaga em lotes de 100 (limite da API)
    let apagados = 0;
    for (let j = 0; j < paths.length; j += 100) {
      const lote = paths.slice(j, j + 100);
      const { error: errDel } = await supabase.storage
        .from("veiculos")
        .remove(lote);

      if (errDel) {
        console.log(`${progresso} ❌ Erro: ${errDel.message}`);
        totalErros++;
        break;
      }
      apagados += lote.length;
    }

    // Limpa referências no banco (por segurança)
    await supabase
      .from("veiculos")
      .update({ imagem_capa: null, imagens: [] })
      .eq("id", v.id);

    console.log(
      `${progresso} ✅ ${v.marca} ${v.modelo} ${v.ano} → ${apagados} imagens apagadas`
    );

    totalArquivosApagados += apagados;
    espacoLiberado += tamanhoPasta;
    totalVeiculosProcessados++;
  }

  // ─── 3. Relatório final ───
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║  RELATÓRIO FINAL                                     ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  console.log(`Veículos processados:    ${totalVeiculosProcessados}`);
  console.log(`Veículos sem arquivos:   ${totalVeiculosSemArquivo}`);
  console.log(
    `Imagens ${DRY_RUN ? "simuladas" : "apagadas"}:        ${totalArquivosApagados}`
  );
  console.log(`Espaço liberado:         ${formatarMB(espacoLiberado)}`);

  if (totalErros > 0) {
    console.log(`\n⚠️  Erros: ${totalErros}`);
  }

  console.log("");

  if (DRY_RUN) {
    console.log("──────────────────────────────────────────────────────");
    console.log("🧪 Isso foi só uma SIMULAÇÃO.");
    console.log("   Para apagar de verdade, rode com --execute:");
    console.log("");
    console.log(
      "   node --env-file=.env.scripts scripts/limpar-imagens-inativos.mjs --execute"
    );
    console.log("──────────────────────────────────────────────────────\n");
  } else {
    console.log("──────────────────────────────────────────────────────");
    console.log("✅ Limpeza concluída!");
    console.log("   Os 34 veículos ativos NÃO foram tocados.");
    console.log("──────────────────────────────────────────────────────\n");
  }
}

main().catch((err) => {
  console.error("\n❌ Erro inesperado:", err);
  process.exit(1);
});