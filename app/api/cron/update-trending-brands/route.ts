import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateMonthlyTrendingBrands } from '@/lib/api/chatgpt';

/**
 * API pour déclencher manuellement ou via CRON la mise à jour des marques tendances.
 * Sécurisé par CRON_SECRET.
 */
export async function POST(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const secret = searchParams.get('secret');

        if (secret !== process.env.CRON_SECRET) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const now = new Date();
        const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        console.log(`[CRON] Début mise à jour marques tendances pour ${monthKey}`);

        const topBrands = await generateMonthlyTrendingBrands();

        await prisma.$transaction(async (tx) => {
            await tx.trendingBrand.deleteMany({
                where: { month: monthKey }
            });

            for (const b of topBrands) {
                await tx.trendingBrand.create({
                    data: {
                        rank: b.rank,
                        brand: b.brand,
                        score: b.score,
                        scoreValue: b.scoreValue,
                        signaturePiece: b.signaturePiece,
                        dominantStyle: b.dominantStyle,
                        cyclePhase: b.cyclePhase,
                        launchPotential: b.launchPotential,
                        indicativePrice: b.indicativePrice,
                        websiteUrl: b.websiteUrl,
                        month: monthKey,
                    }
                });
            }
        });

        return NextResponse.json({
            success: true,
            month: monthKey,
            count: topBrands.length
        });

    } catch (error: any) {
        console.error('[CRON Error] Trending Brands:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * GET permet de voir les marques du mois en cours.
 */
export async function GET() {
    try {
        const now = new Date();
        const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        const brands = await prisma.trendingBrand.findMany({
            where: { month: monthKey },
            orderBy: { rank: 'asc' }
        });

        return NextResponse.json({
            month: monthKey,
            brands
        });
    } catch (error) {
        console.error('[API Error] Fetching Trending Brands:', error);
        return NextResponse.json({ month: '', brands: [] });
    }
}
