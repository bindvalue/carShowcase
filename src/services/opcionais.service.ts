import { createClient } from "@/lib/supabase/client";

export interface Opcional {
  id: string;
  nome: string;
  categoria: string;
  ativo: boolean;
}

// ==========================================
// HELPERS
// ==========================================

/**
 * Normaliza uma linha vinda do banco para o tipo local `Opcional`.
 * O banco permite `null` em `categoria` e `ativo`, mas o app sempre
 * grava valores não-nulos — então garantimos o tipo forte aqui.
 */
function normalizarOpcional(row: {
  id: string;
  nome: string;
  categoria: string | null;
  ativo: boolean | null;
}): Opcional {
  return {
    id: row.id,
    nome: row.nome,
    categoria: row.categoria ?? "Geral",
    ativo: row.ativo ?? true,
  };
}

// ==========================================
// QUERIES
// ==========================================

export async function getOpcionais(): Promise<Opcional[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("opcionais")
    .select("id, nome, categoria, ativo")
    .eq("ativo", true)
    .order("categoria")
    .order("nome");

  if (error) {
    console.error("[getOpcionais] Erro:", error);
    return [];
  }

  return (data ?? []).map(normalizarOpcional);
}

// ==========================================
// MUTATIONS
// ==========================================

export async function createOpcional(
  nome: string,
  categoria: string = "Geral"
): Promise<Opcional> {
  const supabase = createClient();

  const nomeLimpo = nome.trim();
  if (!nomeLimpo) throw new Error("Nome é obrigatório");

  // Verifica se já existe (case-insensitive)
  const { data: existente } = await supabase
    .from("opcionais")
    .select("id, nome, categoria, ativo")
    .ilike("nome", nomeLimpo)
    .maybeSingle();

  if (existente) {
    // Se existia mas estava inativo, reativa
    if (!existente.ativo) {
      const { data, error } = await supabase
        .from("opcionais")
        .update({ ativo: true, updated_at: new Date().toISOString() })
        .eq("id", existente.id)
        .select("id, nome, categoria, ativo")
        .single();

      if (error) throw new Error(error.message);
      return normalizarOpcional(data);
    }
    return normalizarOpcional(existente);
  }

  // Cria novo
  const { data, error } = await supabase
    .from("opcionais")
    .insert({ nome: nomeLimpo, categoria })
    .select("id, nome, categoria, ativo")
    .single();

  if (error) {
    console.error("[createOpcional] Erro:", error);
    throw new Error(error.message);
  }

  return normalizarOpcional(data);
}

export async function deleteOpcional(id: string): Promise<void> {
  const supabase = createClient();

  // Soft delete
  const { error } = await supabase
    .from("opcionais")
    .update({ ativo: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[deleteOpcional] Erro:", error);
    throw new Error(error.message);
  }
}