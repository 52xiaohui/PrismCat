"use client"

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import type { UpstreamDistribution } from "@/types"

const COLORS = [
  "oklch(0.62 0.19 145)",
  "oklch(0.6 0.17 240)",
  "oklch(0.75 0.18 85)",
  "oklch(0.65 0.20 340)",
]

export function UpstreamChartSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <Skeleton className="h-4 w-28 mb-4" />
      <Skeleton className="h-40 sm:h-48 w-full rounded" />
    </div>
  )
}

export function UpstreamChart({ data }: { data: UpstreamDistribution[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-medium text-foreground mb-4">
        {"\u4e0a\u6e38\u8bf7\u6c42\u5206\u5e03"}
      </h3>
      <div className="h-40 sm:h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, className: "fill-muted-foreground" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, className: "fill-muted-foreground" }}
              axisLine={false}
              tickLine={false}
              width={100}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0].payload as { name: string; value: number }
                return (
                  <div className="rounded-md border border-border bg-popover px-3 py-2 shadow-lg">
                    <p className="text-xs text-foreground">
                      {d.name}: {d.value} {"\u6761\u8bf7\u6c42"}
                    </p>
                  </div>
                )
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={24}>
              {data.map((entry, i) => (
                <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
