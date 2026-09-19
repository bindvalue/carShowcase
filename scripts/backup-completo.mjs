// scripts/backup-completo.mjs
//
// Gera backup completo do Supabase: tabelas (JSON + CSV) + imagens do Storage.
//
// Uso:
//   node --env-file=.env.scripts scripts/backup-completo.mjs              (só banco)
//   node --env-file=.env.scripts scripts/backup-completo.mjs --com-imagens (banco + storage)

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

// archiver é CommonJS — precisa de require para funcionar em .mjs
const require = createRequire(import.meta.url);
const archiver = require("archiver");

// ═══════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════

const COM_IMAGENS = process.argv.includes("--com-imagens");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("\n❌ Variáveis de ambiente faltando.");
  console.error("   Crie um arquivo .env.scripts com:");
  console.error("   NEXT_PUBLIC_SUPABASE_URL=...");
  console.error("   SUPABASE_SERVICE_ROLE_KEY=...\n");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// Tabelas para exportar
const TABELAS = [
  "veiculos",
  "marcas",
  "modelos",
  "cores",
  "profiles",
  "user_roles",
  "site_settings",
  "subscribers",
];
// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-").split("T")[0];
}

function converterParaCSV(dados) {
  if (!dados || dados.length === 0) return "";

  const colunas = Object.keys(dados[0]);
  const header = colunas.join(",");

  const linhas = dados.map((row) =>
    colunas
      .map((col) => {
        const valor = row[col];

        if (valor === null || valor === undefined) return "";

        // Arrays e objetos viram JSON stringificado
        if (typeof valor === "object") {
          return `"${JSON.stringify(valor).replace(/"/g, '""')}"`;
        }

        // Strings com vírgula ou aspas precisam de escape
        const str = String(valor);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }

        return str;
      })
      .join(",")
  );

  return [header, ...linhas].join("\n");
}

function formatarMB(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
}

function criarDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ═══════════════════════════════════════════════════════════
// BACKUP DO BANCO
// ═══════════════════════════════════════════════════════════

async function backupBanco(dirBase) {
  console.log("\n📦 Exportando tabelas do banco...\n");

  const dirBanco = path.join(dirBase, "banco");
  criarDir(dirBanco);

  const resumo = {};

  for (const tabela of TABELAS) {
    console.log(`   → ${tabela}...`);

    try {
      const { data, error, count } = await supabase
        .from(tabela)
        .select("*", { count: "exact" });

      if (error) {
        console.log(`      ⚠️  Erro: ${error.message}`);
        resumo[tabela] = { erro: error.message };
        continue;
      }

      if (!data || data.length === 0) {
        console.log(`      ℹ️  Vazia (0 registros)`);
        resumo[tabela] = { registros: 0 };
        continue;
      }

      // JSON
      fs.writeFileSync(
        path.join(dirBanco, `${tabela}.json`),
        JSON.stringify(data, null, 2),
        "utf-8"
      );

      // CSV
      fs.writeFileSync(
        path.join(dirBanco, `${tabela}.csv`),
        converterParaCSV(data),
        "utf-8"
      );

      console.log(`      ✅ ${data.length} registros`);
      resumo[tabela] = { registros: data.length };
    } catch (err) {
      console.log(`      ❌ ${err.message}`);
      resumo[tabela] = { erro: err.message };
    }
  }

  return resumo;
}

// ═══════════════════════════════════════════════════════════
// BACKUP DO STORAGE
// ═══════════════════════════════════════════════════════════

async function listarArquivosStorage() {
  console.log("\n📂 Listando arquivos do bucket 'veiculos'...\n");

  const todosArquivos = [];

  // Lista as pastas (uma por veículo)
  const { data: pastas, error } = await supabase.storage
    .from("veiculos")
    .list("", { limit: 1000 });

  if (error) {
    console.error("❌ Erro ao listar pastas:", error.message);
    return [];
  }

  if (!pastas || pastas.length === 0) {
    console.log("   ℹ️  Nenhuma pasta encontrada.");
    return [];
  }

  console.log(`   → Encontradas ${pastas.length} pastas`);

  for (const pasta of pastas) {
    const { data: arquivos } = await supabase.storage
      .from("veiculos")
      .list(pasta.name, { limit: 1000 });

    if (!arquivos) continue;

    for (const arquivo of arquivos) {
      const filePath = `${pasta.name}/${arquivo.name}`;

      const { data: urlData } = supabase.storage
        .from("veiculos")
        .getPublicUrl(filePath);

      todosArquivos.push({
        path: filePath,
        nome: arquivo.name,
        pasta: pasta.name,
        tamanho: arquivo.metadata?.size ?? 0,
        mimetype: arquivo.metadata?.mimetype ?? null,
        url_publica: urlData.publicUrl,
      });
    }
  }

  console.log(`   ✅ Total: ${todosArquivos.length} arquivos\n`);
  return todosArquivos;
}

async function baixarImagens(arquivos, dirBase) {
  const dirImagens = path.join(dirBase, "storage");
  criarDir(dirImagens);

  const tamanhoTotal = arquivos.reduce((acc, a) => acc + a.tamanho, 0);
  console.log(
    `📥 Baixando ${arquivos.length} imagens (${formatarMB(tamanhoTotal)})...\n`
  );

  let baixadas = 0;
  let erros = 0;

  for (let i = 0; i < arquivos.length; i++) {
    const arq = arquivos[i];
    const progresso = `[${i + 1}/${arquivos.length}]`;

    try {
      const { data, error } = await supabase.storage
        .from("veiculos")
        .download(arq.path);

      if (error || !data) {
        console.log(`${progresso} ❌ ${arq.nome}: ${error?.message}`);
        erros++;
        continue;
      }

      // Cria a subpasta (mesma estrutura do storage)
      const dirArquivo = path.join(dirImagens, arq.pasta);
      criarDir(dirArquivo);

      // Salva o arquivo
      const buffer = Buffer.from(await data.arrayBuffer());
      fs.writeFileSync(path.join(dirImagens, arq.path), buffer);

      baixadas++;

      if (i % 20 === 0 || i === arquivos.length - 1) {
        console.log(
          `${progresso} ✅ ${baixadas} baixadas até agora...`
        );
      }
    } catch (err) {
      console.log(`${progresso} ❌ ${arq.nome}: ${err.message}`);
      erros++;
    }
  }

  console.log(`\n   ✅ ${baixadas} baixadas · ❌ ${erros} erros\n`);
  return { baixadas, erros, tamanho: tamanhoTotal };
}

async function compactarImagens(dirBase) {
  const dirImagens = path.join(dirBase, "storage");
  const zipPath = path.join(dirBase, "storage.zip");

  if (!fs.existsSync(dirImagens)) return null;

  console.log("🗜️  Compactando imagens em ZIP...\n");

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      const tamanho = fs.statSync(zipPath).size;
      console.log(`   ✅ ZIP criado: ${formatarMB(tamanho)}\n`);
      resolve(zipPath);
    });

    archive.on("error", reject);
    archive.pipe(output);
    archive.directory(dirImagens, false);
    archive.finalize();
  });
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function main() {
  const inicio = Date.now();

  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║  BACKUP COMPLETO — SUPABASE                          ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  console.log(`📅 Data: ${new Date().toLocaleString("pt-BR")}`);
  console.log(
    `📋 Modo: ${COM_IMAGENS ? "Banco + Imagens" : "Somente Banco"}\n`
  );

  if (!COM_IMAGENS) {
    console.log("💡 Dica: use --com-imagens para incluir as imagens do Storage");
    console.log("   (pode ser lento e ocupar vários MB)\n");
  }

  // Cria diretório do backup
  const dataHoje = timestamp();
  const dirBase = path.join("backups", dataHoje);
  criarDir(dirBase);

  console.log(`📁 Diretório: ${dirBase}\n`);

  // ─── 1. Backup do banco ───
  const resumoBanco = await backupBanco(dirBase);

  // ─── 2. Backup do Storage (opcional) ───
  let resumoStorage = null;

  if (COM_IMAGENS) {
    const arquivos = await listarArquivosStorage();

    if (arquivos.length > 0) {
      // Salva a lista de arquivos (JSON)
      fs.writeFileSync(
        path.join(dirBase, "storage-lista.json"),
        JSON.stringify(arquivos, null, 2),
        "utf-8"
      );

      // Baixa as imagens
      const resultado = await baixarImagens(arquivos, dirBase);

      // Compacta em ZIP
      await compactarImagens(dirBase);

      // Remove a pasta de imagens soltas (mantém só o ZIP)
      fs.rmSync(path.join(dirBase, "storage"), {
        recursive: true,
        force: true,
      });

      resumoStorage = {
        arquivos: arquivos.length,
        baixadas: resultado.baixadas,
        erros: resultado.erros,
        tamanho: resultado.tamanho,
      };
    }
  }

  // ─── 3. Gera relatório ───
  const relatorio = {
    data_backup: new Date().toISOString(),
    versao: "1.0",
    incluiu_imagens: COM_IMAGENS,
    banco: resumoBanco,
    storage: resumoStorage,
  };

  fs.writeFileSync(
    path.join(dirBase, "RELATORIO.json"),
    JSON.stringify(relatorio, null, 2),
    "utf-8"
  );

  // ─── 4. Relatório final no console ───
  const duracao = ((Date.now() - inicio) / 1000).toFixed(1);

  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║  ✅ BACKUP CONCLUÍDO                                 ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  console.log(`📁 Local: backups/${dataHoje}/`);
  console.log(`⏱️  Duração: ${duracao}s\n`);

  console.log("📊 RESUMO DO BANCO:");
  for (const [tabela, info] of Object.entries(resumoBanco)) {
    if (info.erro) {
      console.log(`   ❌ ${tabela}: ${info.erro}`);
    } else {
      console.log(`   ✅ ${tabela}: ${info.registros} registros`);
    }
  }

  if (resumoStorage) {
    console.log("\n📊 RESUMO DO STORAGE:");
    console.log(`   ✅ ${resumoStorage.baixadas} imagens baixadas`);
    console.log(
      `   📦 Tamanho: ${formatarMB(resumoStorage.tamanho)}`
    );
    if (resumoStorage.erros > 0) {
      console.log(`   ⚠️  ${resumoStorage.erros} erros`);
    }
  }

  console.log("\n💾 Arquivos gerados:");
  console.log(`   backups/${dataHoje}/banco/*.json`);
  console.log(`   backups/${dataHoje}/banco/*.csv`);
  if (resumoStorage) {
    console.log(`   backups/${dataHoje}/storage-lista.json`);
    console.log(`   backups/${dataHoje}/storage.zip`);
  }
  console.log(`   backups/${dataHoje}/RELATORIO.json\n`);

  console.log("──────────────────────────────────────────────────────");
  console.log("🎉 Backup pronto! Guarde em local seguro (Drive, HD).");
  console.log("──────────────────────────────────────────────────────\n");
}

main().catch((err) => {
  console.error("\n❌ Erro inesperado:", err);
  process.exit(1);
});