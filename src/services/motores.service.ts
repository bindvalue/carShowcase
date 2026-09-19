import { createClient } from "@/lib/supabase/client";

export interface Motor {
  id: string;
  nome: string;
}

export async function getMotores(): Promise<Motor[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("motores")
    .select("id, nome")
    .eq("ativo", true)
    .order("nome");

  if (error) {
    console.error("[getMotores] Erro:", error);
    return [];
  }
  return data ?? [];
}

export async function createMotor(nome: string): Promise<Motor> {
  const supabase = createClient();

  const nomeLimpo = nome.trim();
  if (!nomeLimpo) throw new Error("Nome é obrigatório");

  // Verifica se já existe (case-insensitive)
  const { data: existente } = await supabase
    .from("motores")
    .select("id, nome")
    .ilike("nome", nomeLimpo)
    .maybeSingle();

  if (existente) return existente;

  // Cria novo
  const { data, error } = await supabase
    .from("motores")
    .insert({ nome: nomeLimpo, ativo: true })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}