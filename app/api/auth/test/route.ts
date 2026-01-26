import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ 
    message: 'Route API fonctionne',
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({ 
      message: 'POST fonctionne',
      received: body,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Erreur lors du traitement',
      timestamp: new Date().toISOString(),
    }, { status: 400 });
  }
}
