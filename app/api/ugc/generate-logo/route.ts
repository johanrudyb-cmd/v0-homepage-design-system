
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { sanitizeErrorMessage } from '@/lib/utils';
import { generateDesignImage, isIdeogramConfigured } from '@/lib/api/ideogram';
import { withAIUsageLimit } from '@/lib/ai-usage';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        if (!isIdeogramConfigured()) {
            return NextResponse.json(
                { error: 'Génération d\'image non configurée (IDEogram).' },
                { status: 503 }
            );
        }

        const body = await request.json();
        const { prompt, aspectRatio = '1:1', brandId } = body;

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json({ error: 'Prompt requis' }, { status: 400 });
        }

        // On utilise le quota 'brand_logo' (0.10€ / appel)
        // On pourrait créer un 'ugc_logo_creation' spécifique si besoin.
        // L'appel génère 1 image.
        const result = await withAIUsageLimit(
            user.id,
            user.plan,
            'brand_logo',
            async () => {
                const imageUrl = await generateDesignImage(prompt, {
                    aspect_ratio: aspectRatio,
                    transparent: false, // On laisse le fond pour l'instant (le user peut demander transparent via prompt ou option)
                    // Ideogram v3 gère bien le texte
                });
                return imageUrl;
            },
            { brandId, prompt }
        );

        return NextResponse.json({ url: result });

    } catch (error: unknown) {
        console.error('[ugc/generate-logo]', error);
        const message = error instanceof Error ? error.message : 'Erreur inconnue';
        return NextResponse.json({ error: sanitizeErrorMessage(message) }, { status: 500 });
    }
}
