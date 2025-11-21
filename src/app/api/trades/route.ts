import { NextResponse } from 'next/server';

const DATA_API = 'https://data-api.polymarket.com/trades';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const market = searchParams.get('market');
    const limit = searchParams.get('limit') || '1000';

    if (!market) {
        return NextResponse.json({ error: 'Market ID required' }, { status: 400 });
    }

    try {
        const res = await fetch(`${DATA_API}?market=${market}&limit=${limit}`, {
            cache: 'no-store',
        });
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 });
    }
}
