"use client"

import { useState, useEffect, useCallback, useDeferredValue, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { LogFilters, type FilterState } from "@/components/logs/log-filters"
import { LogTable } from "@/components/logs/log-table"
import { LogDetailSheet } from "@/components/logs/log-detail-sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchLogs } from "@/lib/api"
import { exportAsJson, exportAsCsv } from "@/lib/log-utils"
import type { LogEntry } from "@/types"

const DEFAULT_PAGE_SIZE = 25

function parseArrayParam(val: string | null): string[] {
  if (!val) return []
  return val.split(",").filter(Boolean)
}

function LogsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-8 w-full rounded-lg" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}

function LogsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Parse URL params into state
  const [filters, setFilters] = useState<FilterState>(() => ({
    search: searchParams.get("search") ?? "",
    methods: parseArrayParam(searchParams.get("methods")),
    upstreams: parseArrayParam(searchParams.get("upstreams")),
    statuses: parseArrayParam(searchParams.get("statuses")),
    tags: parseArrayParam(searchParams.get("tags")),
    startDate: searchParams.get("startDate") ?? "",
    endDate: searchParams.get("endDate") ?? "",
  }))

  const [page, setPage] = useState(() => {
    const p = searchParams.get("page")
    return p ? Math.max(1, parseInt(p)) : 1
  })
  const [pageSize, setPageSize] = useState(() => {
    const s = searchParams.get("pageSize")
    return s ? parseInt(s) : DEFAULT_PAGE_SIZE
  })
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [showFilters, setShowFilters] = useState(() => {
    // auto-expand if any filter is active
    return (
      filters.methods.length > 0 ||
      filters.upstreams.length > 0 ||
      filters.statuses.length > 0 ||
      filters.tags.length > 0 ||
      !!filters.startDate ||
      !!filters.endDate
    )
  })
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Debounced search
  const deferredSearch = useDeferredValue(filters.search)

  // Track whether the user has interacted with filters/pagination.
  // This prevents router.replace from firing on initial mount, which
  // could cause unintended redirects from other pages (e.g. /dashboard).
  const hasInteracted = useRef(false)
  const initializedFromUrl = useRef(true)

  // Sync filters to URL — only after user interaction
  useEffect(() => {
    // Skip the very first render (initialized from URL params)
    if (initializedFromUrl.current) {
      initializedFromUrl.current = false
      return
    }
    hasInteracted.current = true
  }, [filters, page, pageSize])

  useEffect(() => {
    if (!hasInteracted.current) return

    const params = new URLSearchParams()
    if (deferredSearch) params.set("search", deferredSearch)
    if (filters.methods.length) params.set("methods", filters.methods.join(","))
    if (filters.upstreams.length) params.set("upstreams", filters.upstreams.join(","))
    if (filters.statuses.length) params.set("statuses", filters.statuses.join(","))
    if (filters.tags.length) params.set("tags", filters.tags.join(","))
    if (filters.startDate) params.set("startDate", filters.startDate)
    if (filters.endDate) params.set("endDate", filters.endDate)
    if (page > 1) params.set("page", String(page))
    if (pageSize !== DEFAULT_PAGE_SIZE) params.set("pageSize", String(pageSize))

    const qs = params.toString()
    const target = qs ? `/?${qs}` : "/"
    router.replace(target, { scroll: false })
  }, [deferredSearch, filters.methods, filters.upstreams, filters.statuses, filters.tags, filters.startDate, filters.endDate, page, pageSize, router])

  // Fetch data
  const result = fetchLogs(
    {
      search: deferredSearch,
      methods: filters.methods,
      upstreams: filters.upstreams,
      statuses: filters.statuses,
      tags: filters.tags,
      startDate: filters.startDate,
      endDate: filters.endDate,
    },
    page,
    pageSize,
  )

  // Auto-refresh
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => setTick((t) => t + 1), 5000)
    return () => clearInterval(interval)
  }, [autoRefresh])

  // Reset page when filters change
  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters)
    setPage(1)
  }, [])

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size)
    setPage(1)
  }, [])

  const handleSelectLog = useCallback((log: LogEntry) => {
    setSelectedLog(log)
    setSheetOpen(true)
  }, [])

  const handleExport = useCallback(
    (format: "json" | "csv") => {
      // Export all filtered data (not just current page)
      const allResult = fetchLogs(
        {
          search: deferredSearch,
          methods: filters.methods,
          upstreams: filters.upstreams,
          statuses: filters.statuses,
          tags: filters.tags,
          startDate: filters.startDate,
          endDate: filters.endDate,
        },
        1,
        10000,
      )
      const ts = new Date().toISOString().slice(0, 19).replace(/[:-]/g, "")
      if (format === "json") {
        exportAsJson(allResult.logs, `prismcat-logs-${ts}.json`)
      } else {
        const rows = allResult.logs.map((l) => ({
          id: l.id,
          method: l.method,
          status: l.status,
          upstream: l.upstream,
          path: l.path,
          latency: l.latency,
          time: l.time,
          streaming: l.streaming,
          tag: l.tag ?? "",
          targetUrl: l.targetUrl,
        }))
        exportAsCsv(rows, `prismcat-logs-${ts}.csv`)
      }
    },
    [deferredSearch, filters],
  )

  return (
    <>
      <LogFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        autoRefresh={autoRefresh}
        onAutoRefreshChange={setAutoRefresh}
        showFilters={showFilters}
        onShowFiltersChange={setShowFilters}
        onExport={handleExport}
        total={result.total}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
      />
      <LogTable
        logs={result.logs}
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
        onPageChange={setPage}
        onSelectLog={handleSelectLog}
      />
      <LogDetailSheet
        log={selectedLog}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        logs={result.logs}
        onNavigate={handleSelectLog}
      />
    </>
  )
}

export default function LogsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            {"日志"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {"查看全部 API 代理请求记录"}
          </p>
        </div>
      </div>
      <Suspense fallback={<LogsSkeleton />}>
        <LogsContent />
      </Suspense>
    </div>
  )
}
