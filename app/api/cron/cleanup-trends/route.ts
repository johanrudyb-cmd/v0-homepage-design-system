import { NextRequest, NextResponse } from 'next/server';
import {
    recalculateAllTrendScores,
    cleanupOldTrends,
} from '@/lib/trend-scoring';

/**
 * API de nettoyage automatique des tendances
 * 
 * POST /api/cron/cleanup-trends
 * 
 * Headers:
 *   Authorization: Bearer <CRON_SECRET>
 * 
 * Body (optionnel):
 *   { "dryRun": true }  // Pour simulation sans suppression
 */
export async function POST(request: NextRequest) {
    try {
        // Vérification de l'authentification
        const authHeader = request.headers.get('authorization');
        const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

        if (!process.env.CRON_SECRET) {
            return NextResponse.json(
                { error: 'CRON_SECRET not configured' },
                { status: 500 }
            );
        }

        if (authHeader !== expectedAuth) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Récupérer les paramètres
        const body = await request.json().catch(() => ({}));
        const dryRun = body.dryRun === true;

        console.log(`[Cleanup Trends] Starting ${dryRun ? '(dry-run)' : '(real)'}...`);

        // 1. Recalculer tous les scores
        const { updated, averageScore } = await recalculateAllTrendScores();
        console.log(`[Cleanup Trends] Recalculated ${updated} scores, avg: ${averageScore.toFixed(1)}`);

        // 2. Nettoyer les anciennes tendances
        const cleanup = await cleanupOldTrends(dryRun);
        console.log(`[Cleanup Trends] ${dryRun ? 'Would delete' : 'Deleted'} ${cleanup.toDelete} products, kept ${cleanup.keptIds.length}`);

        return NextResponse.json({
            success: true,
            dryRun,
            stats: {
                scoresRecalculated: updated,
                averageScore: Math.round(averageScore),
                productsDeleted: cleanup.toDelete,
                productsKept: cleanup.keptIds.length,
            },
            message: dryRun
                ? `Simulation: ${cleanup.toDelete} produits seraient supprimés`
                : `${cleanup.toDelete} produits obsolètes supprimés`,
        });
    } catch (error) {
        console.error('[Cleanup Trends] Error:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/cron/cleanup-trends
 * Retourne les statistiques sans effectuer de nettoyage
 */
export async function GET(request: NextRequest) {
    try {
        // Vérification de l'authentification
        const authHeader = request.headers.get('authorization');
        const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

        if (!process.env.CRON_SECRET) {
            return NextResponse.json(
                { error: 'CRON_SECRET not configured' },
                { status: 500 }
            );
        }

        if (authHeader !== expectedAuth) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Simulation pour voir ce qui serait supprimé
        const cleanup = await cleanupOldTrends(true);

        return NextResponse.json({
            success: true,
            stats: {
                totalProducts: cleanup.toDelete + cleanup.keptIds.length,
                wouldDelete: cleanup.toDelete,
                wouldKeep: cleanup.keptIds.length,
            },
            message: `${cleanup.toDelete} produits seraient supprimés si vous lancez le nettoyage`,
        });
    } catch (error) {
        console.error('[Cleanup Trends Stats] Error:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
