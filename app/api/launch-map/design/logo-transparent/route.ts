/**
 * Rend le fond blanc du logo transparent (PNG avec alpha).
 * POST body: JSON { imageUrl: string } ou FormData avec champ "file".
 * Returns: { imageDataUrl: "data:image/png;base64,..." }
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { makeWhiteBackgroundTransparent } from '@/lib/image-remove-background';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    let inputBuffer: Buffer;

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const imageUrl = body?.imageUrl as string | undefined;
      const imageBase64 = body?.imageBase64 as string | undefined;
      if (imageBase64 && typeof imageBase64 === 'string') {
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        inputBuffer = Buffer.from(base64Data, 'base64');
      } else if (imageUrl && typeof imageUrl === 'string') {
        let urlToFetch = imageUrl;
        if (imageUrl.startsWith('/')) {
          const origin = request.headers.get('host') || request.headers.get('x-forwarded-host');
          const proto = request.headers.get('x-forwarded-proto') || 'https';
          urlToFetch = `${proto === 'https' ? 'https' : 'http'}://${origin}${imageUrl}`;
        }
        const headers: HeadersInit = { 'Accept': 'image/*' };
        const cookie = request.headers.get('cookie');
        if (cookie) headers['Cookie'] = cookie;
        const res = await fetch(urlToFetch, { next: { revalidate: 0 }, headers });
        if (!res.ok) {
          return NextResponse.json(
            { error: 'Impossible de récupérer l\'image' },
            { status: 400 }
          );
        }
        inputBuffer = Buffer.from(await res.arrayBuffer());
      } else {
        return NextResponse.json(
          { error: 'imageUrl ou imageBase64 requis' },
          { status: 400 }
        );
      }
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      if (!file || !(file instanceof File)) {
        return NextResponse.json(
          { error: 'Fichier requis (champ "file")' },
          { status: 400 }
        );
      }
      inputBuffer = Buffer.from(await file.arrayBuffer());
    } else {
      return NextResponse.json(
        { error: 'Content-Type: application/json (imageUrl) ou multipart/form-data (file)' },
        { status: 400 }
      );
    }

    const pngBuffer = await makeWhiteBackgroundTransparent(inputBuffer);
    const base64 = pngBuffer.toString('base64');
    const imageDataUrl = `data:image/png;base64,${base64}`;

    return NextResponse.json({ imageDataUrl });
  } catch (error) {
    console.error('[launch-map/design/logo-transparent]', error);
    const message = error instanceof Error ? error.message : 'Erreur traitement image';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
