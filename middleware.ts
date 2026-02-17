import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;

  const isAuthPage = nextUrl.pathname.startsWith('/auth');
  const isProtectedRoute = [
    '/dashboard',
    '/brands',
    '/trends',
    '/spy',
    '/sourcing',
    '/ugc',
    '/launch-map',
    '/design-studio',
    '/onboarding',
    '/settings',
    '/hub',        // Launcher
    '/academy',    // Growth App
    '/partners'    // Dashboard Affilié (MAIS PAS /partners/join)
  ].some(route => {
    // Exception pour la landing page publique d'affiliation
    if (nextUrl.pathname === '/partners/join') return false;
    return nextUrl.pathname.startsWith(route);
  });

  if (isAuthPage) {
    // Commenté temporairement pour éviter les boucles après reset de DB
    // if (isAuthenticated) {
    //   return NextResponse.redirect(new URL('/dashboard', nextUrl));
    // }
    return NextResponse.next();
  }

  if (isProtectedRoute && !isAuthenticated) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${encodedCallbackUrl}`, nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)'],
};
