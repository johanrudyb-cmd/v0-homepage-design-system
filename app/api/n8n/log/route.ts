/**
 * API Endpoint pour les logs n8n
 * 
 * POST /api/n8n/log
 * 
 * Reçoit les logs de workflows n8n et les stocke
 * pour monitoring et debugging.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    // Vérifier l'autorisation
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        { error: 'CRON_SECRET not configured' },
        { status: 500 }
      );
    }

    const providedSecret = authHeader?.replace('Bearer ', '') || '';
    if (providedSecret !== cronSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { workflow, status, data } = body;

    if (!workflow || !status) {
      return NextResponse.json(
        { error: 'workflow et status requis' },
        { status: 400 }
      );
    }

    // Logger dans la console (Vercel logs)
    console.log(`[n8n Log] Workflow: ${workflow} | Status: ${status}`, 
      data ? JSON.parse(typeof data === 'string' ? data : JSON.stringify(data)) : {}
    );

    return NextResponse.json({
      success: true,
      message: 'Log enregistré',
      timestamp: new Date().toISOString(),
      workflow,
      status,
    });
  } catch (error: any) {
    console.error('[n8n Log] Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement du log' },
      { status: 500 }
    );
  }
}
