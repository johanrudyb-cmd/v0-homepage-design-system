import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();

        console.log('[Signup] Tentative inscription pour:', email);

        if (!email || !password || !name) {
            console.log('[Signup] Champs manquants');
            return NextResponse.json(
                { error: 'Tous les champs sont obligatoires' },
                { status: 400 }
            );
        }

        // Vérifier si utilisateur existe déjà
        console.log('[Signup] Vérification existence utilisateur...');
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            console.log('[Signup] Email déjà utilisé');
            return NextResponse.json(
                { error: 'Cet email est déjà utilisé' },
                { status: 400 }
            );
        }

        // Hasher le mot de passe
        console.log('[Signup] Hashage du mot de passe...');
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer utilisateur
        console.log('[Signup] Création utilisateur...');
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                plan: 'free',
            },
        });

        console.log('[Signup] Utilisateur créé avec succès:', user.id);
        return NextResponse.json(
            { message: 'Compte créé avec succès', userId: user.id },
            { status: 201 }
        );
    } catch (error) {
        console.error('[Signup] Erreur lors inscription:', error);
        console.error('[Signup] Type:', error instanceof Error ? error.constructor.name : typeof error);
        console.error('[Signup] Message:', error instanceof Error ? error.message : String(error));

        return NextResponse.json(
            {
                error: 'Une erreur est survenue lors de inscription',
                details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
        );
    }
}
