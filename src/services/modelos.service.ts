import { createClient } from "@/lib/supabase/client";

export interface Modelo {
  id: string;
  nome: string;
  marca_id: string;
}

export async function getModelosPorMarca(
  marcaId: string
): Promise<Modelo[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("modelos")
    .select("id, nome, marca_id")
    .eq("marca_id", marcaId)
    .eq("ativo", true)
    .order("nome");

  if (error) {
    console.error("[getModelosPorMarca]", error);
    return [];
  }
  return data ?? [];
}

export async function createModelo(
  nome: string,
  marcaId: string
): Promise<Modelo> {
  const supabase = createClient();
  const nomeLimpo = nome.trim();
  if (!nomeLimpo) throw new Error("Nome é obrigatório");
  if (!marcaId) throw new Error("Marca é obrigatória");

  const { data: existente } = await supabase
    .from("modelos")
    .select("id, nome, marca_id")
    .eq("marca_id", marcaId)
    .ilike("nome", nomeLimpo)
    .maybeSingle();

  if (existente) return existente;

  const { data, error } = await supabase
    .from("modelos")
    .insert({ nome: nomeLimpo, marca_id: marcaId, ativo: true })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}