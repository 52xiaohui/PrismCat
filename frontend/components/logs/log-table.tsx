"use client"

import { Zap, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getMethodColor, getStatusColor, formatTime } from "@/lib/log-utils"
import type { LogEntry } from "@/types"

function LogCard({
  log,
  onClick,
}: {
  log: LogEntry
  onClick: () => void
}) {
  return (
    <button
      className="flex flex-col gap-2 w-full rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted/50 active:bg-muted/70"
      onClick={onClick}
    >
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
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground font-mono">{log.upstream}</span>
        <span className="text-[11px] font-mono tabular-nums text-muted-foreground">{formatTime(log.time)}</span>
      </div>
    </button>
  )
}

interface LogTableProps {
  logs: LogEntry[]
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
  onSelectLog: (log: LogEntry) => void
}

export function LogTable({
  logs,
  page,
  totalPages,
  total,
  onPageChange,
  onSelectLog,
}: LogTableProps) {
  return (
    <>
      {/* Mobile card list */}
      <div className="flex flex-col gap-2 md:hidden">
        {logs.length === 0 ? (
          <div className="py-16 text-center rounded-lg border border-border bg-card">
            <p className="text-sm text-foreground">{"\u672a\u627e\u5230\u76f8\u5173\u65e5\u5fd7"}</p>
            <p className="mt-1 text-xs text-muted-foreground">{"\u8c03\u6574\u7b5b\u9009\u6761\u4ef6\u6216\u53d1\u9001\u65b0\u8bf7\u6c42"}</p>
          </div>
        ) : (
          logs.map((log) => (
            <LogCard key={log.id} log={log} onClick={() => onSelectLog(log)} />
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground w-20">{"\u65b9\u6cd5"}</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground w-16">{"\u72b6\u6001"}</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground w-32">{"\u4e0a\u6e38"}</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">{"\u8def\u5f84"}</th>
                <th className="px-4 py-2.5 text-right font-medium text-muted-foreground w-24">{"\u5ef6\u8fdf"}</th>
                <th className="px-4 py-2.5 text-right font-medium text-muted-foreground w-24">{"\u65f6\u95f4"}</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <p className="text-sm text-foreground">{"\u672a\u627e\u5230\u76f8\u5173\u65e5\u5fd7"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{"\u8c03\u6574\u7b5b\u9009\u6761\u4ef6\u6216\u53d1\u9001\u65b0\u8bf7\u6c42"}</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-muted/50"
                    onClick={() => onSelectLog(log)}
                  >
                    <td className="px-4 py-2.5">
                      <span className={cn("font-mono text-xs font-semibold", getMethodColor(log.method))}>{log.method}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={cn("font-mono text-xs tabular-nums font-semibold", getStatusColor(log.status))}>{log.status}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs text-muted-foreground font-mono">{log.upstream}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-foreground truncate max-w-xs">{log.path}</span>
                        {log.tag && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500/40 text-amber-500 bg-amber-500/10">{log.tag}</Badge>
                        )}
                        {log.streaming && <Zap className="size-3 text-violet-400 fill-violet-400 shrink-0" />}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="text-xs font-mono tabular-nums text-muted-foreground">{log.latency}ms</span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="text-xs font-mono tabular-nums text-muted-foreground">{formatTime(log.time)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between pt-3">
          <span className="text-xs text-muted-foreground tabular-nums">
            {total} {"\u6761\u8bb0\u5f55"}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="size-7" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
              <ChevronLeft className="size-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground tabular-nums">
              {page} / {totalPages}
            </span>
            <Button variant="outline" size="icon" className="size-7" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
