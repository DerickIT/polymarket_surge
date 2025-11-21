'use client';

import { usePolymarket } from '@/hooks/use-polymarket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, TrendingUp, Users, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const { markets, marketsLoading, anomalies, anomaliesLoading } = usePolymarket();

  const totalVolume = markets?.reduce((sum, m) => sum + Number(m.volume_24h), 0) || 0;
  const activeAnomalies = anomalies?.length || 0;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">PolySurge</h1>
          <p className="text-muted-foreground">Real-time Polymarket Anomaly Detector</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="px-4 py-1">Live</Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume (24h)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {marketsLoading ? <Skeleton className="h-8 w-24" /> : `$${(totalVolume / 1000000).toFixed(1)}M`}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Markets</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {marketsLoading ? <Skeleton className="h-8 w-12" /> : markets?.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anomalies (30m)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {anomaliesLoading ? <Skeleton className="h-8 w-12" /> : activeAnomalies}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Wallets</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Anomaly Feed */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Live Anomalies</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              {anomaliesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
                </div>
              ) : (
                <div className="space-y-4">
                  {anomalies?.map((event, i) => (
                    <div key={i} className="flex items-start space-x-4 rounded-md border p-4 hover:bg-accent/50 transition-colors">
                      <div className={`mt-1 rounded-full p-2 ${event.score >= 70 ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        <Activity className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {event.market}
                        </p>
                        <div className="flex items-center gap-2 pt-2">
                          {event.anomaly_types.map(type => (
                            <Badge key={type} variant="secondary" className="text-xs">
                              {type.replace('_', ' ')}
                            </Badge>
                          ))}
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(event.timestamp * 1000).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground pt-1">
                          Vol: ${event.total_volume.toFixed(0)} | Wallets: {event.wallet_count} | Score: {event.score}
                        </div>
                      </div>
                    </div>
                  ))}
                  {anomalies?.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No anomalies detected in the last window.
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Market List */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Markets</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              {marketsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : (
                <div className="space-y-4">
                  {markets?.slice(0, 20).map((market) => (
                    <div key={market.condition_id} className="flex items-center justify-between p-2 hover:bg-accent/50 rounded-md transition-colors">
                      <div className="space-y-1 overflow-hidden">
                        <p className="text-sm font-medium truncate max-w-[250px]">
                          {market.question}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {market.type}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">
                          ${(Number(market.volume_24h) / 1000).toFixed(1)}k
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
