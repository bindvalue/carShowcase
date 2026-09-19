import { createClient } from "@/lib/supabase/client";

export interface Marca {
  id: string;
  nome: string;
}

export async function getMarcas(): Promise<Marca[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("marcas")
    .select("id, nome")
    .eq("ativo", true)
    .order("nome");

  if (error) {
    console.error("[getMarcas]", error);
    return [];
  }
  return data ?? [];
}

export async function createMarca(nome: string): Promise<Marca> {
  const supabase = createClient();
  const nomeLimpo = nome.trim();
  if (!nomeLimpo) throw new Error("Nome é obrigatório");

  // Verifica se já existe (case-insensitive)
  const { data: existente } = await supabase
    .from("marcas")
    .select("id, nome")
    .ilike("nome", nomeLimpo)
    .maybeSingle();

  if (existente) return existente;

  const { data, error } = await supabase
    .from("marcas")
    .insert({ nome: nomeLimpo, ativo: true })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}