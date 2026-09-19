import { createClient } from "@/lib/supabase/client";

export interface Cor {
  id: string;
  nome: string;
  hex: string | null;
}

export async function getCores(): Promise<Cor[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("cores")
    .select("id, nome, hex")
    .eq("ativo", true)
    .order("nome");

  if (error) {
    console.error("[getCores]", error);
    return [];
  }
  return data ?? [];
}

export async function createCor(nome: string, hex?: string): Promise<Cor> {
  const supabase = createClient();
  const nomeLimpo = nome.trim();
  if (!nomeLimpo) throw new Error("Nome é obrigatório");

  const { data: existente } = await supabase
    .from("cores")
    .select("id, nome, hex")
    .ilike("nome", nomeLimpo)
    .maybeSingle();

  if (existente) return existente;

  const { data, error } = await supabase
    .from("cores")
    .insert({ nome: nomeLimpo, hex: hex ?? null, ativo: true })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}