import { createClient } from "@/lib/supabase/client";

// ==========================================
// TIPOS
// ==========================================

export interface SiteSettingsMap {
  [key: string]: string | null;
}

// ==========================================
// QUERIES
// ==========================================

export async function getSettings(): Promise<SiteSettingsMap> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value");

  if (error) {
    console.error("[getSettings] Erro:", error);
    return {};
  }

  const map: SiteSettingsMap = {};
  (data ?? []).forEach((row) => {
    map[row.key] = row.value;
  });

  return map;
}

// ==========================================
// MUTATIONS
// ==========================================

export async function updateSettings(
  updates: Record<string, string | null>
): Promise<void> {
  const supabase = createClient();

  // Para cada chave, faz upsert
  const promises = Object.entries(updates).map(([key, value]) =>
    supabase
      .from("site_settings")
      .upsert(
        { key, value, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      )
  );

  const results = await Promise.all(promises);

  const erro = results.find((r) => r.error);
  if (erro?.error) {
    console.error("[updateSettings] Erro:", erro.error);
    throw new Error(erro.error.message);
  }
}