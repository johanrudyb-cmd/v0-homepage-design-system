import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/resend-mail';
import { randomBytes } from 'crypto';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email requis' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        // Pour la sécurité, on ne dit pas si l'utilisateur existe ou non
        if (!user) {
            console.log(`[Forgot-Password] Tentative avec email non existant: ${email}`);
            return NextResponse.json({ success: true, message: 'Si l\'email existe, un lien a été envoyé' });
        }

        // Générer un token sécurisé
        const token = randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 heure

        // Enregistrer le token (utiliser VerificationToken)
        await prisma.verificationToken.upsert({
            where: {
                identifier_token: {
                    identifier: email,
                    token: token,
                },
            },
            update: {
                token: token,
                expires: expires,
            },
            create: {
                identifier: email,
                token: token,
                expires: expires,
            },
        });

        // Préparer l'URL de reset
        const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

        // Envoyer l'email via Resend
        await sendEmail({
            to: email,
            subject: 'Réinitialisation de votre mot de passe - OUTFITY',
            html: `
                <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #f9f9fab; border-radius: 12px;">
                    <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: center;">
                        <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 700; margin-bottom: 24px;">Réinitialisation de mot de passe</h1>
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                            Bonjour ${user.name || 'utilisateur OUTFITY'},<br><br>
                            Vous recevez cet email car vous avez demandé à réinitialiser le mot de passe de votre compte OUTFITY.
                        </p>
                        <a href="${resetUrl}" style="display: inline-block; background: #000; color: white; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px;">
                            Réinitialiser mon mot de passe
                        </a>
                        <p style="color: #9ca3af; font-size: 14px; margin-top: 32px;">
                            Ce lien expirera dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
                        </p>
                    </div>
                </div>
            `,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Forgot-Password] Erreur:', error);
        return NextResponse.json({ error: 'Une erreur est survenue lors de l\'envoi' }, { status: 500 });
    }
}
