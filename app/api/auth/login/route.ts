import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

// Forcer Node.js runtime
export const runtime = 'nodejs';

// Helper pour détecter la production (compatible Turbopack)
function isProduction(): boolean {
  // Vérifier VERCEL d'abord (plus fiable)
  if (process.env.VERCEL === '1') return true;
  // Ensuite NODE_ENV (peut être undefined au build)
  const nodeEnv = process.env.NODE_ENV;
  return nodeEnv === 'production';
}

// Vérifier et encoder le secret JWT
function getSecret(): Uint8Array {
  const secretValue = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  
  // Ne pas vérifier isProduction() au niveau du module (problème Turbopack)
  // La vérification sera faite dans la fonction POST
  
  if (!secretValue || secretValue === 'fallback-secret-key-change-in-production') {
    // Toujours utiliser fallback au niveau du module
    // La vérification production sera faite dans POST()
  }
  
  return new TextEncoder().encode(secretValue || 'fallback-secret-key-change-in-production');
}

// Initialiser le secret (peut utiliser fallback en dev)
let secret: Uint8Array;
try {
  secret = getSecret();
} catch (error) {
  // En cas d'erreur, utiliser un fallback temporaire
  console.error('[AUTH] Erreur lors de l\'initialisation du secret:', error);
  secret = new TextEncoder().encode('fallback-secret-key-change-in-production');
}

export async function POST(request: Request) {
  const startTime = Date.now();
  let errorStep = 'initialization';
  
  try {
    // Étape 1: Vérifier les variables d'environnement
    errorStep = 'env_check';
    if (!process.env.DATABASE_URL) {
      console.error('[AUTH LOGIN] DATABASE_URL non configuré');
      return NextResponse.json(
        { error: 'Configuration serveur incorrecte' },
        { status: 500 }
      );
    }

    // Étape 2: Parser le body de la requête
    errorStep = 'parse_body';
    let email: string;
    let password: string;
    try {
      const body = await request.json();
      email = body.email;
      password = body.password;
    } catch (parseError) {
      console.error('[AUTH LOGIN] Erreur parsing JSON:', parseError);
      return NextResponse.json(
        { error: 'Format de requête invalide' },
        { status: 400 }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Étape 3: Rechercher l'utilisateur dans la base de données
    // (On essaie directement, la vérification Prisma se fera automatiquement)
    errorStep = 'db_query';
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
    } catch (dbError: unknown) {
      const dbErrorMessage = dbError instanceof Error ? dbError.message : String(dbError);
      const errorStack = dbError instanceof Error ? dbError.stack : undefined;
      
      // Détecter les erreurs spécifiques Prisma/DATABASE_URL
      const isPrismaInitError = 
        dbErrorMessage.includes('Environment variable not found: DATABASE_URL') ||
        dbErrorMessage.includes('PrismaClientInitializationError') ||
        dbErrorMessage.includes('DATABASE_URL') ||
        (errorStack && errorStack.includes('schema.prisma'));
      
      console.error('[AUTH LOGIN] Erreur de connexion à la base de données:', {
        error: dbErrorMessage,
        errorStack: errorStack?.substring(0, 200),
        email: email.substring(0, 5) + '***',
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        isPrismaInitError,
      });
      
      if (isPrismaInitError) {
        return NextResponse.json(
          { error: 'Configuration serveur incorrecte' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: 'Erreur de connexion à la base de données' },
        { status: 500 }
      );
    }

    if (!user || !user.password) {
      // Ne pas révéler si l'email existe ou non (sécurité)
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Étape 5: Vérifier le mot de passe avec bcrypt
    errorStep = 'password_check';
    let isPasswordValid: boolean;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } catch (bcryptError: unknown) {
      const bcryptMessage = bcryptError instanceof Error ? bcryptError.message : String(bcryptError);
      console.error('[AUTH LOGIN] Erreur lors de la vérification du mot de passe:', bcryptMessage);
      return NextResponse.json(
        { error: 'Erreur lors de la vérification' },
        { status: 500 }
      );
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Étape 6: Vérifier le secret avant de créer le token JWT
    errorStep = 'secret_check';
    const secretValue = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
    
    if (isProduction() && (!secretValue || secretValue === 'fallback-secret-key-change-in-production')) {
      console.error('[AUTH LOGIN] ⚠️ CRITIQUE: NEXTAUTH_SECRET non configuré en production !');
      return NextResponse.json(
        { error: 'Configuration serveur incorrecte' },
        { status: 500 }
      );
    }
    
    // Re-générer le secret au cas où il aurait changé
    const currentSecret = new TextEncoder().encode(
      secretValue || 'fallback-secret-key-change-in-production'
    );
    
    // Étape 7: Créer le token JWT
    errorStep = 'jwt_create';
    let token: string;
    try {
      token = await new SignJWT({
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(currentSecret);
    } catch (jwtError: unknown) {
      const jwtMessage = jwtError instanceof Error ? jwtError.message : String(jwtError);
      console.error('[AUTH LOGIN] Erreur lors de la création du token JWT:', {
        error: jwtMessage,
        hasSecret: !!secretValue,
        secretLength: secretValue?.length || 0,
      });
      return NextResponse.json(
        { error: 'Erreur lors de la création de la session' },
        { status: 500 }
      );
    }

    // Étape 8: Créer la réponse avec le cookie
    errorStep = 'response_create';
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
    const prodCheck = isProduction();
    // Détecter HTTPS via x-forwarded-proto (Vercel) ou l'URL de la requête
    const forwardedProto = request.headers.get('x-forwarded-proto');
    const isHttps = forwardedProto === 'https' || (prodCheck && !forwardedProto) || request.url.startsWith('https://');
    
    // Log pour diagnostic (uniquement en production pour voir ce qui se passe)
    if (prodCheck) {
      console.log('[AUTH LOGIN] Cookie config:', {
        isVercel,
        isProduction: prodCheck,
        forwardedProto,
        isHttps,
        url: request.url.substring(0, 50),
        hasSecret: !!process.env.NEXTAUTH_SECRET || !!process.env.AUTH_SECRET,
        duration: `${Date.now() - startTime}ms`,
      });
    }
    
    try {
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: isHttps || prodCheck, // true en production (HTTPS requis), false en local (HTTP)
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 jours
        path: '/',
        // Ne pas définir domain pour permettre le cookie sur tous les sous-domaines
      });
    } catch (cookieError: unknown) {
      const cookieMessage = cookieError instanceof Error ? cookieError.message : String(cookieError);
      console.error('[AUTH LOGIN] Erreur lors de la définition du cookie:', cookieMessage);
      // Continuer quand même, le token est dans la réponse JSON
    }

    // Éviter la mise en cache de la réponse (problèmes sur mobile)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');

    return response;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    const duration = Date.now() - startTime;
    
    // Log détaillé pour diagnostic
    console.error('[AUTH LOGIN] Erreur capturée:', {
      step: errorStep,
      error: errorMessage,
      stack: errorStack?.substring(0, 500), // Limiter la taille du log
      duration: `${duration}ms`,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasSecret: !!process.env.NEXTAUTH_SECRET || !!process.env.AUTH_SECRET,
      isVercel: process.env.VERCEL === '1',
      nodeEnv: process.env.NODE_ENV || 'undefined',
    });
    
    // Détecter le type d'erreur
    const isPrismaInitError = 
      errorMessage.includes('Environment variable not found: DATABASE_URL') ||
      errorMessage.includes('PrismaClientInitializationError') ||
      (errorMessage.includes('DATABASE_URL') && errorMessage.includes('schema.prisma')) ||
      (errorStack && errorStack.includes('schema.prisma'));
    
    const isDatabaseError = 
      !isPrismaInitError && (
        errorMessage.includes('prisma') || 
        errorMessage.includes('database') || 
        errorMessage.includes('connection') ||
        errorMessage.includes('P1001') || // Prisma connection error
        errorMessage.includes('P2002') || // Prisma unique constraint
        errorMessage.includes('P2025')    // Prisma record not found
      );
    
    const isJwtError = 
      errorMessage.includes('JWT') || 
      errorMessage.includes('jose') ||
      errorMessage.includes('secret');
    
    // Si c'est une erreur Prisma initialization (DATABASE_URL manquant), retourner un message clair
    if (isPrismaInitError) {
      return NextResponse.json(
        { error: 'Configuration serveur incorrecte' },
        { status: 500 }
      );
    }
    
    // En production, ne pas exposer les détails de l'erreur pour la sécurité
    const prodCheck = isProduction();
    
    if (prodCheck) {
      // Retourner un message générique mais loguer les détails
      return NextResponse.json(
        { error: 'Une erreur est survenue lors de la connexion' },
        { status: 500 }
      );
    }
    
    // En développement/preview, retourner plus de détails pour le debug
    return NextResponse.json(
      { 
        error: 'Une erreur est survenue lors de la connexion',
        step: errorStep,
        details: isDatabaseError 
          ? 'Erreur de connexion à la base de données' 
          : isJwtError
          ? 'Erreur lors de la création du token'
          : errorMessage,
        duration: `${duration}ms`,
      },
      { status: 500 }
    );
  }
}
