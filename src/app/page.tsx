'use client';

import { usePolymarket } from '@/hooks/use-polymarket';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Activity, TrendingUp, Users, DollarSign, ArrowUpRight, ArrowDownRight, Zap, Search, Menu } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function Dashboard() {
  const { markets, marketsLoading, anomalies, anomaliesLoading } = usePolymarket();
  const [searchQuery, setSearchQuery] = useState('');

  const totalVolume = markets?.reduce((sum, m) => sum + Number(m.volume_24h), 0) || 0;
  const activeAnomalies = anomalies?.length || 0;

  const filteredMarkets = markets?.filter(m =>
    m.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.type.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="w-full flex h-14 items-center px-4">
          <div className="mr-4 flex items-center">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <Zap className="h-6 w-6 text-primary" />
              <span className="font-bold inline-block">PolySurge <span className="text-xs font-normal text-muted-foreground">PRO</span></span>
            </a>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <a className="transition-colors hover:text-foreground/80 text-foreground" href="/">Dashboard</a>
              <a className="transition-colors hover:text-foreground/80 text-foreground/60" href="#">Markets</a>
              <a className="transition-colors hover:text-foreground/80 text-foreground/60" href="#">Analysis</a>
            </nav>
          </div>

          {/* Mobile Search & Menu */}
          <div className="flex flex-1 items-center justify-end space-x-2">
            <div className="w-full max-w-[200px] md:max-w-[300px] relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search markets..."
                className="pl-8 h-9 bg-muted/50 border-none focus-visible:ring-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[240px] sm:w-[300px]">
                  <nav className="flex flex-col gap-4 mt-4">
                    <a className="text-sm font-medium hover:text-primary" href="/">Dashboard</a>
                    <a className="text-sm font-medium hover:text-primary" href="#">Markets</a>
                    <a className="text-sm font-medium hover:text-primary" href="#">Analysis</a>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>

            <div className="hidden md:flex">
              <Badge variant="outline" className="ml-2 h-6 w-6 shrink-0 rounded-full border border-green-500/50 bg-green-500/10 text-green-500 animate-pulse p-0 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full p-4 md:p-6 space-y-6">
        {/* Key Metrics Row */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
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

        <div className="grid gap-6 grid-cols-1 md:grid-cols-12 h-auto lg:h-[calc(100vh-220px)]">
          {/* Left: Anomaly Feed (Terminal Style) */}
          <Card className="md:col-span-7 lg:col-span-8 xl:col-span-9 flex flex-col border-border/50 shadow-sm h-[500px] lg:h-auto">
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
                <div className="min-w-[600px] lg:min-w-0"> {/* Force scroll on mobile if needed */}
                  <Table>
                    <TableHeader className="bg-muted/40 sticky top-0 z-10">
                      <TableRow className="hover:bg-transparent border-border/50">
                        <TableHead className="w-[100px]">Time</TableHead>
                        <TableHead className="w-[80px]">Score</TableHead>
                        <TableHead className="min-w-[200px]">Market</TableHead>
                        <TableHead className="hidden sm:table-cell">Type</TableHead>
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
                            <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
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
                            <TableCell className="font-medium text-sm max-w-[200px] sm:max-w-[400px] truncate" title={event.market}>
                              <Link href={`/market/${event.condition_id}`} className="hover:underline hover:text-primary transition-colors">
                                {event.market}
                              </Link>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
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
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Right: Top Markets (Compact List) */}
          <Card className="md:col-span-5 lg:col-span-4 xl:col-span-3 flex flex-col border-border/50 shadow-sm h-[500px] lg:h-auto">
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
                    filteredMarkets.slice(0, 20).map((market) => (
                      <Link key={market.condition_id} href={`/market/${market.condition_id}`} className="block">
                        <div className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors group cursor-pointer">
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
                      </Link>
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
