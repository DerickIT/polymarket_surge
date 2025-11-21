import { Market, Trade, AnomalyEvent } from './types';

export const API_CONFIG = {
    GAMMA: 'https://gamma-api.polymarket.com',
    DATA: 'https://data-api.polymarket.com',
    CLOB: 'https://clob.polymarket.com',
};
/**
 * Fetch market details from Gamma API
 * Uses condition_ids to find the specific market
 */
export async function getMarket(conditionId: string): Promise<Market | null> {
    try {
        const res = await fetch(`${API_CONFIG.GAMMA}/markets?condition_ids=${conditionId}&active=true`);
        if (!res.ok) throw new Error('Market not found');

        const data = await res.json();
        const m = Array.isArray(data) ? data[0] : data;

        if (!m) return null;

        // Parse CLOB Token IDs if available
        let clobTokenIds: string[] = [];
        try {
            if (Array.isArray(m.clobTokenIds)) {
                clobTokenIds = m.clobTokenIds;
            } else if (typeof m.clobTokenIds === 'string') {
                clobTokenIds = JSON.parse(m.clobTokenIds);
            }
        } catch (e) {
            console.warn('Failed to parse clobTokenIds', e);
        }

        return {
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
            image: m.image,
            clobTokenIds: clobTokenIds
        };
    } catch (error) {
        console.error('Error fetching market:', error);
        return null;
    }
}

/**
 * Fetch recent trades from Data API
 */
export async function getTrades(conditionId: string, limit: number = 100): Promise<Trade[]> {
    try {
        const res = await fetch(`${API_CONFIG.DATA}/trades?market=${conditionId}&limit=${limit}`);
        if (!res.ok) return [];

        const data = await res.json();
        return data.map((t: any) => ({
            timestamp: t.timestamp,
            price: Number(t.price),
            size: Number(t.size),
            side: t.side,
            market: conditionId // Use conditionId as market identifier
        }));
    } catch (error) {
        console.error('Error fetching trades:', error);
        return [];
    }
}

/**
 * Fetch Orderbook from CLOB API
 * Requires clobTokenId (usually the first one for Yes/No markets)
 */
export async function getOrderBook(tokenId: string) {
    try {
        const res = await fetch(`${API_CONFIG.CLOB}/book?token_id=${tokenId}`);
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error('Error fetching orderbook:', error);
        return null;
    }
}
