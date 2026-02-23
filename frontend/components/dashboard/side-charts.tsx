"use client"

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import type { TimeSeriesPoint, StatusDistribution } from "@/types"

function LatencyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-xs text-foreground">
        {"\u5ef6\u8fdf"}: {payload[0].value}ms
      </p>
    </div>
  )
}

export function SideChartsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border bg-card p-4 flex-1">
        <Skeleton className="h-4 w-20 mb-3" />
        <Skeleton className="h-32 sm:h-36 w-full rounded" />
      </div>
      <div className="rounded-lg border border-border bg-card p-4 flex-1">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-32 sm:h-36 w-full rounded" />
      </div>
    </div>
  )
}

export function LatencyChart({ data }: { data: TimeSeriesPoint[] }) {
  const filtered = data.filter((_, i) => i % 3 === 0)
  return (
    <div className="rounded-lg border border-border bg-card p-4 flex-1">
      <h3 className="text-sm font-medium text-foreground mb-3">
        {"\u5ef6\u8fdf\u5206\u5e03"}
      </h3>
      <div className="h-32 sm:h-36">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filtered}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, className: "fill-muted-foreground" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, className: "fill-muted-foreground" }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip content={<LatencyTooltip />} />
            <Bar dataKey="latency" fill="oklch(0.75 0.18 85)" radius={[3, 3, 0, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function StatusPieChart({ data }: { data: StatusDistribution[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 flex-1">
      <h3 className="text-sm font-medium text-foreground mb-3">
        {"\u72b6\u6001\u7801\u5206\u5e03"}
      </h3>
      <div className="h-32 sm:h-36">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="45%"
              outerRadius="75%"
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0].payload as { name: string; value: number }
                return (
                  <div className="rounded-md border border-border bg-popover px-3 py-2 shadow-lg">
                    <p className="text-xs text-foreground">
                      {d.name}: {d.value} {"\u6761"}
                    </p>
                  </div>
                )
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={24}
              formatter={(value: string) => (
                <span className="text-[11px] text-muted-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
