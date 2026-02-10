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
  
  // Vérifier le referer pour détecter la navigation interne
  const referer = request.headers.get('referer');
  const isFromProtectedRoute = referer ? (
    referer.includes('/dashboard') ||
    referer.includes('/brands') ||
    referer.includes('/trends') ||
    referer.includes('/spy') ||
    referer.includes('/sourcing') ||
    referer.includes('/ugc') ||
    referer.includes('/launch-map') ||
    referer.includes('/design-studio')
  ) : false;

  // Si l'utilisateur est connecté et essaie d'accéder à /auth, rediriger vers dashboard
  // MAIS éviter la redirection si on vient juste de se connecter (éviter la boucle)
  if (isAuthenticated && isAuthPage) {
    // Vérifier si on vient de la page de connexion
    const isFromLogin = referer?.includes('/auth/signin') || referer?.includes('/auth/signup');
    
    // Vérifier aussi si c'est une requête POST (formulaire de connexion)
    const isPostRequest = request.method === 'POST';
    
    // Si on vient de la page de connexion OU c'est une requête POST, laisser passer
    // Le client gérera la redirection avec router.push après que le cookie soit propagé
    if ((isFromLogin || isPostRequest) && pathname === '/auth/signin') {
      return NextResponse.next();
    }
    
    // Sinon, rediriger vers dashboard (utilisateur déjà connecté)
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée
  if (!isAuthenticated && isProtectedRoute) {
    // IMPORTANT: Si on vient d'une route protégée (navigation interne), 
    // ne pas rediriger immédiatement pour éviter les boucles
    // Le cookie pourrait être en train de se propager ou la navigation est en cours
    if (isFromProtectedRoute) {
      // Laisser passer et laisser la page Server Component gérer la redirection
      // Cela évite les boucles de redirection infinies lors de la navigation
      return NextResponse.next();
    }
    
    // Sinon, rediriger vers la page de connexion
    const redirectUrl = new URL('/auth/signin', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Si l'utilisateur est authentifié, laisser passer toutes les routes (protégées ou non)
  // Cela permet la navigation fluide dans l'app
  if (isAuthenticated) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
