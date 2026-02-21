import { NextResponse } from 'next/server';
import { getCategoryHistory, loadMarketIndex } from '@/lib/market-stock-exchange';

// Helper pour générer une fausse historique réaliste (si pas assez de données réelles)
// C'est juste pour la DEMO "Wow Effect"
function generateMockHistory(currentScore: number, weeksBack = 12) {
    const history = [];
    let score = currentScore;

    // On remonte le temps
    const now = new Date();
    // On se cale sur le lundi actuel
    const currentDay = now.getDay();
    const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));

    for (let i = 0; i < weeksBack; i++) {
        const date = new Date(monday);
        date.setDate(date.getDate() - (i * 7));
        const dateStr = date.toISOString().split('T')[0];

        // Variation aléatoire légère (-5 à +5 points par semaine) + Tendance globale
        const variation = (Math.random() * 10) - 5;
        score = Math.max(0, Math.min(100, score - variation)); // On recule, donc on inverse la logique de variation future

        history.unshift({
            weekStart: dateStr,
            avgTrendScore: Math.round(score),
            avgSaturability: Math.round(Math.random() * 100), // Random pour l'instant
        });
    }

    // Ajouter le point actuel à la fin (le vrai)
    // history.push({ weekStart: monday.toISOString().split('T')[0], avgTrendScore: currentScore }); // Déjà inclus dans la boucle si i=0 fait le job ? Non.

    return history;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const segment = searchParams.get('segment');
    const marketZone = searchParams.get('marketZone') || 'EU';

    if (!category || !segment) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // 1. Récupérer l'historique RÉEL (depuis JSON)
    const realHistory = getCategoryHistory(category, segment, marketZone);

    // 2. Si l'historique réel est trop court (< 5 points), on le complète avec du MOCK
    // pour avoir un beau graphe boursier
    let finalHistory = [];

    if (realHistory.length < 5) {
        // On prend le dernier score connu (ou on invente un score moyen de 75)
        const currentScore = realHistory.length > 0
            ? realHistory[realHistory.length - 1].avgTrendScore
            : 75;

        finalHistory = generateMockHistory(currentScore, 12); // 12 semaines d'historique simulé

        // On remplace la dernière entrée simulée par la vraie si elle existe
        if (realHistory.length > 0) {
            const lastReal = realHistory[realHistory.length - 1];
            // Trouver l'entrée simulée correspondante à la date ? Non, on concatène intelligemment.
            // Simplification : On retourne le MockHistory ajusté pour finir exactement sur la vraie valeur.
            const lastSimulated = finalHistory[finalHistory.length - 1];
            lastSimulated.avgTrendScore = currentScore;
        }
    } else {
        finalHistory = realHistory;
    }

    return NextResponse.json({ history: finalHistory });
}
