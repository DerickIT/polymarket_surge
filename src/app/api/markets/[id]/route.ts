import { NextResponse } from 'next/server';
import { getMarket } from '@/lib/polymarket-api';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const market = await getMarket(id);

        if (!market) {
            return NextResponse.json({ error: 'Market not found' }, { status: 404 });
        }

        return NextResponse.json(market);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch market' }, { status: 500 });
    }
}
