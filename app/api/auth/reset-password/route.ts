import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { token, email, password } = await request.json();

        if (!token || !email || !password) {
            return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
        }

        // Vérifier le token
        const verificationToken = await prisma.verificationToken.findUnique({
            where: {
                identifier_token: {
                    identifier: email,
                    token: token,
                },
            },
        });

        if (!verificationToken || verificationToken.expires < new Date()) {
            return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 400 });
        }

        // Hasher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(password, 12);

        // Mettre à jour l'utilisateur et supprimer le token
        await prisma.$transaction([
            prisma.user.update({
                where: { email },
                data: { password: hashedPassword },
            }),
            prisma.verificationToken.delete({
                where: {
                    identifier_token: {
                        identifier: email,
                        token: token,
                    },
                },
            }),
        ]);

        return NextResponse.json({ success: true, message: 'Mot de passe mis à jour' });
    } catch (error) {
        console.error('[Reset-Password] Erreur:', error);
        return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
    }
}
