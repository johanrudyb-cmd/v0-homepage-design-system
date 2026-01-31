/**
 * Test de connexion à l’API GPT (OpenAI)
 * GET /api/health/gpt
 * Vérifie que CHATGPT_API_KEY est configurée et que l’API répond.
 */

import { NextResponse } from 'next/server';
import { testGptConnection } from '@/lib/api/chatgpt';

export const runtime = 'nodejs';

export async function GET() {
  const result = await testGptConnection();
  if (result.ok) {
    return NextResponse.json({ ok: true, message: 'API GPT opérationnelle' });
  }
  return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
}
