// src/lib/formatters.ts

export function formatBRL(value: number | null | undefined): string {
  if (value == null) return "Sob consulta";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatKM(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("pt-BR").format(value) + " km";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Gera o slug único de um veículo.
 * Formato: marca-modelo-XXXXXX (onde X é o início do ID)
 * Exemplo: honda-civic-exl-2-0-a1b2c3
 */
export function getVeiculoSlug(veiculo: {
  id: string;
  marca: string;
  modelo: string;
}): string {
  return `${slugify(veiculo.marca)}-${slugify(veiculo.modelo)}-${veiculo.id.slice(0, 6)}`;
}

/**
 * Extrai o ID do veículo a partir do slug.
 * O ID é sempre a última parte após o último hífen.
 */
export function getIdFromSlug(slug: string): string | null {
  const parts = slug.split("-");
  const id = parts[parts.length - 1];
  return id || null;
}

/**
 * Capitaliza a primeira letra de cada palavra
 * Ex: "flex" → "Flex", "automatico" → "Automatico"
 */
export function capitalize(text: string | null | undefined): string {
  if (!text) return "—";
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Normaliza o campo opcionais que vem como 1 string gigante
 * Ex: ["Abs Air Bags 2 Alarme Ar Condicionado..."]
 *     → ["Abs", "Air Bags", "Alarme", "Ar Condicionado", ...]
 */
export function parseOpcionais(opcionais: string[] | null): string[] {
  if (!opcionais || opcionais.length === 0) return [];

  // Se já vem como array de vários itens, só retorna
  if (opcionais.length > 1) {
    return opcionais.map((o) => o.trim()).filter(Boolean);
  }

  // Se vem como 1 string gigante, tenta dividir
  const raw = opcionais[0];

  // Lista de opcionais conhecidos (separadores)
  // Estratégia: dividir por padrões conhecidos + vírgulas
  const separators = [
    "Abs",
    "Air Bags",
    "Airbag",
    "Alarme",
    "Ar Condicionado",
    "Ar Quente",
    "Banco",
    "Bancos",
    "Câmbio",
    "Cambio",
    "Cd / Mp3",
    "Computador",
    "Câmera",
    "Camera",
    "Desembaçador",
    "Direção",
    "Direcao",
    "Freio",
    "Limpador",
    "Multimídia",
    "Multimidia",
    "Mp3",
    "Piloto",
    "Retrovisores",
    "Rodas",
    "Sensor",
    "Teto",
    "Travas",
    "Usb",
    "Vidros",
    "Volante",
  ];

  // Constrói regex dinamicamente
  const regex = new RegExp(`(?=${separators.join("|")})`, "g");

  return raw
    .split(regex)
    .map((s) => s.trim().replace(/,$/, "").trim())
    .filter((s) => s.length > 1);
}

/**
 * Mascara a placa mostrando apenas os últimos 3 caracteres.
 * Remove hífens, espaços e converte para maiúsculo.
 *
 * Exemplos:
 *   "ABC-1234" → "***1234" → mostra "•••1234"
 *   "ABC1234"  → "•••1234"
 *   "XYZ-9A87" → "•••9A87"
 */
export function maskPlaca(placa: string | null | undefined): string {
  if (!placa) return "";

  // Remove hífens, espaços e caracteres especiais
  const limpa = placa.toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (limpa.length < 3) return limpa;

  const ultimos3 = limpa.slice(-3);
  return `•••${ultimos3}`;
}

/**
 * Retorna APENAS os últimos 3 caracteres da placa (sem máscara).
 * Útil para exibir como tag discreta.
 */
export function getPlacaFinal(placa: string | null | undefined): string | null {
  if (!placa) return null;

  const limpa = placa.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (limpa.length < 3) return null;

  return limpa.slice(-3);
}