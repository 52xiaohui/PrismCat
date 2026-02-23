"use client"

import {
  Activity,
  CheckCircle,
  AlertTriangle,
  Zap,
  Clock,
  Server,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { Stats } from "@/types"

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  trend,
  trendValue,
}: {
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  accent?: string
  trend?: "up" | "down" | "neutral"
  trendValue?: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 sm:p-4">
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-md",
          accent ?? "bg-muted"
        )}
      >
        <Icon className="size-4 text-foreground" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[11px] text-muted-foreground leading-tight truncate">
          {label}
        </span>
        <span className="text-lg font-semibold tabular-nums font-mono text-foreground leading-tight">
          {value}
        </span>
        {trend && trendValue && (
          <div className="flex items-center gap-1 mt-0.5">
            {trend === "up" ? (
              <TrendingUp className="size-3 text-emerald-400" />
            ) : trend === "down" ? (
              <TrendingDown className="size-3 text-red-400" />
            ) : null}
            <span
              className={cn(
                "text-[10px] tabular-nums",
                trend === "up"
                  ? "text-emerald-400"
                  : trend === "down"
                    ? "text-red-400"
                    : "text-muted-foreground"
              )}
            >
              {trendValue}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 sm:p-4"
        >
          <Skeleton className="size-9 shrink-0 rounded-md" />
          <div className="flex flex-col gap-1.5 flex-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-10" />
            <Skeleton className="h-2.5 w-14" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function StatCards({ stats }: { stats: Stats }) {
  const cards = [
    {
      label: "\u603b\u8bf7\u6c42\u6570",
      value: stats.total,
      icon: Activity,
      accent: "bg-sky-500/15",
      trend: "up" as const,
      trendValue: "+12.3%",
    },
    {
      label: "\u6210\u529f",
      value: stats.success,
      icon: CheckCircle,
      accent: "bg-emerald-500/15",
      trend: "up" as const,
      trendValue: "+5.1%",
    },
    {
      label: "\u9519\u8bef",
      value: stats.errors,
      icon: AlertTriangle,
      accent: "bg-red-500/15",
      trend: "down" as const,
      trendValue: "-2.4%",
    },
    {
      label: "\u6d41\u5f0f\u8bf7\u6c42",
      value: stats.streaming,
      icon: Zap,
      accent: "bg-violet-500/15",
      trend: "up" as const,
      trendValue: "+8.7%",
    },
    {
      label: "\u5e73\u5747\u5ef6\u8fdf",
      value: `${stats.avgLatency}ms`,
      icon: Clock,
      accent: "bg-amber-500/15",
      trend: "neutral" as const,
      trendValue: "\u2248 \u7a33\u5b9a",
    },
    {
      label: "\u4e0a\u6e38\u6570",
      value: stats.upstreamCount,
      icon: Server,
      accent: "bg-teal-500/15",
      trend: "neutral" as const,
      trendValue: "\u65e0\u53d8\u5316",
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  )
}
