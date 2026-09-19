import { createClient } from "@/lib/supabase/client";

// ==========================================
// MÉTRICAS GERAIS
// ==========================================

export interface DashboardStats {
  veiculosAtivos: number;
  veiculosTotais: number;
  veiculosInativos: number;
  totalMarcas: number;
  totalModelos: number;
  veiculosSemKm: number;
  veiculosSemCapa: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createClient();

  // Contadores em paralelo (performance)
  const [
    ativosResult,
    inativosResult,
    marcasResult,
    modelosResult,
    semKmResult,
    semCapaResult,
  ] = await Promise.all([
    supabase
      .from("veiculos")
      .select("*", { count: "exact", head: true })
      .eq("ativo", true),
    supabase
      .from("veiculos")
      .select("*", { count: "exact", head: true })
      .eq("ativo", false),
    supabase.from("marcas").select("*", { count: "exact", head: true }),
    supabase.from("modelos").select("*", { count: "exact", head: true }),
    supabase
      .from("veiculos")
      .select("*", { count: "exact", head: true })
      .eq("ativo", true)
      .is("km", null),
    supabase
      .from("veiculos")
      .select("*", { count: "exact", head: true })
      .eq("ativo", true)
      .or("imagem_capa.is.null,imagem_capa.eq."),
  ]);

  const veiculosAtivos = ativosResult.count ?? 0;
  const veiculosInativos = inativosResult.count ?? 0;

  return {
    veiculosAtivos,
    veiculosTotais: veiculosAtivos + veiculosInativos,
    veiculosInativos,
    totalMarcas: marcasResult.count ?? 0,
    totalModelos: modelosResult.count ?? 0,
    veiculosSemKm: semKmResult.count ?? 0,
    veiculosSemCapa: semCapaResult.count ?? 0,
  };
}

// ==========================================
// VEÍCULOS POR MARCA (gráfico)
// ==========================================

export interface VeiculosPorMarca {
  marca: string;
  quantidade: number;
}

export async function getVeiculosPorMarca(): Promise<VeiculosPorMarca[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("veiculos")
    .select("marca")
    .eq("ativo", true);

  if (error) {
    console.error("[getVeiculosPorMarca] Erro:", error);
    return [];
  }

  // Agrupa por marca
  const contagem = data.reduce<Record<string, number>>((acc, v) => {
    acc[v.marca] = (acc[v.marca] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(contagem)
    .map(([marca, quantidade]) => ({ marca, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 8); // top 8 marcas
}

// ==========================================
// CADASTROS NOS ÚLTIMOS 30 DIAS (gráfico)
// ==========================================

export interface CadastrosPorDia {
  data: string; // formato "dd/MM"
  quantidade: number;
}

export async function getCadastrosUltimos30Dias(): Promise<CadastrosPorDia[]> {
  const supabase = createClient();

  const trintaDiasAtras = new Date();
  trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

  const { data, error } = await supabase
    .from("veiculos")
    .select("created_at")
    .gte("created_at", trintaDiasAtras.toISOString());

  if (error) {
    console.error("[getCadastrosUltimos30Dias] Erro:", error);
    return [];
  }

  // Inicializa array com 30 dias (zeros)
  const dias: CadastrosPorDia[] = [];
  const hoje = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(hoje);
    d.setDate(d.getDate() - i);
    dias.push({
      data: d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }),
      quantidade: 0,
    });
  }

  // Preenche com os cadastros reais
  data?.forEach((v) => {
    const d = new Date(v.created_at);
    const key = d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
    const idx = dias.findIndex((x) => x.data === key);
    if (idx >= 0) dias[idx].quantidade += 1;
  });

  return dias;
}

// ==========================================
// ÚLTIMOS VEÍCULOS CADASTRADOS
// ==========================================

export interface VeiculoResumo {
  id: string;
  slug: string | null;
  marca: string;
  modelo: string;
  ano: number;
  preco: number;
  km: number | null;
  imagem_capa: string | null;
  ativo: boolean;
  created_at: string;
}

export async function getUltimosVeiculos(
  limit = 5
): Promise<VeiculoResumo[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("veiculos")
    .select("id, slug, marca, modelo, ano, preco, km, imagem_capa, ativo, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getUltimosVeiculos] Erro:", error);
    return [];
  }

  return (data ?? []).map((v) => ({
    ...v,
    preco: typeof v.preco === "string" ? parseFloat(v.preco) : v.preco,
  }));
}

// ==========================================
// VEÍCULOS SEM KM
// ==========================================

export async function getVeiculosSemKm(limit = 5): Promise<VeiculoResumo[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("veiculos")
    .select("id, slug, marca, modelo, ano, preco, km, imagem_capa, ativo, created_at")
    .eq("ativo", true)
    .is("km", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getVeiculosSemKm] Erro:", error);
    return [];
  }

  return (data ?? []).map((v) => ({
    ...v,
    preco: typeof v.preco === "string" ? parseFloat(v.preco) : v.preco,
  }));
}