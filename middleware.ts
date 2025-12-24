import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  const isAuthPage = pathname.startsWith("/sign-in");
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/snapshot") ||
    pathname.startsWith("/paths");

  // Supabase session cookie (default)
  const hasSession =
    req.cookies.has("sb-access-token") ||
    req.cookies.has("sb:token");

  // 🚫 Deslogado tentando acessar área protegida
  if (isProtected && !hasSession) {
    const lang = searchParams.get("lang") || "en";
    return NextResponse.redirect(
      new URL(`/sign-in?lang=${lang}`, req.url)
    );
  }

  // 🚫 Logado tentando acessar sign-in
  if (isAuthPage && hasSession) {
    const lang = searchParams.get("lang") || "en";
    return NextResponse.redirect(
      new URL(`/dashboard?lang=${lang}`, req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/snapshot/:path*",
    "/paths/:path*",
    "/sign-in",
  ],
};
