import { Trade, AnomalyEvent } from './types';

export function detectAnomalies(
    trades: Trade[],
    marketName: string,
    conditionId: string,
    windowMin: number = 5
): AnomalyEvent[] {
    if (trades.length < 10) return [];

    // Sort by timestamp
    const sortedTrades = [...trades].sort((a, b) => a.timestamp - b.timestamp);
    const windowSec = windowMin * 60;
    const events: AnomalyEvent[] = [];

    // Pre-calculate baselines (medians)
    const windowStats: { wallets: number; volume: number }[] = [];

    for (let i = 0; i < sortedTrades.length; i++) {
        const current = sortedTrades[i];
        const window = sortedTrades.slice(0, i + 1).filter(
            t => t.timestamp >= current.timestamp - windowSec
        );

        if (window.length >= 3) {
            const wallets = new Set(window.map(t => t.proxyWallet)).size;
            const volume = window.reduce((sum, t) => sum + t.size * t.price, 0);
            windowStats.push({ wallets, volume });
        }
    }

    if (windowStats.length === 0) return [];

    // Calculate medians
    const medianWallets = median(windowStats.map(s => s.wallets));
    const medianVolume = median(windowStats.map(s => s.volume));

    const allTradeSizes = sortedTrades.map(t => t.size * t.price);
    const medianTradeSize = median(allTradeSizes);

    // Detect anomalies
    for (let i = 0; i < sortedTrades.length; i++) {
        const current = sortedTrades[i];
        const window = sortedTrades.slice(0, i + 1).filter(
            t => t.timestamp >= current.timestamp - windowSec
        );

        if (window.length < 3) continue;

        // Calculate window metrics
        const wallets = new Set(window.map(t => t.proxyWallet)).size;

        const buyVol = window
            .filter(t => t.side === 'BUY')
            .reduce((sum, t) => sum + t.size * t.price, 0);
        const sellVol = window
            .filter(t => t.side === 'SELL')
            .reduce((sum, t) => sum + t.size * t.price, 0);

        const totalVol = buyVol + sellVol;
        const netVol = buyVol - sellVol;

        const prices = window.map(t => t.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        const priceRange = maxPrice - minPrice;

        const currentSize = current.size * current.price;

        const anomalies: string[] = [];

        // 1. Wallet Surge
        if (wallets >= Math.max(5, medianWallets * 2)) {
            anomalies.push('wallet_surge');
        }

        // 2. Volume Spike
        if (medianVolume > 0 && totalVol > medianVolume * 5) {
            anomalies.push('volume_spike');
        }

        // 3. Whale Trade
        if (medianTradeSize > 0 && currentSize > medianTradeSize * 20) {
            anomalies.push('whale_trade');
        }

        // 4. Imbalance
        if (totalVol > 0) {
            const imbalance = Math.abs(netVol) / totalVol;
            if (imbalance > 0.8) {
                anomalies.push('imbalance');
            }
        }

        // 5. Price Move
        if (avgPrice > 0 && priceRange / avgPrice > 0.1) {
            anomalies.push('price_move');
        }

        if (anomalies.length > 0) {
            // Calculate Score
            let score = 0;
            // Base weights
            if (anomalies.includes('whale_trade')) score += 40;
            if (anomalies.includes('volume_spike')) score += 30;
            if (anomalies.includes('price_move')) score += 20;
            if (anomalies.includes('imbalance')) score += 15;
            if (anomalies.includes('wallet_surge')) score += 10;

            // Multiplier bonus
            if (anomalies.length > 1) score += 10;
            if (anomalies.length > 2) score += 10;

            events.push({
                timestamp: current.timestamp,
                datetime: new Date(current.timestamp * 1000).toISOString(),
                market: marketName,
                condition_id: conditionId,
                anomaly_types: anomalies,
                wallet_count: wallets,
                total_volume: totalVol,
                net_volume: netVol,
                volume_ratio: medianVolume > 0 ? totalVol / medianVolume : 0,
                trade_size: currentSize,
                price_range_pct: avgPrice > 0 ? (priceRange / avgPrice) * 100 : 0,
                is_buy: netVol > 0,
                trade_count: window.length,
                score: Math.min(100, score)
            });
        }
    }

    // Deduplicate: keep only one event per timestamp (merge types)
    const deduped = new Map<number, AnomalyEvent>();
    for (const e of events) {
        if (deduped.has(e.timestamp)) {
            const existing = deduped.get(e.timestamp)!;
            existing.anomaly_types = Array.from(new Set([...existing.anomaly_types, ...e.anomaly_types]));
            existing.score = Math.max(existing.score, e.score);
        } else {
            deduped.set(e.timestamp, e);
        }
    }

    return Array.from(deduped.values()).sort((a, b) => b.timestamp - a.timestamp);
}

function median(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
