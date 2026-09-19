"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface SiteSettings {
  whatsapp_number: string;
  whatsapp_message: string;
  whatsapp_enabled: string;
  whatsapp_label: string;
}

const DEFAULTS: SiteSettings = {
  whatsapp_number: "5511999999999",
  whatsapp_message: "Olá! Vi o site e gostaria de mais informações.",
  whatsapp_enabled: "true",
  whatsapp_label: "Fale conosco",
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("key, value")
          .in("key", [
            "whatsapp_number",
            "whatsapp_message",
            "whatsapp_enabled",
            "whatsapp_label",
          ]);

        if (error) throw error;

        if (data) {
          const parsed = { ...DEFAULTS };
          (data as Array<{ key: string; value: string | null }>).forEach((row) => {
            if (row.key in parsed) {
              parsed[row.key as keyof SiteSettings] = row.value ?? "";
            }
          });
          setSettings(parsed);
        }
      } catch (err) {
        console.warn(
          "[useSiteSettings] Erro ao carregar configurações, usando padrões:",
          err
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { settings, loading };
}