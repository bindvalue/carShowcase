import { createClient } from "@/lib/supabase/client";

export interface Marca {
  id: string;
  nome: string;
}

export interface Modelo {
  id: string;
  nome: string;
  marca_id: string | null;
}

export interface Cor {
  id: string;
  nome: string;
  hex: string | null;
}

// ==========================================
// MARCAS
// ==========================================

export async function getMarcas(): Promise<Marca[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("marcas")
    .select("id, nome")
    .eq("ativo", true)
    .order("nome");

  if (error) {
    console.error("[getMarcas] Erro:", error);
    return [];
  }

  return data ?? [];
}

// ==========================================
// MODELOS (filtrados por marca)
// ==========================================

export async function getModelos(marcaId?: string): Promise<Modelo[]> {
  const supabase = createClient();

  let query = supabase
    .from("modelos")
    .select("id, nome, marca_id")
    .eq("ativo", true)
    .order("nome");

  if (marcaId) {
    query = query.eq("marca_id", marcaId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[getModelos] Erro:", error);
    return [];
  }

  return data ?? [];
}

// ==========================================
// CORES
// ==========================================

export async function getCores(): Promise<Cor[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("cores")
    .select("id, nome, hex")
    .eq("ativo", true)
    .order("nome");

  if (error) {
    console.error("[getCores] Erro:", error);
    return [];
  }

  return data ?? [];
}