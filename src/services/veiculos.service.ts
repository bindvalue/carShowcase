import { createClient } from "@/lib/supabase/client";
import type {
  Veiculo,
  VeiculoRaw,
  VeiculoFiltros,
} from "@/types/veiculo";

/**
 * Normaliza um registro vindo do Supabase
 * - Converte preco de string para number
 * - Garante que imagens e opcionais sejam arrays
 */
function normalizeVeiculo(raw: VeiculoRaw): Veiculo {
  return {
    ...raw,
    preco:
      typeof raw.preco === "string" ? parseFloat(raw.preco) : raw.preco,
    imagens: Array.isArray(raw.imagens) ? raw.imagens : [],
    opcionais: Array.isArray(raw.opcionais) ? raw.opcionais : [],
  };
}

/**
 * Busca veículos com filtros opcionais
 */
export async function getVeiculos(
  filtros: VeiculoFiltros = {}
): Promise<Veiculo[]> {
  const supabase = createClient();

let query = supabase
  .from("veiculos")
  .select("*")
  .eq("ativo", true)
  .eq("status", "disponivel");

if (filtros.tipo) {
  query = query.eq("tipo", filtros.tipo);
}

if (filtros.estado) {
  query = query.eq("estado", filtros.estado);
}

if (filtros.cidade) {
  query = query.ilike("cidade", `%${filtros.cidade}%`);
}

if (filtros.marcas && filtros.marcas.length > 0) {
  query = query.in("marca", filtros.marcas);
}

if (filtros.modelos && filtros.modelos.length > 0) {
  query = query.in("modelo", filtros.modelos);
}

if (filtros.anoMin != null) {
  query = query.gte("ano", filtros.anoMin);
}

if (filtros.anoMax != null) {
  query = query.lte("ano", filtros.anoMax);
}

if (filtros.precoMin != null) {
  query = query.gte("preco", filtros.precoMin);
}

if (filtros.precoMax != null) {
  query = query.lte("preco", filtros.precoMax);
}

if (filtros.kmMin != null) {
  query = query.gte("km", filtros.kmMin);
}

if (filtros.kmMax != null) {
  query = query.lte("km", filtros.kmMax);
}

if (filtros.cambio && filtros.cambio.length > 0) {
  query = query.in("cambio", filtros.cambio);
}

if (filtros.combustivel && filtros.combustivel.length > 0) {
  query = query.in("combustivel", filtros.combustivel);
}

if (filtros.cor && filtros.cor.length > 0) {
  query = query.in("cor", filtros.cor);
}

if (filtros.search) {
  const s = filtros.search.trim();
  query = query.or(
    `marca.ilike.%${s}%,modelo.ilike.%${s}%,descricao.ilike.%${s}%`
  );
}

  switch (filtros.ordenacao) {
    case "preco-asc":
      query = query.order("preco", { ascending: true });
      break;
    case "preco-desc":
      query = query.order("preco", { ascending: false });
      break;
    case "ano-asc":
      query = query.order("ano", { ascending: true });
      break;
    case "ano-desc":
      query = query.order("ano", { ascending: false });
      break;
    case "km-asc":
      query = query.order("km", { ascending: true, nullsFirst: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  if (filtros.limit) {
    query = query.limit(filtros.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[getVeiculos] Erro:", error);
    throw new Error(error.message);
  }

  return (data as VeiculoRaw[]).map(normalizeVeiculo);
}

/**
 * Busca veículos em destaque (mais recentes)
 */
export async function getVeiculosDestaque(limit = 6): Promise<Veiculo[]> {
  return getVeiculos({ limit, ordenacao: "recentes" });
}

/**
 * Busca um veículo pelo ID
 */
export async function getVeiculoById(id: string): Promise<Veiculo | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("veiculos")
    .select("*")
    .eq("id", id)
    .eq("ativo", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("[getVeiculoById] Erro:", error);
    throw new Error(error.message);
  }

  return data ? normalizeVeiculo(data as VeiculoRaw) : null;
}

/**
 * Busca um veículo pelo slug
 */
export async function getVeiculoBySlug(
  slug: string
): Promise<Veiculo | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("veiculos")
    .select("*")
    .eq("slug", slug)
    .eq("ativo", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("[getVeiculoBySlug] Erro:", error);
    return null;
  }

  return data ? normalizeVeiculo(data as VeiculoRaw) : null;
}

/**
 * Busca marcas únicas de veículos ativos (para filtros)
 */
export async function getMarcasDisponiveis(): Promise<string[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("veiculos")
    .select("marca")
    .eq("ativo", true);

  if (error) {
    console.error("[getMarcasDisponiveis] Erro:", error);
    return [];
  }

  const marcas = (data as Array<{ marca: string }>).map((v) => v.marca);
  return Array.from(new Set(marcas)).sort();
}

/**
 * Busca modelos únicos, opcionalmente filtrados por marca
 */
export async function getModelosDisponiveis(
  marcas?: string[]
): Promise<string[]> {
  const supabase = createClient();

  let query = supabase.from("veiculos").select("modelo").eq("ativo", true);

  if (marcas && marcas.length > 0) {
    query = query.in("marca", marcas);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[getModelosDisponiveis] Erro:", error);
    return [];
  }

  const modelos = (data as Array<{ modelo: string }>).map((v) => v.modelo);
  return Array.from(new Set(modelos)).sort();
}

/**
 * Busca cores únicas de veículos ativos
 */
export async function getCoresDisponiveis(): Promise<string[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("veiculos")
    .select("cor")
    .eq("ativo", true)
    .not("cor", "is", null);

  if (error) {
    console.error("[getCoresDisponiveis] Erro:", error);
    return [];
  }

  const cores = (data as Array<{ cor: string | null }>)
    .map((v) => v.cor)
    .filter((c): c is string => Boolean(c));

  return Array.from(new Set(cores)).sort();
}

/**
 * Conta total de veículos ativos
 */
export async function getTotalVeiculosAtivos(): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("veiculos")
    .select("*", { count: "exact", head: true })
    .eq("ativo", true);

  if (error) {
    console.error("[getTotalVeiculosAtivos] Erro:", error);
    return 0;
  }

  return count ?? 0;
}
// ═══════════════════════════════════════════════════════
// LOCALIZAÇÃO (Estados e Cidades)
// ═══════════════════════════════════════════════════════

/**
 * Busca estados únicos de veículos ativos
 */
export async function getEstadosDisponiveis(): Promise<string[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("veiculos")
    .select("estado")
    .eq("ativo", true)
    .eq("status", "disponivel")
    .not("estado", "is", null);

  if (error) {
    console.error("[getEstadosDisponiveis] Erro:", error);
    return [];
  }

  return Array.from(
    new Set(
      (data as Array<{ estado: string | null }>)
        .map((v) => v.estado)
        .filter((e): e is string => Boolean(e && e.trim()))
    )
  ).sort();
}

/**
 * Busca cidades únicas de veículos ativos (opcionalmente filtradas por estado)
 */
export async function getCidadesDisponiveis(
  estado?: string
): Promise<string[]> {
  const supabase = createClient();

  let query = supabase
    .from("veiculos")
    .select("cidade")
    .eq("ativo", true)
    .eq("status", "disponivel")
    .not("cidade", "is", null);

  if (estado) {
    query = query.eq("estado", estado);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[getCidadesDisponiveis] Erro:", error);
    return [];
  }

  return Array.from(
    new Set(
      (data as Array<{ cidade: string | null }>)
        .map((v) => v.cidade)
        .filter((c): c is string => Boolean(c && c.trim()))
    )
  ).sort();
}