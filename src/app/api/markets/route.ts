import { NextResponse } from 'next/server';

const GAMMA_API = 'https://gamma-api.polymarket.com/markets';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '100';
    const active = searchParams.get('active') || 'true';
    const closed = searchParams.get('closed') || 'false';
    const order = searchParams.get('order') || 'volume24hr';
    const ascending = searchParams.get('ascending') || 'false';

    try {
        const res = await fetch(
            `${GAMMA_API}?limit=${limit}&active=${active}&closed=${closed}&order=${order}&ascending=${ascending}`,
            { next: { revalidate: 60 } }
        );
        const data = await res.json();

        // Transform data to match Market interface
        const markets = data
            .filter((m: any) => m.conditionId) // Filter out invalid markets
            .map((m: any) => {
                const slug = (m.slug || '').toLowerCase();
                let type = 'general';
                if (['15m', '30m', '1h', 'hour', 'minute'].some(k => slug.includes(k))) {
                    type = 'short_term';
                } else if (['nba', 'nfl', 'mlb', 'nhl', 'soccer', 'match', 'game', 'vs', 'win-on'].some(k => slug.includes(k))) {
                    type = 'sports';
                }

                return {
                    condition_id: m.conditionId,
                    question: m.question,
                    slug: m.slug,
                    type,
                    volume_24h: Number(m.volume24hrClob || m.volume24hr || 0),
                    end_date_iso: m.endDate
                };
            });

        return NextResponse.json(markets);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch markets' }, { status: 500 });
    }
}
