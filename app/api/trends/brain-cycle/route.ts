import { NextResponse } from 'next/server';
import { runBiangoryCycle } from '@/lib/intel-orchestrator';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 mins

export async function POST(req: Request) {
    try {
        const secret = req.headers.get('x-n8n-secret');
        if (secret !== process.env.N8N_WEBHOOK_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('[API] Starting Brain Cycle...');

        const url = new URL(req.url);
        const fastMode = url.searchParams.get('turbo') === 'true';

        await runBiangoryCycle(fastMode);
        return NextResponse.json({ success: true, message: 'Cycle complet terminé avec succès' });
    } catch (error: any) {
        console.error('[API] Brain Cycle Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
