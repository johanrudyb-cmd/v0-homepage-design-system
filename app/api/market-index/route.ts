import { NextResponse } from 'next/server';
import { getTopMovers, getMarketWinnersAndLosers, getCurrentWeekStart } from '@/lib/market-stock-exchange';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const segment = searchParams.get('segment') || 'femme';
    const marketZone = searchParams.get('marketZone') || 'EU';

    const topMovers = getTopMovers(segment, marketZone);
    const { winners, losers } = getMarketWinnersAndLosers(segment, marketZone);

    return NextResponse.json({
        updatedAt: new Date(),
        weekStart: getCurrentWeekStart(),
        topMovers,
        winners,
        losers
    });
}
