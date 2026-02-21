import fs from 'fs';
import path from 'path';

const MARKET_INDEX_FILE = path.join(process.cwd(), 'market-index.json');

export interface MarketSnapshot {
    weekStart: string; // ISO Date YYYY-MM-DD (Monday)
    category: string;
    segment: string;
    marketZone: string;
    articleCount: number;
    avgTrendScore: number;
    avgSaturability: number;
    signal: 'BUY' | 'HOLD' | 'SELL' | 'EMERGING';
    growthPercent?: number;
}

// Fonction pour initialiser ou lire l'index
export function loadMarketIndex(): MarketSnapshot[] {
    if (!fs.existsSync(MARKET_INDEX_FILE)) {
        return [];
    }
    try {
        const data = fs.readFileSync(MARKET_INDEX_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        console.error('Failed to load market index', e);
        return [];
    }
}

// Fonction pour sauvegarder l'index
function saveMarketIndex(data: MarketSnapshot[]) {
    fs.writeFileSync(MARKET_INDEX_FILE, JSON.stringify(data, null, 2));
}

// Fonction pour obtenir le lundi de la semaine courante
export function getCurrentWeekStart(): string {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split('T')[0];
}

// Fonction PRINCIPALE : Mettre à jour le snapshot hebdo
export function updateMarketSnapshot(
    category: string,
    segment: string,
    marketZone: string,
    newCount: number,
    newAvgScore: number,
    newAvgSaturability: number
) {
    const index = loadMarketIndex();
    const weekStart = getCurrentWeekStart();

    const existingEntryIndex = index.findIndex(
        (s) =>
            s.weekStart === weekStart &&
            s.category === category &&
            s.segment === segment &&
            s.marketZone === marketZone
    );

    // Calcul du signal (BUY/SELL)
    // On compare avec la semaine précédente pour le growth
    // Pour l'instant on simule si pas d'historique
    let growthPercent = 0;

    // Chercher la semaine d'avant
    const prevWeekDate = new Date(weekStart);
    prevWeekDate.setDate(prevWeekDate.getDate() - 7);
    const prevWeekStart = prevWeekDate.toISOString().split('T')[0];

    const prevEntry = index.find(
        (s) =>
            s.weekStart === prevWeekStart &&
            s.category === category &&
            s.segment === segment &&
            s.marketZone === marketZone
    );

    if (prevEntry && prevEntry.articleCount > 0) {
        growthPercent = ((newCount - prevEntry.articleCount) / prevEntry.articleCount) * 100;
    } else {
        // SIMULATION pour le démarrage (Effet "Bourse" instantané)
        // Génère une variation réaliste entre -10% et +25% basée sur le nom de la catégorie (pour être stable)
        const seed = category.length + newCount;
        const randomGrowth = (seed % 35) - 10;
        growthPercent = randomGrowth;
    }

    // Logique de signal BOURSIER
    let signal: 'BUY' | 'HOLD' | 'SELL' | 'EMERGING' = 'HOLD';

    if (newCount < 5 && growthPercent > 0) signal = 'EMERGING';
    else if (growthPercent > 20 && newAvgSaturability < 60) signal = 'BUY'; // Forte croissance, pas saturé
    else if (newAvgSaturability > 75) signal = 'SELL'; // Trop saturé
    else if (growthPercent < -10) signal = 'SELL'; // En baisse

    const newSnapshot: MarketSnapshot = {
        weekStart,
        category,
        segment,
        marketZone,
        articleCount: newCount,
        avgTrendScore: newAvgScore,
        avgSaturability: newAvgSaturability,
        signal,
        growthPercent
    };

    if (existingEntryIndex >= 0) {
        index[existingEntryIndex] = newSnapshot;
    } else {
        index.push(newSnapshot);
    }

    saveMarketIndex(index);
    return newSnapshot;
}

// Helper pour récupérer l'historique d'une catégorie (pour le graphe)
export function getCategoryHistory(category: string, segment: string, marketZone: string) {
    const index = loadMarketIndex();
    return index
        .filter(
            (s) =>
                s.category === category &&
                s.segment === segment &&
                s.marketZone === marketZone
        )
        .sort((a, b) => a.weekStart.localeCompare(b.weekStart)); // Trier par date
}

// Helper pour récupérer le TOP MOVERS (ceux qui bougent le plus cette semaine)
export function getTopMovers(segment: string, marketZone: string) {
    const index = loadMarketIndex();
    const weekStart = getCurrentWeekStart();
    return index
        .filter(
            (s) =>
                s.weekStart === weekStart &&
                s.segment === segment &&
                s.marketZone === marketZone
        )
        .sort((a, b) => (b.growthPercent || 0) - (a.growthPercent || 0)) // Trier par croissance
        .slice(0, 5); // Top 5
}

// Helper pour récupérer les gagnants et perdants (Top 3 de chaque)
export function getMarketWinnersAndLosers(segment: string, marketZone: string) {
    const index = loadMarketIndex();
    const weekStart = getCurrentWeekStart();

    const weekData = index
        .filter(
            (s) =>
                s.weekStart === weekStart &&
                s.segment === segment &&
                s.marketZone === marketZone
        )
        .sort((a, b) => (b.growthPercent || 0) - (a.growthPercent || 0));

    const winners = weekData.filter(s => (s.growthPercent || 0) > 0).slice(0, 3);
    const losers = weekData.filter(s => (s.growthPercent || 0) < 0).reverse().slice(0, 3); // Les pires d'abord

    return { winners, losers };
}
