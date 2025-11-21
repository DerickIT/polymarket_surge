import { useQuery } from '@tanstack/react-query';
import { Market, Trade, AnomalyEvent } from '@/lib/types';
import { detectAnomalies } from '@/lib/analysis';

async function fetchMarkets() {
    const res = await fetch('/api/markets?limit=50&active=true&order=volume24hr');
    if (!res.ok) throw new Error('Failed to fetch markets');
    return res.json() as Promise<Market[]>;
}

async function fetchTrades(marketId: string) {
    const res = await fetch(`/api/trades?market=${marketId}&limit=1000`);
    if (!res.ok) throw new Error('Failed to fetch trades');
    return res.json() as Promise<Trade[]>;
}

export function usePolymarket() {
    const { data: markets, isLoading: marketsLoading } = useQuery({
        queryKey: ['markets'],
        queryFn: fetchMarkets,
    });

    // Limit to top 20 markets for client-side performance
    const topMarkets = markets?.slice(0, 20) || [];

    const { data: anomalies, isLoading: anomaliesLoading } = useQuery({
        queryKey: ['anomalies', topMarkets.map(m => m.condition_id).join(',')],
        queryFn: async () => {
            if (topMarkets.length === 0) return [];

            const allEvents: AnomalyEvent[] = [];

            await Promise.all(topMarkets.map(async (market) => {
                try {
                    const trades = await fetchTrades(market.condition_id);
                    const events = detectAnomalies(trades, market.question, market.condition_id);
                    allEvents.push(...events);
                } catch (e) {
                    console.error(`Failed to analyze ${market.question}`, e);
                }
            }));

            return allEvents.sort((a, b) => b.timestamp - a.timestamp);
        },
        enabled: topMarkets.length > 0,
        refetchInterval: 30000,
    });

    return {
        markets,
        marketsLoading,
        anomalies,
        anomaliesLoading,
    };
}
