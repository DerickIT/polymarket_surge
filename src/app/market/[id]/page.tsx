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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header Section */}
                        <div className="flex gap-4 items-start">
                            {market?.image && (
                                <div className="shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={market.image}
                                        alt={market.question}
                                        className="w-16 h-16 md:w-24 md:h-24 rounded-full object-cover border border-border/50 shadow-sm"
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                <h1 className="text-xl md:text-3xl font-bold tracking-tight break-words leading-tight">
                                    {market?.question}
                                </h1>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline" className="font-mono text-xs bg-muted/50">
                                        {market?.type}
                                    </Badge>
                                    {market?.end_date_iso && (
                                        <Badge variant="secondary" className="text-xs font-normal">
                                            <Calendar className="mr-1 h-3 w-3" />
                                            Ends {new Date(market.end_date_iso).toLocaleDateString()}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Chart */}
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Price History (Last 500 Trades)</CardTitle>
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

                        {/* Description */}
                        {market?.description && (
                            <Card className="border-border/50 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-base font-semibold">Market Rules</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                                        {market.description}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-6">
                        {/* Market Stats */}
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Market Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground flex items-center">
                                        <DollarSign className="mr-2 h-4 w-4" /> 24h Volume
                                    </span>
                                    <span className="font-mono font-bold text-lg">
                                        ${(market?.volume_24h || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground flex items-center">
                                        <Activity className="mr-2 h-4 w-4" /> Liquidity
                                    </span>
                                    <span className="font-mono font-bold text-lg">
                                        ${(Number(market?.liquidity) || 0).toLocaleString()}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Outcomes */}
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Outcomes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {market?.outcomes && market?.outcomePrices ? (
                                        JSON.parse(market.outcomes).map((outcome: string, i: number) => (
                                            <div key={outcome} className="flex justify-between items-center p-3 rounded-lg bg-muted/30 border border-border/30">
                                                <span className="font-medium text-sm">{outcome}</span>
                                                <span className="font-mono font-bold text-primary">
                                                    {(Number(JSON.parse(market.outcomePrices)[i]) * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm text-muted-foreground">No outcome data</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Token IDs */}
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Contract Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">Condition ID</div>
                                    <div className="font-mono text-[10px] break-all bg-muted/50 p-2 rounded border border-border/30">
                                        {market?.condition_id}
                                    </div>
                                </div>
                                {market?.clobTokenIds && market.clobTokenIds.length > 0 && (
                                    <div>
                                        <div className="text-xs text-muted-foreground mb-1 flex justify-between">
                                            <span>Token IDs</span>
                                            <Badge variant="outline" className="text-[10px] h-4 px-1">Polygon</Badge>
                                        </div>
                                        <div className="space-y-2">
                                            {market.clobTokenIds.map((tokenId: string, i: number) => (
                                                <div key={tokenId} className="font-mono text-[10px] break-all bg-muted/50 p-2 rounded border border-border/30 relative group">
                                                    <span className="absolute top-1 right-1 text-[9px] text-muted-foreground opacity-50">
                                                        {market.outcomes ? JSON.parse(market.outcomes)[i] : `Outcome ${i + 1}`}
                                                    </span>
                                                    {tokenId}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
