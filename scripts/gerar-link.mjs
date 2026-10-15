import { createClient } from "@supabase/supabase-js";

// Substitua pelas suas chaves ou garanta que o env-file carregue elas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function gerar() {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: 'wancar.veiculos@hotmail.com',
    options: {
      // Mude para http://localhost:3000/auth/callback se estiver testando localmente
      redirectTo: 'https://www.wancarveiculos.com.br/auth/callback' 
    }
  });

  if (error) {
    console.error("Erro:", error);
  } else {
    console.log("🔗 Copie e cole na aba anônima:", data.properties.action_link);
  }
}

gerar();