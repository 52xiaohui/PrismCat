import {
  mockLogs,
  upstreams,
  getStats,
  timeSeriesData,
  upstreamDistribution,
  statusDistribution,
} from "@/lib/mock-data"
import type {
  LogEntry,
  Upstream,
  Stats,
  TimeSeriesPoint,
  UpstreamDistribution,
  StatusDistribution,
} from "@/types"

// Re-export types for convenience
export type { LogEntry, Upstream, Stats, TimeSeriesPoint, UpstreamDistribution, StatusDistribution }

export interface LogFilters {
  search?: string
  methods?: string[]
  upstreams?: string[]
  statuses?: string[]
  tags?: string[]
  startDate?: string
  endDate?: string
}

export interface PaginatedLogs {
  logs: LogEntry[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export function fetchLogs(
  filters: LogFilters = {},
  page = 1,
  pageSize = 25
): PaginatedLogs {
  let filtered = [...mockLogs]

  if (filters.search) {
    const q = filters.search.toLowerCase()
    filtered = filtered.filter(
      (l) =>
        l.path.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q) ||
        l.upstream.toLowerCase().includes(q)
    )
  }

  if (filters.methods?.length) {
    filtered = filtered.filter((l) => filters.methods!.includes(l.method))
  }

  if (filters.upstreams?.length) {
    filtered = filtered.filter((l) => filters.upstreams!.includes(l.upstream))
  }

  if (filters.statuses?.length) {
    filtered = filtered.filter((l) => {
      const bucket = `${Math.floor(l.status / 100)}xx`
      return filters.statuses!.includes(bucket)
    })
  }

  if (filters.tags?.length) {
    filtered = filtered.filter((l) => l.tag && filters.tags!.includes(l.tag))
  }

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  const logs = filtered.slice(start, start + pageSize)

  return { logs, total, page: safePage, pageSize, totalPages }
}

export function fetchStats(): Stats {
  return getStats()
}

export function fetchTimeSeries(_range?: string): TimeSeriesPoint[] {
  return timeSeriesData
}

export function fetchUpstreamDistribution(): UpstreamDistribution[] {
  return upstreamDistribution
}

export function fetchStatusDistribution(): StatusDistribution[] {
  return statusDistribution
}

export function fetchUpstreams(): Upstream[] {
  return [...upstreams]
}
