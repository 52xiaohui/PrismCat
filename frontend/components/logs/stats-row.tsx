"use client"

import {
  getStats,
  timeSeriesData,
  upstreamDistribution,
  statusDistribution,
} from "@/lib/mock-data"
import {
  AreaChart,
  Area,
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
import { Activity, CheckCircle, AlertTriangle, Zap, Clock, Server } from "lucide-react"
import { cn } from "@/lib/utils"

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  accent?: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 sm:p-4">
      <div
        className={cn(
          "flex size-9 items-center justify-center rounded-md",
          accent ?? "bg-muted"
        )}
      >
        <Icon className="size-4 text-foreground" />
      </div>
      <div className="flex flex-col">
        <span className="text-[11px] text-muted-foreground leading-tight">
          {label}
        </span>
        <span className="text-lg font-semibold tabular-nums font-mono text-foreground leading-tight">
          {value}
        </span>
      </div>
    </div>
  )
}

function CustomTooltip({
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
    latency: "\u5ef6\u8fdf (ms)",
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

export function StatsRow() {
  const stats = getStats()

  const cards = [
    {
      label: "\u603b\u8bf7\u6c42\u6570",
      value: stats.total,
      icon: Activity,
      accent: "bg-chart-1/15",
    },
    {
      label: "\u6210\u529f",
      value: stats.success,
      icon: CheckCircle,
      accent: "bg-emerald-500/15",
    },
    {
      label: "\u9519\u8bef",
      value: stats.errors,
      icon: AlertTriangle,
      accent: "bg-red-500/15",
    },
    {
      label: "\u6d41\u5f0f",
      value: stats.streaming,
      icon: Zap,
      accent: "bg-sky-500/15",
    },
    {
      label: "\u5e73\u5747\u5ef6\u8fdf",
      value: `${stats.avgLatency}ms`,
      icon: Clock,
      accent: "bg-amber-500/15",
    },
    {
      label: "\u4e0a\u6e38\u6570",
      value: stats.upstreamCount,
      icon: Server,
      accent: "bg-chart-3/15",
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Stat cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Request volume area chart */}
        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground">
              {"\u8bf7\u6c42\u91cf\u8d8b\u52bf"}
            </h3>
            <span className="text-[11px] text-muted-foreground">
              {"\u8fc7\u53bb 24 \u5c0f\u65f6"}
            </span>
          </div>
          <div className="h-48 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient
                    id="reqGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="oklch(0.62 0.19 145)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="oklch(0.62 0.19 145)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient
                    id="errGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="oklch(0.577 0.245 27.325)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="oklch(0.577 0.245 27.325)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "oklch(0.6 0 0)" }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="oklch(0.62 0.19 145)"
                  fill="url(#reqGradient)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="errors"
                  stroke="oklch(0.577 0.245 27.325)"
                  fill="url(#errGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-2 justify-center">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: "oklch(0.62 0.19 145)" }}
              />
              {"\u8bf7\u6c42\u6570"}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: "oklch(0.577 0.245 27.325)" }}
              />
              {"\u9519\u8bef\u6570"}
            </div>
          </div>
        </div>

        {/* Right column: latency bar + upstream pie */}
        <div className="flex flex-col gap-4">
          {/* Latency bar chart */}
          <div className="rounded-lg border border-border bg-card p-4 flex-1">
            <h3 className="text-sm font-medium text-foreground mb-3">
              {"\u5ef6\u8fdf\u5206\u5e03"}
            </h3>
            <div className="h-28 sm:h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeSeriesData.filter((_, i) => i % 3 === 0)}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10, fill: "oklch(0.6 0 0)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "oklch(0.6 0 0)" }}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="latency"
                    fill="oklch(0.75 0.18 85)"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status + upstream distribution */}
          <div className="rounded-lg border border-border bg-card p-4 flex-1">
            <h3 className="text-sm font-medium text-foreground mb-3">
              {"\u72b6\u6001\u7801\u5206\u5e03"}
            </h3>
            <div className="h-28 sm:h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius="45%"
                    outerRadius="75%"
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusDistribution.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const d = payload[0].payload as {
                        name: string
                        value: number
                      }
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
                      <span className="text-[11px] text-muted-foreground">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
