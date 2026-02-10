import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

// Forcer Node.js runtime
export const runtime = 'nodejs';

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'fallback-secret-key-change-in-production'
);

// Vérifier que le secret est configuré en production
if ((process.env.VERCEL || process.env.NODE_ENV === 'production') && (!process.env.NEXTAUTH_SECRET && !process.env.AUTH_SECRET)) {
  console.error('[AUTH] ⚠️ NEXTAUTH_SECRET ou AUTH_SECRET doit être défini en production !');
}

export async function POST(request: Request) {
  try {
    // Vérifier que la base de données est disponible
    if (!process.env.DATABASE_URL) {
      console.error('[AUTH LOGIN] DATABASE_URL non configuré');
      return NextResponse.json(
        { error: 'Configuration serveur incorrecte' },
        { status: 500 }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Rechercher l'utilisateur avec gestion d'erreur explicite
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email },
      });
    } catch (dbError) {
      console.error('[AUTH LOGIN] Erreur de connexion à la base de données:', dbError);
      return NextResponse.json(
        { error: 'Erreur de connexion à la base de données' },
        { status: 500 }
      );
    }

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Créer un token JWT
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    // Créer la réponse avec le cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
      },
    });

    // Définir le cookie de session (compatible mobile / Safari)
    // En production (Vercel), toujours utiliser secure=true car HTTPS est requis
    const isVercel = process.env.VERCEL === '1';
    const isProduction = isVercel || process.env.NODE_ENV === 'production';
    // Détecter HTTPS via x-forwarded-proto (Vercel) ou l'URL de la requête
    const forwardedProto = request.headers.get('x-forwarded-proto');
    const isHttps = forwardedProto === 'https' || (isProduction && !forwardedProto) || request.url.startsWith('https://');
    
    // Log pour diagnostic (uniquement en production pour voir ce qui se passe)
    if (isProduction) {
      console.log('[AUTH LOGIN] Cookie config:', {
        isVercel,
        isProduction,
        forwardedProto,
        isHttps,
        url: request.url.substring(0, 50),
        hasSecret: !!process.env.NEXTAUTH_SECRET || !!process.env.AUTH_SECRET,
      });
    }
    
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: isHttps || isProduction, // true en production (HTTPS requis), false en local (HTTP)
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
      // Ne pas définir domain pour permettre le cookie sur tous les sous-domaines
    });

    // Éviter la mise en cache de la réponse (problèmes sur mobile)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');

    return response;
  } catch (error: unknown) {
    console.error('[AUTH LOGIN] Erreur:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    const isDatabaseError = errorMessage.includes('prisma') || errorMessage.includes('database') || errorMessage.includes('connection');
    
    // En production, ne pas exposer les détails de l'erreur pour la sécurité
    if (process.env.VERCEL === '1' || process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Une erreur est survenue lors de la connexion' },
        { status: 500 }
      );
    }
    
    // En développement, retourner plus de détails pour le debug
    return NextResponse.json(
      { 
        error: 'Une erreur est survenue lors de la connexion',
        details: isDatabaseError ? 'Erreur de connexion à la base de données' : errorMessage
      },
      { status: 500 }
    );
  }
}
