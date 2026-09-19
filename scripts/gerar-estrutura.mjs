// scripts/gerar-estrutura.mjs
//
// Gera um arquivo com a estrutura completa de pastas e arquivos do projeto,
// ignorando node_modules, .next, .git e outros diretórios pesados.
//
// Uso:
//   node scripts/gerar-estrutura.mjs

import fs from "node:fs";
import path from "node:path";

// ─── Configuração ───
const IGNORAR = new Set([
  "node_modules",
  ".next",
  ".git",
  "dist",
  "build",
  "out",
  "coverage",
  ".turbo",
  ".vercel",
  "backups",
]);

const ARQUIVOS_IGNORAR = new Set([
  ".DS_Store",
  "Thumbs.db",
  "estrutura-projeto.txt",
  "package-lock.json",
]);

// ─── Cores (só no terminal) ───
const c = {
  reset: "\x1b[0m",
  gray: "\x1b[90m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  bold: "\x1b[1m",
};

// ─── Função recursiva ───
function gerarArvore(dir, prefixo = "", profundidade = 0) {
  const itens = fs
    .readdirSync(dir)
    .filter((item) => {
      if (IGNORAR.has(item)) return false;
      if (ARQUIVOS_IGNORAR.has(item)) return false;
      return true;
    })
    .sort((a, b) => {
      // Diretórios primeiro, depois arquivos
      const aIsDir = fs.statSync(path.join(dir, a)).isDirectory();
      const bIsDir = fs.statSync(path.join(dir, b)).isDirectory();
      if (aIsDir !== bIsDir) return aIsDir ? -1 : 1;
      return a.localeCompare(b);
    });

  let resultado = "";
  let contador = 0;

  itens.forEach((item, index) => {
    const isUltimo = index === itens.length - 1;
    const isDir = fs.statSync(path.join(dir, item)).isDirectory();
    const conector = isUltimo ? "└── " : "├── ";
    const proximoPrefixo = prefixo + (isUltimo ? "    " : "│   ");

    const icone = isDir ? "📁" : getIconeArquivo(item);
    const destaque = isDir ? c.cyan : "";

    resultado += `${prefixo}${conector}${icone} ${item}\n`;
    contador++;

    if (isDir) {
      resultado += gerarArvore(
        path.join(dir, item),
        proximoPrefixo,
        profundidade + 1
      );
    }
  });

  return resultado;
}

function getIconeArquivo(nome) {
  if (nome.endsWith(".tsx") || nome.endsWith(".ts")) return "📄";
  if (nome.endsWith(".json")) return "🔧";
  if (nome.endsWith(".md")) return "📖";
  if (nome.endsWith(".css")) return "🎨";
  if (nome.endsWith(".png") || nome.endsWith(".jpg") || nome.endsWith(".svg"))
    return "🖼️";
  if (nome.startsWith(".")) return "⚙️";
  return "📄";
}

function contarArquivos(dir) {
  let total = 0;
  let pastas = 0;

  function contar(d) {
    const itens = fs.readdirSync(d);
    itens.forEach((item) => {
      if (IGNORAR.has(item)) return;
      const fullPath = path.join(d, item);
      const isDir = fs.statSync(fullPath).isDirectory();
      if (isDir) {
        pastas++;
        contar(fullPath);
      } else {
        if (!ARQUIVOS_IGNORAR.has(item)) total++;
      }
    });
  }

  contar(dir);
  return { total, pastas };
}

// ─── Main ───
function main() {
  console.log(`\n${c.bold}📂 Gerando estrutura do projeto...${c.reset}\n`);

  const raiz = process.cwd();
  const nomeProjeto = path.basename(raiz);

  let saida = "";
  saida += `# Estrutura do Projeto: ${nomeProjeto}\n`;
  saida += `# Gerado em: ${new Date().toLocaleString("pt-BR")}\n`;
  saida += `${"─".repeat(60)}\n\n`;
  saida += `${nomeProjeto}/\n`;

  const arvore = gerarArvore(raiz);
  saida += arvore;

  const { total, pastas } = contarArquivos(raiz);
  saida += `\n${"─".repeat(60)}\n`;
  saida += `📊 Estatísticas:\n`;
  saida += `   Pastas: ${pastas}\n`;
  saida += `   Arquivos: ${total}\n`;

  // Salva em arquivo
  const outputPath = path.join(raiz, "estrutura-projeto.txt");
  fs.writeFileSync(outputPath, saida, "utf-8");

  // Imprime no terminal (com cores)
  console.log(arvore);
  console.log(`${c.gray}${"─".repeat(60)}${c.reset}`);
  console.log(`${c.bold}📊 Estatísticas:${c.reset}`);
  console.log(`   ${c.cyan}Pastas:${c.reset} ${pastas}`);
  console.log(`   ${c.cyan}Arquivos:${c.reset} ${total}`);
  console.log(`\n${c.green}✅ Salvo em:${c.reset} ${outputPath}\n`);
}

main();