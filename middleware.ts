import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname.startsWith('/auth');
  const isProtectedRoute = 
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/brands') ||
    pathname.startsWith('/trends') ||
    pathname.startsWith('/spy') ||
    pathname.startsWith('/sourcing') ||
    pathname.startsWith('/ugc');

  // Vérifier le token de session (sans utiliser Prisma directement)
  const token = request.cookies.get('next-auth.session-token') || 
                request.cookies.get('__Secure-next-auth.session-token');

  const isAuthenticated = !!token;

  // Si l'utilisateur est connecté et essaie d'accéder à /auth, rediriger vers dashboard
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée
  if (!isAuthenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
