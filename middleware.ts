import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Routes publiques (pas de vérification d'auth)
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
  const token = request.cookies.get('auth-token');
  const isAuthenticated = !!token;

  // RÈGLE SIMPLE 1: Si connecté et sur page auth → rediriger vers dashboard
  if (isAuthenticated && pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // RÈGLE SIMPLE 2: Si pas connecté et route protégée → rediriger vers signin avec redirect param
  if (!isAuthenticated && isProtectedRoute) {
    const redirectUrl = new URL('/auth/signin', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Sinon, laisser passer
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)'],
};
