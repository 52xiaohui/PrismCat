"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import type { TimeSeriesPoint } from "@/types"

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  const keyLabel: Record<string, string> = {
    requests: "\u8bf7\u6c42\u6570",
    errors: "\u9519\u8bef\u6570",
  }
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <span className="text-foreground">
            {keyLabel[p.dataKey] ?? p.dataKey}: {p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export function RequestChartSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-56 sm:h-64 w-full rounded" />
    </div>
  )
}

export function RequestChart({
  data,
  rangeLabel,
}: {
  data: TimeSeriesPoint[]
  rangeLabel: string
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground">
          {"\u8bf7\u6c42\u91cf\u8d8b\u52bf"}
        </h3>
        <span className="text-[11px] text-muted-foreground">{rangeLabel}</span>
      </div>
      <div className="h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.62 0.19 145)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="oklch(0.62 0.19 145)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.577 0.245 27.325)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="oklch(0.577 0.245 27.325)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, className: "fill-muted-foreground" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, className: "fill-muted-foreground" }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="requests"
              stroke="oklch(0.62 0.19 145)"
              fill="url(#reqGrad)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="errors"
              stroke="oklch(0.577 0.245 27.325)"
              fill="url(#errGrad)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 mt-3 justify-center">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="size-2 rounded-full" style={{ backgroundColor: "oklch(0.62 0.19 145)" }} />
          {"\u8bf7\u6c42\u6570"}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="size-2 rounded-full" style={{ backgroundColor: "oklch(0.577 0.245 27.325)" }} />
          {"\u9519\u8bef\u6570"}
        </div>
      </div>
    </div>
  )
}
