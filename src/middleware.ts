import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Não interceptar rotas de recuperação de senha
  const isRecoveryRoute =
    pathname.startsWith("/auth/callback") ||
    pathname === "/atualizar-senha" ||
    pathname === "/recuperar-senha";

  if (isRecoveryRoute) {
    forcarCharsetUtf8(supabaseResponse);
    return supabaseResponse;
  }

  // ─── Proteger rotas /admin ───
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    const { data: roleDataAdmin } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    const roleAdmin = (roleDataAdmin as { role: string } | null)?.role;

    if (roleAdmin !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // ─── Redirecionar usuários logados que tentam acessar /login ───
  if (pathname === "/login" && user) {
    const { data: roleDataLogin } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    const roleLogin = (roleDataLogin as { role: string } | null)?.role;

    if (roleLogin === "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  }

  forcarCharsetUtf8(supabaseResponse);
  return supabaseResponse;
}

/**
 * ⚠️ Força o charset UTF-8 nas respostas HTML.
 * 
 * Por quê: o Cloudflare Workers (via OpenNext) às vezes serve o HTML
 * sem o `charset=utf-8` no Content-Type, fazendo o browser interpretar
 * os acentos como Latin-1 e mostrar "veículo" em vez de "veículo".
 * 
 * Só aplica em HTML — JSON, CSS, JS já vêm com charset correto.
 */
function forcarCharsetUtf8(response: NextResponse) {
  const contentType = response.headers.get("Content-Type");
  
  // Se não tem Content-Type, define como HTML UTF-8
  if (!contentType) {
    response.headers.set("Content-Type", "text/html; charset=utf-8");
    return;
  }

  // Se é HTML e não tem charset, adiciona
  if (
    contentType.startsWith("text/html") &&
    !contentType.toLowerCase().includes("charset")
  ) {
    response.headers.set("Content-Type", "text/html; charset=utf-8");
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};