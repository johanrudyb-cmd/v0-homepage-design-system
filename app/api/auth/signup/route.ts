import { NextResponse } from 'next/server';

// Forcer Node.js runtime
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { isDatabaseAvailable } = await import('@/lib/prisma');
    if (!isDatabaseAvailable()) {
      return NextResponse.json(
        { error: 'Service temporairement indisponible. Veuillez réessayer plus tard.' },
        { status: 503 }
      );
    }

    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Utiliser Prisma via import dynamique pour éviter les problèmes Edge Runtime
    const { prisma } = await import('@/lib/prisma');
    const bcrypt = await import('bcryptjs');

    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Cet email est déjà utilisé' },
          { status: 400 }
        );
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.default.hash(password, 12);

      // Créer l'utilisateur
      const user = await prisma.user.create({
        data: {
          email,
          name: name || null,
          password: hashedPassword,
          plan: 'free',
        },
      });

      return NextResponse.json(
        { message: 'Compte créé avec succès', userId: user.id },
        { status: 201 }
      );
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      
      // Si erreur de connexion, essayer via MCP Supabase
      if (dbError.message?.includes('ENOTFOUND') || dbError.message?.includes('getaddrinfo')) {
        console.log('Tentative de création via MCP Supabase...');
        // Note: On ne peut pas utiliser MCP directement dans une route API
        // Il faut corriger la connection string
        return NextResponse.json(
          { 
            error: 'Erreur de connexion à la base de données',
            details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
          },
          { status: 500 }
        );
      }
      throw dbError;
    }
  } catch (error: any) {
    console.error('Signup error:', error);
    console.error('Error stack:', error?.stack);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
    });
    
    // Retourner un message d'erreur plus détaillé en développement
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error?.message || 'Une erreur est survenue lors de la création du compte'
      : 'Une erreur est survenue lors de la création du compte';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { 
          details: error?.stack,
          code: error?.code 
        })
      },
      { status: 500 }
    );
  }
}
