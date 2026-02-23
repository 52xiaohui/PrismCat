"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Play,
  Copy,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Check,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { getMethodBadgeClass } from "@/lib/log-utils"
import type { LogEntry } from "@/types"

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-6 shrink-0"
      onClick={(e) => {
        e.stopPropagation()
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
    >
      {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
    </Button>
  )
}

function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-border rounded-md overflow-hidden">
      <button
        className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        {open ? <ChevronDown className="size-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />}
        <span className="truncate">{title}</span>
      </button>
      {open && (
        <div className="border-t border-border bg-muted/30 px-3 py-2 overflow-x-auto">
          {children}
        </div>
      )}
    </div>
  )
}

function JsonBlock({ data }: { data: string | null }) {
  const [expanded, setExpanded] = useState(false)
  if (!data) return <span className="text-xs text-muted-foreground italic">{"(\u7a7a)"}</span>

  let parsed: unknown
  try { parsed = JSON.parse(data) } catch {
    return <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-all">{data}</pre>
  }

  const isObj = typeof parsed === "object" && parsed !== null
  const isArr = Array.isArray(parsed)
  const count = isArr ? parsed.length : isObj ? Object.keys(parsed as Record<string, unknown>).length : 0
  const label = isArr ? `${count} \u4e2a\u9879\u76ee` : `${count} \u4e2a\u952e`
  const formatted = JSON.stringify(parsed, null, 2)
  const lines = formatted.split("\n")
  const shouldCollapse = lines.length > 20

  return (
    <div className="flex flex-col gap-1.5">
      <Badge variant="outline" className="w-fit text-[10px] px-1.5 py-0 text-muted-foreground">{label}</Badge>
      <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-all leading-relaxed">
        {shouldCollapse && !expanded ? lines.slice(0, 15).join("\n") + "\n..." : formatted}
      </pre>
      {shouldCollapse && (
        <button
          className="text-[11px] text-muted-foreground hover:text-foreground transition-colors self-start"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "\u6536\u8d77" : `\u5c55\u5f00\u5168\u90e8 (${lines.length} \u884c)`}
        </button>
      )}
    </div>
  )
}

function HeadersTable({ headers }: { headers: Record<string, string> }) {
  return (
    <div className="flex flex-col gap-1">
      {Object.entries(headers).map(([key, value]) => (
        <div key={key} className="flex flex-col sm:flex-row sm:gap-2 text-xs">
          <span className="font-mono text-muted-foreground shrink-0">{key}:</span>
          <span className="font-mono text-foreground break-all">{value}</span>
        </div>
      ))}
    </div>
  )
}

interface LogDetailSheetProps {
  log: LogEntry | null
  open: boolean
  onOpenChange: (open: boolean) => void
  logs: LogEntry[]
  onNavigate: (log: LogEntry) => void
}

export function LogDetailSheet({ log, open, onOpenChange, logs, onNavigate }: LogDetailSheetProps) {
  const router = useRouter()
  const [responseViewMode, setResponseViewMode] = useState<"merged" | "raw">("merged")

  const currentIndex = log ? logs.findIndex((l) => l.id === log.id) : -1
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex >= 0 && currentIndex < logs.length - 1

  const goPrev = useCallback(() => {
    if (hasPrev) onNavigate(logs[currentIndex - 1])
  }, [hasPrev, currentIndex, logs, onNavigate])

  const goNext = useCallback(() => {
    if (hasNext) onNavigate(logs[currentIndex + 1])
  }, [hasNext, currentIndex, logs, onNavigate])

  // Keyboard nav
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowUp" || e.key === "k") { e.preventDefault(); goPrev() }
      if (e.key === "ArrowDown" || e.key === "j") { e.preventDefault(); goNext() }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, goPrev, goNext])

  const handleReplay = useCallback(() => {
    if (!log) return
    const params = new URLSearchParams({
      method: log.method,
      path: log.path,
      upstream: log.upstream,
    })
    if (log.requestBody) params.set("body", log.requestBody)
    router.push(`/playground?${params.toString()}`)
    onOpenChange(false)
  }, [log, router, onOpenChange])

  if (!log) return null

  const statusColor =
    log.status >= 200 && log.status < 300
      ? "text-emerald-400"
      : log.status >= 400 && log.status < 500
        ? "text-amber-400"
        : log.status >= 500
          ? "text-red-400"
          : "text-muted-foreground"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl lg:max-w-2xl p-0 flex flex-col">
        <SheetHeader className="px-3 sm:px-4 pt-4 pb-3 border-b border-border">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Keyboard nav buttons */}
            <div className="flex items-center gap-0.5 mr-1">
              <Button variant="ghost" size="icon" className="size-6" disabled={!hasPrev} onClick={goPrev} title="ArrowUp">
                <ChevronUp className="size-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="size-6" disabled={!hasNext} onClick={goNext} title="ArrowDown">
                <ChevronDown className="size-3.5" />
              </Button>
            </div>
            <Badge variant="outline" className={cn("font-mono text-xs font-semibold", getMethodBadgeClass(log.method))}>{log.method}</Badge>
            <span className={cn("font-mono text-sm font-semibold tabular-nums", statusColor)}>{log.status}</span>
            {log.streaming && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-violet-500/40 text-violet-400 bg-violet-500/10">{"\u6d41\u5f0f"}</Badge>
            )}
            <div className="ml-auto">
              <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={handleReplay}>
                <Play className="size-3" />
                {"\u91cd\u653e"}
              </Button>
            </div>
          </div>
          <SheetTitle className="sr-only">{"\u65e5\u5fd7\u8be6\u60c5"}</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-4 p-3 sm:p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{"\u4e0a\u6e38"}</span>
                <p className="text-xs font-mono text-foreground mt-0.5 break-all">{log.upstream}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{"\u5ef6\u8fdf"}</span>
                <p className="text-xs font-mono tabular-nums text-foreground mt-0.5">{log.latency}ms</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{"\u65f6\u95f4"}</span>
                <p className="text-xs font-mono text-foreground mt-0.5">{new Date(log.time).toLocaleString("zh-CN")}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">ID</span>
                <p className="text-xs font-mono text-foreground mt-0.5 break-all">{log.id}</p>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Target URL</span>
              <div className="flex items-center gap-2 mt-1 rounded-md border border-border bg-muted/50 px-3 py-2">
                <code className="flex-1 text-xs font-mono text-foreground break-all">{log.targetUrl}</code>
                <CopyButton text={log.targetUrl} />
              </div>
            </div>

            <CollapsibleSection title={"\u8bf7\u6c42\u5934"} defaultOpen>
              <HeadersTable headers={log.requestHeaders} />
            </CollapsibleSection>
            <CollapsibleSection title={"\u8bf7\u6c42\u4f53"}>
              <JsonBlock data={log.requestBody} />
            </CollapsibleSection>
            <CollapsibleSection title={"\u54cd\u5e94\u5934"}>
              <HeadersTable headers={log.responseHeaders} />
            </CollapsibleSection>
            <CollapsibleSection title={"\u54cd\u5e94\u4f53"}>
              {log.streaming && (
                <div className="flex gap-1 mb-2">
                  <Button variant={responseViewMode === "merged" ? "secondary" : "ghost"} size="sm" className="h-6 text-[10px] px-2" onClick={() => setResponseViewMode("merged")}>{"\u5408\u5e76\u89c6\u56fe"}</Button>
                  <Button variant={responseViewMode === "raw" ? "secondary" : "ghost"} size="sm" className="h-6 text-[10px] px-2" onClick={() => setResponseViewMode("raw")}>{"\u539f\u59cb\u6570\u636e"}</Button>
                </div>
              )}
              {responseViewMode === "raw" && log.streaming ? (
                <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-all leading-relaxed">{log.responseBody}</pre>
              ) : (
                <JsonBlock data={log.responseBody} />
              )}
            </CollapsibleSection>
          </div>
        </ScrollArea>

        {/* Keyboard hint */}
        <div className="flex items-center justify-center gap-4 px-4 py-2 border-t border-border bg-muted/30 text-[10px] text-muted-foreground">
          <span>{"\u2191\u2193 \u5207\u6362\u6761\u76ee"}</span>
          <span>Esc {"\u5173\u95ed"}</span>
        </div>
      </SheetContent>
    </Sheet>
  )
}
