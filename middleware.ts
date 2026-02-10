import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-key-change-in-production'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes publiques
  const publicRoutes = ['/auth', '/api'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Routes protégées
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/brands') ||
    pathname.startsWith('/trends') ||
    pathname.startsWith('/spy') ||
    pathname.startsWith('/sourcing') ||
    pathname.startsWith('/ugc') ||
    pathname.startsWith('/launch-map') ||
    pathname.startsWith('/design-studio') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/settings');

  // Vérifier le token de session
  const token = request.cookies.get('auth-token')?.value;

  let isAuthenticated = false;
  let isTokenValid = false;

  if (token) {
    isAuthenticated = true;
    try {
      await jwtVerify(token, secret);
      isTokenValid = true;
    } catch (e) {
      // Token invalide ou expiré
      isTokenValid = false;
    }
  }

  // RÈGLE 1: Si sur une route protégée et pas de token OU token invalide
  if (isProtectedRoute && (!isAuthenticated || !isTokenValid)) {
    const response = NextResponse.redirect(new URL('/auth/signin', request.url));
    if (isAuthenticated && !isTokenValid) {
      // Si le token existe mais est invalide, on le supprime pour éviter la boucle
      response.cookies.delete('auth-token');
    }
    const redirectUrl = new URL('/auth/signin', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // RÈGLE 2: Si connecté avec token VALIDE et sur page auth → rediriger vers dashboard
  if (isAuthenticated && isTokenValid && pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)'],
};
