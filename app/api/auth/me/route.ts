import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    // Retourner 200 avec user: null si pas connecté (pas d'erreur)
    // Le client gère déjà le cas où user est null
    return NextResponse.json({ user });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[AUTH ME] Erreur:', errorMessage);
    
    // Retourner user: null en cas d'erreur (pas d'erreur 500)
    return NextResponse.json({ user: null });
  }
}
