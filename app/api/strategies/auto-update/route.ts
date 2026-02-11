import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const openai = process.env.CHATGPT_API_KEY
    ? new OpenAI({
        apiKey: process.env.CHATGPT_API_KEY,
    })
    : null;

/**
 * API pour mettre à jour automatiquement les stratégies des utilisateurs
 * en fonction des nouveaux articles de blog.
 * 
 * Appelé par un cron job quotidien (Vercel Cron ou n8n)
 */
export async function POST(req: NextRequest) {
    try {
        // Vérifier l'authentification du cron (secret token)
        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Récupérer les articles publiés dans les 7 derniers jours
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentPosts = await prisma.blogPost.findMany({
            where: {
                published: true,
                publishedAt: { gte: sevenDaysAgo }
            },
            orderBy: { publishedAt: 'desc' }
        });

        if (recentPosts.length === 0) {
            return NextResponse.json({
                message: 'No recent blog posts to process',
                updated: 0
            });
        }

        let totalUpdated = 0;
        const updateLog: Array<{ brandId: string; brandName: string; postTitle: string }> = [];

        // 2. Pour chaque article, trouver les marques concernées
        for (const post of recentPosts) {
            if (!post.relatedBrands || post.relatedBrands.length === 0) continue;

            // Trouver toutes les marques qui utilisent une des marques de référence mentionnées
            const affectedBrands = await prisma.brand.findMany({
                where: {
                    templateBrandSlug: { in: post.relatedBrands },
                    // Uniquement les utilisateurs premium
                    user: {
                        plan: { in: ['pro', 'enterprise'] }
                    }
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            plan: true
                        }
                    }
                }
            });

            // 3. Mettre à jour chaque stratégie concernée
            for (const brand of affectedBrands) {
                try {
                    const currentStrategy = typeof brand.styleGuide === 'object' && brand.styleGuide !== null
                        ? (brand.styleGuide as any).story || ''
                        : '';

                    if (!currentStrategy) continue; // Pas de stratégie à mettre à jour

                    if (!openai) {
                        console.error('[Auto-Update] OpenAI is not configured');
                        continue;
                    }

                    // Appel à l'IA pour adapter la stratégie
                    const completion = await openai.chat.completions.create({
                        model: 'gpt-4o-mini',
                        messages: [
                            {
                                role: 'system',
                                content: `Tu es un expert en stratégie de marque. Tu dois adapter subtilement la stratégie existante d'une marque en fonction d'une nouvelle actualité concernant sa marque de référence.

RÈGLES IMPORTANTES:
- Ne change PAS l'essence de la marque
- Intègre les insights pertinents de l'actualité
- Reste cohérent avec le positionnement existant
- Ajoute une section "📰 Actualité récente" à la fin si pertinent
- Sois concis et actionnable`
                            },
                            {
                                role: 'user',
                                content: `Marque: ${brand.name}
Marque de référence: ${brand.templateBrandSlug}

STRATÉGIE ACTUELLE:
${currentStrategy}

NOUVELLE ACTUALITÉ (${post.title}):
${post.excerpt}

Adapte la stratégie en intégrant ces insights de manière naturelle.`
                            }
                        ],
                        temperature: 0.7,
                        max_tokens: 1500
                    });

                    const updatedStrategy = completion.choices[0].message.content || currentStrategy;

                    // Archiver l'ancienne version
                    const styleGuide = typeof brand.styleGuide === 'object' && brand.styleGuide !== null
                        ? brand.styleGuide as any
                        : {};

                    const archiveEntry = {
                        date: new Date().toISOString(),
                        story: currentStrategy,
                        source: `Blog post: ${post.title}`
                    };

                    const previousVersions = styleGuide.previousVersions || [];
                    previousVersions.push(archiveEntry);

                    // Mettre à jour la stratégie
                    await prisma.brand.update({
                        where: { id: brand.id },
                        data: {
                            styleGuide: {
                                ...styleGuide,
                                story: updatedStrategy,
                                lastAIUpdate: new Date().toISOString(),
                                lastUpdateSource: post.title,
                                previousVersions: previousVersions.slice(-10) // Garder max 10 versions
                            }
                        }
                    });

                    // Créer une notification pour l'utilisateur
                    await prisma.notification.create({
                        data: {
                            userId: brand.user.id,
                            type: 'strategy_updated',
                            title: '✨ Stratégie mise à jour automatiquement',
                            message: `Votre stratégie pour "${brand.name}" a été enrichie avec les dernières actualités concernant ${brand.templateBrandSlug}. Découvrez les nouveaux insights !`,
                            link: `/brands/${brand.id}`,
                            read: false
                        }
                    });

                    totalUpdated++;
                    updateLog.push({
                        brandId: brand.id,
                        brandName: brand.name,
                        postTitle: post.title
                    });

                } catch (error) {
                    console.error(`Error updating brand ${brand.id}:`, error);
                    // Continue avec les autres marques même si une échoue
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `Successfully updated ${totalUpdated} brand strategies`,
            postsProcessed: recentPosts.length,
            brandsUpdated: totalUpdated,
            updates: updateLog
        });

    } catch (error) {
        console.error('Error in auto-update:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// Endpoint GET pour tester manuellement (dev only)
export async function GET(req: NextRequest) {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
    }

    return NextResponse.json({
        message: 'Auto-update endpoint. Use POST with cron secret to trigger updates.',
        recentPosts: await prisma.blogPost.count({
            where: {
                published: true,
                publishedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            }
        })
    });
}
