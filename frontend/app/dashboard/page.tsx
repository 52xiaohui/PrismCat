"use client"

import { useState, useEffect, useCallback, Suspense, lazy } from "react"
import Link from "next/link"
import { ArrowRight, RefreshCw, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  fetchStats,
  fetchTimeSeries,
  fetchUpstreamDistribution,
  fetchStatusDistribution,
} from "@/lib/api"
import { mockLogs } from "@/lib/mock-data"
import { getMethodColor, getStatusColor } from "@/lib/log-utils"
import { cn } from "@/lib/utils"
import type { Stats, TimeSeriesPoint, UpstreamDistribution, StatusDistribution } from "@/types"

import { StatCards, StatCardsSkeleton } from "@/components/dashboard/stat-cards"

// Lazy-loaded chart components for reduced initial bundle size
const RequestChart = lazy(() =>
  import("@/components/dashboard/request-chart").then((m) => ({
    default: m.RequestChart,
  }))
)
const LatencyChart = lazy(() =>
  import("@/components/dashboard/side-charts").then((m) => ({
    default: m.LatencyChart,
  }))
)
const StatusPieChart = lazy(() =>
  import("@/components/dashboard/side-charts").then((m) => ({
    default: m.StatusPieChart,
  }))
)
const UpstreamChart = lazy(() =>
  import("@/components/dashboard/upstream-chart").then((m) => ({
    default: m.UpstreamChart,
  }))
)

const TIME_RANGES: { value: string; label: string }[] = [
  { value: "1h", label: "\u8fc7\u53bb 1 \u5c0f\u65f6" },
  { value: "6h", label: "\u8fc7\u53bb 6 \u5c0f\u65f6" },
  { value: "24h", label: "\u8fc7\u53bb 24 \u5c0f\u65f6" },
  { value: "7d", label: "\u8fc7\u53bb 7 \u5929" },
  { value: "30d", label: "\u8fc7\u53bb 30 \u5929" },
]

const REFRESH_OPTIONS: { value: string; label: string; ms: number }[] = [
  { value: "off", label: "\u5173\u95ed", ms: 0 },
  { value: "5s", label: "\u6bcf 5\u79d2", ms: 5000 },
  { value: "10s", label: "\u6bcf 10\u79d2", ms: 10000 },
  { value: "30s", label: "\u6bcf 30\u79d2", ms: 30000 },
]

function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border border-border bg-card p-4", className)}>
      <Skeleton className="h-4 w-24 mb-4" />
      <Skeleton className="h-full w-full rounded min-h-32" />
    </div>
  )
}

function RecentLogsSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-16" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-2.5 border-b border-border last:border-0">
          <Skeleton className="h-3.5 w-10" />
          <Skeleton className="h-3.5 w-8" />
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3.5 flex-1" />
          <Skeleton className="h-3.5 w-12" />
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState("24h")
  const [refreshInterval, setRefreshInterval] = useState("off")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([])
  const [upstreamDist, setUpstreamDist] = useState<UpstreamDistribution[]>([])
  const [statusDist, setStatusDist] = useState<StatusDistribution[]>([])

  const loadData = useCallback(() => {
    setStats(fetchStats())
    setTimeSeries(fetchTimeSeries(timeRange))
    setUpstreamDist(fetchUpstreamDistribution())
    setStatusDist(fetchStatusDistribution())
    setLoading(false)
  }, [timeRange])

  useEffect(() => {
    setLoading(true)
    // Simulate async load
    const t = window.setTimeout(loadData, 300)
    return () => clearTimeout(t)
  }, [loadData])

  // Auto-refresh
  useEffect(() => {
    const opt = REFRESH_OPTIONS.find((o) => o.value === refreshInterval)
    if (!opt || opt.ms === 0) return
    const interval = setInterval(loadData, opt.ms)
    return () => clearInterval(interval)
  }, [refreshInterval, loadData])

  const recentLogs = mockLogs.slice(0, 5)
  const rangeLabel = TIME_RANGES.find((r) => r.value === timeRange)?.label ?? ""

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            {"\u4eea\u8868\u76d8"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {"\u5b9e\u65f6\u76d1\u63a7 API \u4ee3\u7406\u6d41\u91cf\u4e0e\u6027\u80fd\u6307\u6807"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Time range */}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Auto-refresh */}
          <Select value={refreshInterval} onValueChange={setRefreshInterval}>
            <SelectTrigger className="h-8 w-28 text-xs">
              <RefreshCw
                className={cn(
                  "size-3 mr-1",
                  refreshInterval !== "off" && "animate-spin"
                )}
              />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REFRESH_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Link href="/">
            <Button variant="outline" size="sm" className="gap-1.5 h-8">
              {"\u67e5\u770b\u65e5\u5fd7"}
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      {loading || !stats ? <StatCardsSkeleton /> : <StatCards stats={stats} />}

      {/* Charts row - request chart + side column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {loading ? (
            <ChartSkeleton className="h-[340px]" />
          ) : (
            <Suspense fallback={<ChartSkeleton className="h-[340px]" />}>
              <RequestChart data={timeSeries} rangeLabel={rangeLabel} />
            </Suspense>
          )}
        </div>
        <div className="flex flex-col gap-4">
          {loading ? (
            <>
              <ChartSkeleton className="flex-1 min-h-[172px]" />
              <ChartSkeleton className="flex-1 min-h-[172px]" />
            </>
          ) : (
            <Suspense
              fallback={
                <>
                  <ChartSkeleton className="flex-1 min-h-[172px]" />
                  <ChartSkeleton className="flex-1 min-h-[172px]" />
                </>
              }
            >
              <LatencyChart data={timeSeries} />
              <StatusPieChart data={statusDist} />
            </Suspense>
          )}
        </div>
      </div>

      {/* Upstream + Recent logs side by side on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upstream distribution */}
        {loading ? (
          <ChartSkeleton className="min-h-[240px]" />
        ) : (
          <Suspense fallback={<ChartSkeleton className="min-h-[240px]" />}>
            <UpstreamChart data={upstreamDist} />
          </Suspense>
        )}

        {/* Recent logs */}
        {loading ? (
          <RecentLogsSkeleton />
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
              <h3 className="text-sm font-medium text-foreground">
                {"\u6700\u8fd1\u8bf7\u6c42"}
              </h3>
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs text-muted-foreground">
                  {"\u67e5\u770b\u5168\u90e8"}
                  <ArrowRight className="size-3" />
                </Button>
              </Link>
            </div>

            {/* Mobile card view */}
            <div className="flex flex-col divide-y divide-border md:hidden">
              {recentLogs.map((log) => (
                <Link key={log.id} href={`/?search=${log.id}`} className="flex flex-col gap-1.5 p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("font-mono text-xs font-semibold", getMethodColor(log.method))}>{log.method}</span>
                    <span className={cn("font-mono text-xs tabular-nums font-semibold", getStatusColor(log.status))}>{log.status}</span>
                    {log.streaming && <Zap className="size-3 text-violet-400 fill-violet-400" />}
                    {log.tag && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500/40 text-amber-500 bg-amber-500/10">{log.tag}</Badge>
                    )}
                    <span className="ml-auto text-[11px] font-mono tabular-nums text-muted-foreground">{log.latency}ms</span>
                  </div>
                  <span className="text-xs font-mono text-foreground truncate">{log.path}</span>
                  <span className="text-[11px] text-muted-foreground font-mono">{log.upstream}</span>
                </Link>
              ))}
            </div>

            {/* Desktop table view */}
            <table className="hidden md:table w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground text-xs w-20">{"\u65b9\u6cd5"}</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground text-xs w-16">{"\u72b6\u6001"}</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground text-xs w-32">{"\u4e0a\u6e38"}</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground text-xs">{"\u8def\u5f84"}</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground text-xs w-24">{"\u5ef6\u8fdf"}</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-2">
                      <span className={cn("font-mono text-xs font-semibold", getMethodColor(log.method))}>{log.method}</span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={cn("font-mono text-xs tabular-nums font-semibold", getStatusColor(log.status))}>{log.status}</span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-xs text-muted-foreground font-mono">{log.upstream}</span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-foreground truncate max-w-xs">{log.path}</span>
                        {log.tag && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500/40 text-amber-500 bg-amber-500/10">{log.tag}</Badge>
                        )}
                        {log.streaming && <Zap className="size-3 text-violet-400 fill-violet-400 shrink-0" />}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <span className="text-xs font-mono tabular-nums text-muted-foreground">{log.latency}ms</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
