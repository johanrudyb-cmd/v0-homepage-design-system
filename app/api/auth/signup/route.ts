import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();

        if (!email || !password || !name) {
            return NextResponse.json(
                { error: 'Tous les champs sont obligatoires' },
                { status: 400 }
            );
        }

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
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer l'utilisateur
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                plan: 'free', // Plan par défaut
            },
        });

        return NextResponse.json(
            { message: 'Compte créé avec succès', userId: user.id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Erreur lors de l’inscription:', error);
        return NextResponse.json(
            { error: 'Une erreur est survenue lors de l’inscription' },
            { status: 500 }
        );
    }
}
