export interface Veiculo {
  id: string;
  slug: string | null;
  tipo: "carro" | "moto";          // ← NOVO
  marca: string;
  modelo: string;
  ano: number;
  preco: number;
  km: number | null;
  descricao: string | null;
  cor: string | null;
  combustivel: string | null;
  cambio: string | null;
  cidade: string | null;           // ← NOVO
  estado: string | null;           // ← NOVO
  opcionais: string[] | null;
  imagens: string[] | null;
  whatsapp_link: string | null;
  ativo: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  marca_id: string | null;
  modelo_id: string | null;
  imagem_capa: string | null;
  status: VeiculoStatus;
  placa: string | null;
  motor: string | null;
  cores?: { nome: string; hex: string | null } | null;
}

// Raw vindo direto do Supabase (antes de normalizar)
export interface VeiculoRaw {
  id: string;
  slug: string | null;
  tipo: "carro" | "moto";
  marca: string;
  modelo: string;
  ano: number;
  preco: string | number;
  km: number | null;
  descricao: string | null;
  cor: string | null;
  combustivel: string | null;
  cambio: string | null;
  cidade: string | null;
  estado: string | null;
  opcionais: string[] | null;
  imagens: string[] | null;
  whatsapp_link: string | null;
  ativo: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  marca_id: string | null;
  modelo_id: string | null;
  imagem_capa: string | null;
  status: VeiculoStatus;
  placa: string | null;
  motor: string | null;
  cores?: { nome: string; hex: string | null } | null;
}

export interface VeiculoFiltros {
  tipo?: "carro" | "moto";        
  marcas?: string[];
  modelos?: string[];
  cidade?: string;   
  estado?: string;
  anoMin?: number;
  anoMax?: number;
  precoMin?: number;
  precoMax?: number;
  kmMin?: number;
  kmMax?: number;
  cambio?: string[];
  combustivel?: string[];
  cor?: string[];
  search?: string;
  ordenacao?: VeiculoOrdenacao;
  limit?: number;
}

export type VeiculoOrdenacao =
  | "recentes"
  | "preco-asc"
  | "preco-desc"
  | "ano-desc"
  | "ano-asc"
  | "km-asc";

export type VeiculoStatus = "disponivel" | "vendido" | "removido";