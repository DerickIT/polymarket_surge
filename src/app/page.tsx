'use client';

import { usePolymarket } from '@/hooks/use-polymarket';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, TrendingUp, Users, DollarSign, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';

export default function Dashboard() {
  const { markets, marketsLoading, anomalies, anomaliesLoading } = usePolymarket();

  const totalVolume = markets?.reduce((sum, m) => sum + Number(m.volume_24h), 0) || 0;
  const activeAnomalies = anomalies?.length || 0;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="mr-4 hidden md:flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <Zap className="h-6 w-6 text-primary" />
              <span className="hidden font-bold sm:inline-block">PolySurge <span className="text-xs font-normal text-muted-foreground">PRO</span></span>
            </a>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <a className="transition-colors hover:text-foreground/80 text-foreground" href="/">Dashboard</a>
              <a className="transition-colors hover:text-foreground/80 text-foreground/60" href="#">Markets</a>
              <a className="transition-colors hover:text-foreground/80 text-foreground/60" href="#">Analysis</a>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <Badge variant="outline" className="ml-auto h-6 w-6 shrink-0 rounded-full border border-green-500/50 bg-green-500/10 text-green-500 animate-pulse p-0 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-screen-2xl p-4 md:p-6 space-y-6">
        {/* Key Metrics Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="24h Volume"
            value={`$${(totalVolume / 1000000).toFixed(2)}M`}
            icon={DollarSign}
            trend="+12.5%"
            loading={marketsLoading}
          />
          <MetricCard
            title="Active Markets"
            value={markets?.length || 0}
            icon={TrendingUp}
            loading={marketsLoading}
          />
          <MetricCard
            title="Anomalies (30m)"
            value={activeAnomalies}
            icon={Activity}
            trend={activeAnomalies > 5 ? "High Activity" : "Normal"}
            trendColor={activeAnomalies > 5 ? "text-red-500" : "text-muted-foreground"}
            loading={anomaliesLoading}
          />
          <MetricCard
            title="Smart Money"
            value="--"
            icon={Users}
            loading={false}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-12 lg:grid-cols-12 h-[calc(100vh-220px)]">
          {/* Left: Anomaly Feed (Terminal Style) */}
          <Card className="md:col-span-7 lg:col-span-8 flex flex-col border-border/50 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base font-semibold">Live Anomaly Feed</CardTitle>
                  <CardDescription className="text-xs">Real-time detection of volume spikes and whale movements</CardDescription>
                </div>
                <Badge variant="secondary" className="font-mono text-xs">LIVE</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full">
                <Table>
                  <TableHeader className="bg-muted/40 sticky top-0 z-10">
                    <TableRow className="hover:bg-transparent border-border/50">
                      <TableHead className="w-[100px]">Time</TableHead>
                      <TableHead className="w-[80px]">Score</TableHead>
                      <TableHead>Market</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Volume</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {anomaliesLoading ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        </TableRow>
                      ))
                    ) : anomalies?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          No anomalies detected in the current window.
                        </TableCell>
                      </TableRow>
                    ) : (
                      anomalies?.map((event, i) => (
                        <TableRow key={i} className="group hover:bg-muted/30 transition-colors border-border/40">
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {new Date(event.timestamp * 1000).toLocaleTimeString([], { hour12: false })}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`font-mono text-xs border-0 ${event.score >= 70
                                  ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                                  : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                                }`}
                            >
                              {event.score}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-sm max-w-[200px] truncate" title={event.market}>
                            {event.market}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {event.anomaly_types.map(type => (
                                <span key={type} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground uppercase tracking-wider">
                                  {type.replace('_', ' ')}
                                </span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            ${(event.total_volume / 1000).toFixed(1)}k
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Right: Top Markets (Compact List) */}
          <Card className="md:col-span-5 lg:col-span-4 flex flex-col border-border/50 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
              <CardTitle className="text-base font-semibold">Top Markets</CardTitle>
              <CardDescription className="text-xs">By 24h Volume</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="divide-y divide-border/40">
                  {marketsLoading ? (
                    [...Array(5)].map((_, i) => (
                      <div key={i} className="p-4 flex items-center justify-between">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-4 w-12" />
                      </div>
                    ))
                  ) : (
                    markets?.slice(0, 20).map((market) => (
                      <div key={market.condition_id} className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors group">
                        <div className="space-y-1 overflow-hidden pr-4">
                          <p className="text-sm font-medium truncate text-foreground/90 group-hover:text-primary transition-colors">
                            {market.question}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px] h-4 px-1 rounded-sm font-normal text-muted-foreground">
                              {market.type}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-mono font-medium">
                            ${(Number(market.volume_24h) / 1000).toFixed(1)}k
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend, trendColor, loading }: any) {
  return (
    <Card className="border-border/50 shadow-sm bg-card/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-mono tracking-tight">
          {loading ? <Skeleton className="h-8 w-24" /> : value}
        </div>
        {trend && (
          <p className={`text-xs ${trendColor || 'text-muted-foreground'} mt-1 flex items-center`}>
            {trend.includes('+') ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
