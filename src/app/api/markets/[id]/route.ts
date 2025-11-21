import { NextResponse } from 'next/server';

const GAMMA_API = 'https://gamma-api.polymarket.com/markets';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const res = await fetch(`${GAMMA_API}/${id}`, { next: { revalidate: 60 } });

        if (!res.ok) {
            return NextResponse.json({ error: 'Market not found' }, { status: 404 });
        }

        const data = await res.json();

        // Transform data
        const m = data;
        const market = {
            condition_id: m.conditionId,
            question: m.question,
            slug: m.slug,
            type: 'general',
            volume_24h: Number(m.volume24hrClob || m.volume24hr || 0),
            end_date_iso: m.endDate,
            description: m.description,
            outcomes: m.outcomes,
            outcomePrices: m.outcomePrices,
            liquidity: m.liquidity,
            image: m.image
        };

        return NextResponse.json(market);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch market' }, { status: 500 });
    }
}
