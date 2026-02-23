"use client"

import { useCallback } from "react"
import {
  RefreshCw,
  Search,
  RotateCcw,
  SlidersHorizontal,
  X,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MultiSelect } from "./multi-select"
import { cn } from "@/lib/utils"

const methodOptions = [
  { value: "GET", label: "GET" },
  { value: "POST", label: "POST" },
  { value: "PUT", label: "PUT" },
  { value: "DELETE", label: "DELETE" },
  { value: "PATCH", label: "PATCH" },
]

const upstreamOptions = [
  { value: "openai-main", label: "openai-main" },
  { value: "anthropic-prod", label: "anthropic-prod" },
  { value: "local-llm", label: "local-llm" },
]

const statusOptions = [
  { value: "2xx", label: "2xx" },
  { value: "3xx", label: "3xx" },
  { value: "4xx", label: "4xx" },
  { value: "5xx", label: "5xx" },
]

const tagOptions = [
  { value: "production", label: "production" },
  { value: "rate-limited", label: "rate-limited" },
  { value: "error", label: "error" },
  { value: "admin", label: "admin" },
]

export interface FilterState {
  search: string
  methods: string[]
  upstreams: string[]
  statuses: string[]
  tags: string[]
  startDate: string
  endDate: string
}

interface LogFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  autoRefresh: boolean
  onAutoRefreshChange: (v: boolean) => void
  showFilters: boolean
  onShowFiltersChange: (v: boolean) => void
  onExport: (format: "json" | "csv") => void
  total: number
  pageSize: number
  onPageSizeChange: (size: number) => void
}

export function LogFilters({
  filters,
  onFiltersChange,
  autoRefresh,
  onAutoRefreshChange,
  showFilters,
  onShowFiltersChange,
  onExport,
  total,
  pageSize,
  onPageSizeChange,
}: LogFiltersProps) {
  const activeFilterCount =
    filters.methods.length +
    filters.upstreams.length +
    filters.statuses.length +
    filters.tags.length +
    (filters.search ? 1 : 0) +
    (filters.startDate ? 1 : 0) +
    (filters.endDate ? 1 : 0)

  const update = useCallback(
    (partial: Partial<FilterState>) => {
      onFiltersChange({ ...filters, ...partial })
    },
    [filters, onFiltersChange]
  )

  const handleReset = useCallback(() => {
    onFiltersChange({
      search: "",
      methods: [],
      upstreams: [],
      statuses: [],
      tags: [],
      startDate: "",
      endDate: "",
    })
  }, [onFiltersChange])

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:p-4">
      {/* Top bar: search + actions */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder={"\u641c\u7d22\u8def\u5f84\u3001ID\u3001\u4e0a\u6e38..."}
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            className="h-8 pl-8 text-sm font-mono"
          />
          {filters.search && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-sm hover:bg-muted"
              onClick={() => update({ search: "" })}
            >
              <X className="size-3 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-8"
            onClick={() => onShowFiltersChange(!showFilters)}
          >
            <SlidersHorizontal className="size-3.5" />
            <span className="hidden sm:inline">{"\u7b5b\u9009"}</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 min-w-[18px] text-center">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => onAutoRefreshChange(!autoRefresh)}
            className="gap-1.5 h-8"
            aria-pressed={autoRefresh}
          >
            <RefreshCw className={cn("size-3.5", autoRefresh && "animate-spin")} />
            <span className="hidden sm:inline">{"\u81ea\u52a8\u5237\u65b0"}</span>
          </Button>

          {/* Export dropdown */}
          <div className="flex items-center">
            <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={() => onExport("csv")}>
              <Download className="size-3.5" />
              <span className="hidden sm:inline">CSV</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 h-8 ml-1" onClick={() => onExport("json")}>
              <span className="hidden sm:inline">JSON</span>
              <span className="sm:hidden text-xs">J</span>
            </Button>
          </div>

          {/* Page size */}
          <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
            <SelectTrigger className="h-8 w-20 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 {"\u6761"}</SelectItem>
              <SelectItem value="25">25 {"\u6761"}</SelectItem>
              <SelectItem value="50">50 {"\u6761"}</SelectItem>
              <SelectItem value="100">100 {"\u6761"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Expandable filter section */}
      {showFilters && (
        <div className="flex flex-col gap-3 pt-1 border-t border-border">
          <div className="flex flex-wrap gap-2">
            <MultiSelect
              options={methodOptions}
              selected={filters.methods}
              onChange={(v) => update({ methods: v })}
              placeholder={"\u65b9\u6cd5"}
              className="w-28 sm:w-32"
            />
            <MultiSelect
              options={upstreamOptions}
              selected={filters.upstreams}
              onChange={(v) => update({ upstreams: v })}
              placeholder={"\u4e0a\u6e38"}
              className="w-32 sm:w-40"
            />
            <MultiSelect
              options={statusOptions}
              selected={filters.statuses}
              onChange={(v) => update({ statuses: v })}
              placeholder={"\u72b6\u6001\u7801"}
              className="w-24 sm:w-28"
            />
            <MultiSelect
              options={tagOptions}
              selected={filters.tags}
              onChange={(v) => update({ tags: v })}
              placeholder={"\u6807\u7b7e"}
              className="w-28 sm:w-36"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => update({ startDate: e.target.value })}
                className="h-8 w-full sm:w-36 text-sm"
              />
              <span className="text-xs text-muted-foreground shrink-0">{"\u81f3"}</span>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => update({ endDate: e.target.value })}
                className="h-8 w-full sm:w-36 text-sm"
              />
            </div>
            {activeFilterCount > 0 && (
              <Button variant="outline" size="sm" className="gap-1.5 h-8 self-end sm:self-auto" onClick={handleReset}>
                <RotateCcw className="size-3.5" />
                {"\u91cd\u7f6e"}
              </Button>
            )}
          </div>

          {/* Active filter pills */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {filters.methods.map((m) => (
                <Badge key={`m-${m}`} variant="secondary" className="text-[11px] gap-1 pl-2 pr-1 py-0.5 cursor-pointer hover:bg-muted/80"
                  onClick={() => update({ methods: filters.methods.filter((v) => v !== m) })}>
                  {m}<X className="size-2.5" />
                </Badge>
              ))}
              {filters.upstreams.map((u) => (
                <Badge key={`u-${u}`} variant="secondary" className="text-[11px] gap-1 pl-2 pr-1 py-0.5 cursor-pointer hover:bg-muted/80"
                  onClick={() => update({ upstreams: filters.upstreams.filter((v) => v !== u) })}>
                  {u}<X className="size-2.5" />
                </Badge>
              ))}
              {filters.statuses.map((s) => (
                <Badge key={`s-${s}`} variant="secondary" className="text-[11px] gap-1 pl-2 pr-1 py-0.5 cursor-pointer hover:bg-muted/80"
                  onClick={() => update({ statuses: filters.statuses.filter((v) => v !== s) })}>
                  {s}<X className="size-2.5" />
                </Badge>
              ))}
              {filters.tags.map((t) => (
                <Badge key={`t-${t}`} variant="secondary" className="text-[11px] gap-1 pl-2 pr-1 py-0.5 cursor-pointer hover:bg-muted/80"
                  onClick={() => update({ tags: filters.tags.filter((v) => v !== t) })}>
                  {t}<X className="size-2.5" />
                </Badge>
              ))}
              {activeFilterCount > 2 && (
                <button className="text-[11px] text-muted-foreground hover:text-foreground transition-colors px-1" onClick={handleReset}>
                  {"\u6e05\u9664\u5168\u90e8"}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Total count */}
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <span className="text-xs text-muted-foreground tabular-nums">
          {"\u5171"} {total} {"\u6761\u8bb0\u5f55"}
        </span>
      </div>
    </div>
  )
}
