export interface Market {
    condition_id: string;
    question: string;
    slug: string;
    type: 'general' | 'short_term' | 'sports';
    volume_24h: number;
    end_date_iso?: string;
    description?: string;
    outcomes?: string[];
    outcomePrices?: string[];
    liquidity?: string;
    image?: string;
    clobTokenIds?: string[];
}

export interface Trade {
    timestamp: number;
    price: number;
    size: number;
    side: 'BUY' | 'SELL';
    proxyWallet?: string;
    asset?: string;
    market?: string;
}

export interface AnomalyEvent {
    timestamp: number;
    datetime: string;
    market: string;
    condition_id: string;
    anomaly_types: string[];
    wallet_count: number;
    total_volume: number;
    net_volume: number;
    volume_ratio: number;
    trade_size: number;
    price_range_pct: number;
    is_buy: boolean;
    trade_count: number;
    score: number;
}
