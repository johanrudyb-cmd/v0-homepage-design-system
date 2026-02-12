import { NextResponse } from 'next/server';
import { fetchLogoForBrand } from '@/lib/brand-logo-fetch';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    try {
        const logoUrl = await fetchLogoForBrand(name);
        return NextResponse.json({ logoUrl });
    } catch (error) {
        console.error('Error fetching logo:', error);
        return NextResponse.json({ error: 'Failed to fetch logo' }, { status: 500 });
    }
}
