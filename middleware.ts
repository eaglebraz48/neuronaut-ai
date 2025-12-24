import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname, search } = req.nextUrl;
  const isAuth = !!session;

  const isProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/snapshot') ||
    pathname.startsWith('/paths') ||
    pathname.startsWith('/decision');

  const isSignIn = pathname.startsWith('/sign-in');

  // 🔒 Não logado tentando acessar área protegida → landing
  if (!isAuth && isProtected) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url);
  }

  // 🔁 Logado tentando acessar /sign-in → dashboard
  if (isAuth && isSignIn) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/snapshot/:path*',
    '/paths/:path*',
    '/decision/:path*',
    '/sign-in',
  ],
};
