import { createClient } from "@/lib/supabase/client";
import type { Veiculo, VeiculoRaw } from "@/types/veiculo";

// ==========================================
// LISTAGEM PAGINADA COM FILTROS
// ==========================================

export interface AdminVeiculosFiltros {
  search?: string;
  statusVeiculo?:
    | "em_estoque"
    | "despublicados"
    | "vendidos"
    | "removidos"
    | "todos";
  marca?: string;
  ordenacao?: "recentes" | "antigos" | "preco-asc" | "preco-desc";
  page?: number;
  perPage?: number;
}

export interface AdminVeiculosResult {
  veiculos: Veiculo[];
  total: number;
  totalPages: number;
  page: number;
  perPage: number;
}

function normalizeVeiculo(raw: VeiculoRaw): Veiculo {
  return {
    ...raw,
    preco:
      typeof raw.preco === "string" ? parseFloat(raw.preco) : raw.preco,
    imagens: Array.isArray(raw.imagens) ? raw.imagens : [],
    opcionais: Array.isArray(raw.opcionais) ? raw.opcionais : [],
  };
}

export async function getAdminVeiculos(
  filtros: AdminVeiculosFiltros = {}
): Promise<AdminVeiculosResult> {
  const supabase = createClient();

  const page = filtros.page ?? 1;
  const perPage = filtros.perPage ?? 20;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase.from("veiculos").select("*", { count: "exact" });

  if (filtros.marca && filtros.marca !== "todas") {
    query = query.eq("marca", filtros.marca);
  }

  // ─── Filtro por status do veículo (unificado) ───
  switch (filtros.statusVeiculo) {
    case "em_estoque":
      query = query.eq("status", "disponivel").eq("ativo", true);
      break;
    case "despublicados":
      query = query.eq("status", "disponivel").eq("ativo", false);
      break;
    case "vendidos":
      query = query.eq("status", "vendido");
      break;
    case "removidos":
      query = query.eq("status", "removido");
      break;
    case "todos":
    default:
      break;
  }

  if (filtros.search) {
    const s = filtros.search.trim();
    query = query.or(
      `marca.ilike.%${s}%,modelo.ilike.%${s}%,descricao.ilike.%${s}%`
    );
  }

  switch (filtros.ordenacao) {
    case "antigos":
      query = query.order("created_at", { ascending: true });
      break;
    case "preco-asc":
      query = query.order("preco", { ascending: true });
      break;
    case "preco-desc":
      query = query.order("preco", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("[getAdminVeiculos] Erro:", error);
    throw new Error(error.message);
  }

  const total = count ?? 0;

  return {
    veiculos: (data as VeiculoRaw[]).map(normalizeVeiculo),
    total,
    totalPages: Math.ceil(total / perPage),
    page,
    perPage,
  };
}

// ==========================================
// CONTADORES PARA O HEADER
// ==========================================

export async function getAdminVeiculosCounts(): Promise<{
  emEstoque: number;
  despublicados: number;
  vendidos: number;
  removidos: number;
  total: number;
}> {
  const supabase = createClient();

  const [emEstoque, despublicados, vendidos, removidos, total] =
    await Promise.all([
      supabase
        .from("veiculos")
        .select("*", { count: "exact", head: true })
        .eq("status", "disponivel")
        .eq("ativo", true),
      supabase
        .from("veiculos")
        .select("*", { count: "exact", head: true })
        .eq("status", "disponivel")
        .eq("ativo", false),
      supabase
        .from("veiculos")
        .select("*", { count: "exact", head: true })
        .eq("status", "vendido"),
      supabase
        .from("veiculos")
        .select("*", { count: "exact", head: true })
        .eq("status", "removido"),
      supabase.from("veiculos").select("*", { count: "exact", head: true }),
    ]);

  return {
    emEstoque: emEstoque.count ?? 0,
    despublicados: despublicados.count ?? 0,
    vendidos: vendidos.count ?? 0,
    removidos: removidos.count ?? 0,
    total: total.count ?? 0,
  };
}

export async function getMarcasParaFiltro(): Promise<string[]> {
  const supabase = createClient();

  // Prioriza a tabela oficial de marcas
  const { data, error } = await supabase
    .from("marcas")
    .select("nome")
    .eq("ativo", true)
    .order("nome");

  if (!error && data && data.length > 0) {
    return (data as Array<{ nome: string }>).map((m) => m.nome);
  }

  // Fallback: extrai marcas únicas dos veículos disponíveis
  const { data: veiculos } = await supabase
    .from("veiculos")
    .select("marca")
    .eq("status", "disponivel")
    .eq("ativo", true);

  const marcasFallback = (veiculos as Array<{ marca: string }> | null) ?? [];
  return Array.from(new Set(marcasFallback.map((v) => v.marca))).sort();
}

/**
 * Deleta um veículo PERMANENTEMENTE.
 * Também apaga todas as imagens dele do Storage.
 */
export async function deleteVeiculo(id: string): Promise<void> {
  const supabase = createClient();

  // Apaga todas as imagens da pasta
  const { data: files } = await supabase.storage.from("veiculos").list(id);

  if (files && files.length > 0) {
    const paths = files.filter((f) => f.name).map((f) => `${id}/${f.name}`);

    for (let i = 0; i < paths.length; i += 100) {
      const lote = paths.slice(i, i + 100);
      await supabase.storage.from("veiculos").remove(lote);
    }
  }

  // Deleta o veículo do banco
  const { error } = await supabase.from("veiculos").delete().eq("id", id);

  if (error) {
    console.error("[deleteVeiculo] Erro:", error);
    throw new Error(error.message);
  }
}

/**
 * Arquiva um veículo (vendido ou removido).
 * Apaga imagens do Storage + marca o status.
 */
export async function arquivarVeiculo(
  id: string,
  status: "vendido" | "removido"
): Promise<{ imagensRemovidas: number }> {
  const supabase = createClient();

  const { data: files } = await supabase.storage.from("veiculos").list(id);

  const paths = (files ?? [])
    .filter((f) => f.name)
    .map((f) => `${id}/${f.name}`);

  let imagensRemovidas = 0;
  if (paths.length > 0) {
    for (let i = 0; i < paths.length; i += 100) {
      const lote = paths.slice(i, i + 100);
      const { error: errDel } = await supabase.storage
        .from("veiculos")
        .remove(lote);

      if (!errDel) imagensRemovidas += lote.length;
    }
  }

  const { error: errUpd } = await supabase
    .from("veiculos")
    .update({
      status,
      ativo: false,
      imagem_capa: null,
      imagens: [],
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (errUpd) {
    console.error("[arquivarVeiculo] Erro:", errUpd);
    throw new Error(errUpd.message);
  }

  return { imagensRemovidas };
}

/**
 * Restaura um veículo arquivado para "disponivel".
 * Não recupera as imagens (foram apagadas).
 */
export async function restaurarVeiculo(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("veiculos")
    .update({
      status: "disponivel",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("[restaurarVeiculo] Erro:", error);
    throw new Error(error.message);
  }
}

export async function getVeiculoByIdAdmin(
  id: string
): Promise<Veiculo | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("veiculos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("[getVeiculoByIdAdmin] Erro:", error);
    return null;
  }

  return data ? normalizeVeiculo(data as VeiculoRaw) : null;
}

// ==========================================
// TIPOS BASE PARA INPUT
// ==========================================

/**
 * Campos editáveis compartilhados entre CREATE e UPDATE.
 */
interface VeiculoBaseInput {
  marca: string;
  modelo: string;
  ano: number;
  preco: number;
  km: number | null;
  tipo: "carro" | "moto";
  cor: string | null;
  combustivel: string | null;
  cambio: string | null;
  descricao: string | null;
  cidade: string | null;
  estado: string | null;
  opcionais: string[] | null;
  whatsapp_link: string | null;
  ativo: boolean;
  imagem_capa: string | null;
  placa: string | null;
  motor: string | null;
}

/** Input para UPDATE (parcial) */
export type VeiculoUpdateInput = Partial<
  VeiculoBaseInput & { imagens: string[] | null }
>;

/** Input para CREATE (obrigatório + imagens como array) */
export interface VeiculoCreateInput extends VeiculoBaseInput {
  imagens: string[];
}

// ==========================================
// UPDATE
// ==========================================

export async function updateVeiculo(
  id: string,
  dados: VeiculoUpdateInput
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("veiculos")
    .update({
      ...dados,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("[updateVeiculo] Erro:", error);
    throw new Error(error.message);
  }
}

// ==========================================
// UPLOAD
// ==========================================

export async function uploadVeiculoImagem(
  veiculoId: string,
  file: File
): Promise<string> {
  const supabase = createClient();

  const ext = file.name.split(".").pop() ?? "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
  const path = `${veiculoId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("veiculos")
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (uploadError) {
    console.error("[uploadVeiculoImagem] Erro upload:", uploadError);
    throw new Error(uploadError.message);
  }

  const { data: urlData } = supabase.storage
    .from("veiculos")
    .getPublicUrl(path);

  return urlData.publicUrl;
}

export async function deleteVeiculoImagem(imageUrl: string): Promise<void> {
  const supabase = createClient();

  const match = imageUrl.match(/\/veiculos\/(.+)$/);
  if (!match) return;

  const path = match[1];

  const { error } = await supabase.storage.from("veiculos").remove([path]);

  if (error) {
    console.error("[deleteVeiculoImagem] Erro:", error);
  }
}

export async function uploadMultiplasImagens(
  veiculoId: string,
  files: File[]
): Promise<string[]> {
  const urls: string[] = [];

  for (const file of files) {
    try {
      const url = await uploadVeiculoImagem(veiculoId, file);
      urls.push(url);
    } catch (err) {
      console.error("[uploadMultiplasImagens] Erro em uma imagem:", err);
    }
  }

  return urls;
}

// ==========================================
// CRIAÇÃO
// ==========================================

export async function createVeiculo(
  dados: VeiculoCreateInput
): Promise<Veiculo> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("veiculos")
    .insert({
      marca: dados.marca,
      modelo: dados.modelo,
      ano: dados.ano,
      preco: dados.preco,
      km: dados.km,
      tipo: dados.tipo,
      cor: dados.cor,
      combustivel: dados.combustivel,
      cambio: dados.cambio,
      descricao: dados.descricao,
      cidade: dados.cidade,
      estado: dados.estado,
      opcionais: dados.opcionais ?? [],
      whatsapp_link: dados.whatsapp_link,
      ativo: dados.ativo,
      imagem_capa: dados.imagem_capa,
      imagens: dados.imagens ?? [],
      placa: dados.placa,
      motor: dados.motor,
      status: "disponivel",
    })
    .select()
    .single();

  if (error) {
    console.error("[createVeiculo] Erro:", error);
    throw new Error(error.message);
  }

  return normalizeVeiculo(data as VeiculoRaw);
}
// ==========================================
// TOGGLE ATIVO
// ==========================================

/**
 * Liga/desliga a publicação de um veículo.
 * Usado pelo botão de toggle na tabela de veículos.
 */
export async function toggleVeiculoAtivo(
  id: string,
  ativo: boolean
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("veiculos")
    .update({
      ativo,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("[toggleVeiculoAtivo] Erro:", error);
    throw new Error(error.message);
  }
}