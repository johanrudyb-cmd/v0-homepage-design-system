import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { getMockupCategories } from '@/lib/mockup-pack-catalog';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const categories = getMockupCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('[launch-map/mockup/categories]', error);
    return NextResponse.json({ error: 'Erreur lors du chargement des catégories' }, { status: 500 });
  }
}
