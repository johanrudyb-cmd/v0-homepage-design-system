import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname.startsWith('/auth');
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/brands') ||
    pathname.startsWith('/trends') ||
    pathname.startsWith('/spy') ||
    pathname.startsWith('/sourcing') ||
    pathname.startsWith('/ugc') ||
    pathname.startsWith('/launch-map') ||
    pathname.startsWith('/design-studio');

  // Vérifier le token de session
  const token = request.cookies.get('auth-token');
  const isAuthenticated = !!token;

  // Si l'utilisateur est connecté et essaie d'accéder à /auth, rediriger vers dashboard
  // MAIS éviter la redirection si on vient juste de se connecter (éviter la boucle)
  if (isAuthenticated && isAuthPage) {
    // Vérifier le referer pour éviter les redirections en boucle
    const referer = request.headers.get('referer');
    const isFromLogin = referer?.includes('/auth/signin') || referer?.includes('/auth/signup');
    
    // Si on vient de la page de connexion, laisser passer pour éviter la boucle
    // Le client gérera la redirection avec router.push
    if (isFromLogin && pathname === '/auth/signin') {
      return NextResponse.next();
    }
    
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée
  if (!isAuthenticated && isProtectedRoute) {
    // Construire l'URL de redirection avec le paramètre redirect
    const redirectUrl = new URL('/auth/signin', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
