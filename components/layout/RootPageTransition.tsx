'use client';

import { PageTransition } from './PageTransition';

interface RootPageTransitionProps {
  children: React.ReactNode;
}

/**
 * Composant wrapper pour les transitions de page au niveau racine.
 * À utiliser dans les layouts qui ne passent pas par DashboardLayout.
 */
export function RootPageTransition({ children }: RootPageTransitionProps) {
  return <PageTransition>{children}</PageTransition>;
}
