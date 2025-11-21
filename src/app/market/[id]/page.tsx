'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, DollarSign, Activity, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

async function fetchMarket(id: string) {
    const res = await fetch(`/api/markets/${id}`);
    if (!res.ok) throw new Error('Failed to fetch market');
    return res.json();
}

async function fetchTrades(id: string) {
    const res = await fetch(`/api/trades?market=${id}&limit=500`);
    if (!res.ok) throw new Error('Failed to fetch trades');
    return res.json();
}

export default function MarketPage() {
    const params = useParams();
    const id = params.id as string;

    const { data: market, isLoading: marketLoading } = useQuery({
        queryKey: ['market', id],
        queryFn: () => fetchMarket(id),
    });

    const { data: trades, isLoading: tradesLoading } = useQuery({
        queryKey: ['trades', id],
        queryFn: () => fetchTrades(id),
        refetchInterval: 10000,
    });

    // Process trades for chart
    const chartData = trades?.slice().reverse().map((t: any) => ({
        time: new Date(t.timestamp * 1000).toLocaleTimeString(),
        price: t.price,
        size: t.size
    })) || [];

    if (marketLoading) {
        return (
            <div className="p-8 space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 font-sans">
            <div className="max-w-screen-xl mx-auto space-y-6">
                <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Link>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Main Content */}
                    <div className="flex-1 space-y-6 min-w-0">
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-2 break-words">{market?.question}</h1>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className="font-mono text-xs">{market?.condition_id}</Badge>
                                {market?.end_date_iso && (
                                    <span className="text-xs text-muted-foreground flex items-center">
                                        <Calendar className="mr-1 h-3 w-3" />
                                        Ends {new Date(market.end_date_iso).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Price History (Last 500 Trades)</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px] md:h-[400px]">
                                {tradesLoading ? (
                                    <Skeleton className="h-full w-full" />
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData}>
                                            <XAxis dataKey="time" hide />
                                            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} stroke="#888888" />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5' }}
                                                itemStyle={{ color: '#f4f4f5' }}
                                            />
                                            <Line type="stepAfter" dataKey="price" stroke="#22c55e" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Stats */}
                    <div className="w-full lg:w-80 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Market Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground flex items-center">
                                        <DollarSign className="mr-2 h-4 w-4" /> 24h Volume
                                    </span>
                                    <span className="font-mono font-bold">
                                        ${(market?.volume_24h || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground flex items-center">
                                        <Activity className="mr-2 h-4 w-4" /> Liquidity
                                    </span>
                                    <span className="font-mono font-bold">
                                        ${(Number(market?.liquidity) || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground flex items-center">
                                        <BarChart3 className="mr-2 h-4 w-4" /> Outcomes
                                    </span>
                                    <span className="font-mono font-bold">
                                        {market?.outcomes ? JSON.parse(market.outcomes).length : '-'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Outcome Prices</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {market?.outcomes && market?.outcomePrices ? (
                                        JSON.parse(market.outcomes).map((outcome: string, i: number) => (
                                            <div key={outcome} className="flex justify-between items-center p-2 rounded-md bg-muted/50">
                                                <span className="text-sm font-medium truncate max-w-[150px]">{outcome}</span>
                                                <span className="font-mono font-bold text-primary">
                                                    {(JSON.parse(market.outcomePrices)[i] * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm text-muted-foreground">No outcome data</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
