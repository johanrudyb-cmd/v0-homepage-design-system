import { NextResponse } from 'next/server';

// Forcer Node.js runtime
export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  });
}
