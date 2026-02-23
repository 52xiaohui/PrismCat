"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import {
  Send,
  Plus,
  Trash2,
  Copy,
  Check,
  Clock,
  RotateCcw,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { getMethodColor, getStatusColor } from "@/lib/log-utils"
import { upstreams } from "@/lib/mock-data"
import type { PlaygroundHistoryEntry } from "@/types"

interface HeaderPair {
  id: string
  key: string
  value: string
}

const MAX_HISTORY = 15

function usePlaygroundHistory() {
  const [history, setHistory] = useState<PlaygroundHistoryEntry[]>([])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("pg_history")
      if (raw) setHistory(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])

  const addEntry = useCallback((entry: PlaygroundHistoryEntry) => {
    setHistory((prev) => {
      const next = [entry, ...prev].slice(0, MAX_HISTORY)
      try { window.localStorage.setItem("pg_history", JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    try { window.localStorage.removeItem("pg_history") } catch { /* ignore */ }
  }, [])

  return { history, addEntry, clearHistory }
}

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("size-7 shrink-0", className)}
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

function PlaygroundInner() {
  const searchParams = useSearchParams()
  const { history, addEntry, clearHistory } = usePlaygroundHistory()

  // Init from URL params (replay from log detail)
  const [method, setMethod] = useState(() => searchParams.get("method") ?? "POST")
  const [upstream, setUpstream] = useState(() => searchParams.get("upstream") ?? upstreams[0].name)
  const [path, setPath] = useState(() => searchParams.get("path") ?? "/v1/chat/completions")
  const [body, setBody] = useState(() =>
    searchParams.get("body") ??
    JSON.stringify(
      { model: "gpt-4", messages: [{ role: "user", content: "Hello" }] },
      null,
      2,
    )
  )
  const [headers, setHeaders] = useState<HeaderPair[]>([
    { id: "1", key: "Content-Type", value: "application/json" },
    { id: "2", key: "Authorization", value: "Bearer sk-..." },
  ])
  const [response, setResponse] = useState<{
    status: number
    elapsed: number
    size: string
    body: string
    headers: Record<string, string>
  } | null>(null)
  const [sending, setSending] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  const addHeader = () => {
    setHeaders((prev) => [...prev, { id: Date.now().toString(), key: "", value: "" }])
  }

  const removeHeader = (id: string) => {
    setHeaders((prev) => prev.filter((h) => h.id !== id))
  }

  const updateHeader = (id: string, field: "key" | "value", val: string) => {
    setHeaders((prev) => prev.map((h) => (h.id === id ? { ...h, [field]: val } : h)))
  }

  const handleSend = useCallback(() => {
    setSending(true)
    const start = Date.now()
    // Simulated request
    setTimeout(() => {
      const elapsed = Date.now() - start + 400
      const mockResponse = {
        status: 200,
        elapsed,
        size: "1.2 KB",
        body: JSON.stringify(
          {
            id: "chatcmpl-abc123",
            object: "chat.completion",
            created: Math.floor(Date.now() / 1000),
            model: "gpt-4",
            choices: [
              {
                index: 0,
                message: { role: "assistant", content: "你好！有什么可以帮助你的吗？" },
                finish_reason: "stop",
              },
            ],
            usage: { prompt_tokens: 9, completion_tokens: 12, total_tokens: 21 },
          },
          null,
          2,
        ),
        headers: {
          "content-type": "application/json",
          "x-request-id": `req-${Date.now().toString(36)}`,
          "openai-processing-ms": String(elapsed),
        },
      }
      setResponse(mockResponse)
      setSending(false)

      // Add to history
      addEntry({
        id: `h-${Date.now()}`,
        method,
        upstream,
        path,
        status: mockResponse.status,
        elapsed: mockResponse.elapsed,
        timestamp: Date.now(),
      })
    }, 800)
  }, [method, upstream, path, addEntry])

  const loadFromHistory = useCallback((entry: PlaygroundHistoryEntry) => {
    setMethod(entry.method)
    setUpstream(entry.upstream)
    setPath(entry.path)
    setHistoryOpen(false)
  }, [])

  const statusColor = response
    ? response.status >= 200 && response.status < 300
      ? "text-emerald-400"
      : response.status >= 400 && response.status < 500
        ? "text-amber-400"
        : response.status >= 500
          ? "text-red-400"
          : "text-muted-foreground"
    : ""

  return (
    <div className="flex flex-col gap-4">
      {/* URL Bar */}
      <div className="hidden sm:flex items-center gap-0 rounded-lg border border-border bg-card overflow-hidden">
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger className="h-10 w-24 rounded-none border-0 border-r border-border bg-muted/50 text-xs font-mono font-semibold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["GET", "POST", "PUT", "DELETE", "PATCH"].map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={upstream} onValueChange={setUpstream}>
          <SelectTrigger className="h-10 w-40 rounded-none border-0 border-r border-border bg-muted/50 text-xs font-mono">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {upstreams.map((u) => (
              <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          value={path}
          onChange={(e) => setPath(e.target.value)}
          className="h-10 flex-1 rounded-none border-0 font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="/v1/chat/completions"
        />

        <Button onClick={handleSend} disabled={sending} className="h-10 rounded-none rounded-r-lg gap-2 px-5">
          <Send className="size-3.5" />
          {sending ? "发送中..." : "发送"}
        </Button>
      </div>

      {/* Mobile URL Bar */}
      <div className="flex sm:hidden flex-col gap-2 rounded-lg border border-border bg-card p-3">
        <div className="flex items-center gap-2">
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className="h-9 w-24 text-xs font-mono font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["GET", "POST", "PUT", "DELETE", "PATCH"].map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={upstream} onValueChange={setUpstream}>
            <SelectTrigger className="h-9 flex-1 text-xs font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {upstreams.map((u) => (
                <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={path}
            onChange={(e) => setPath(e.target.value)}
            className="h-9 flex-1 font-mono text-sm"
            placeholder="/v1/chat/completions"
          />
          <Button onClick={handleSend} disabled={sending} size="sm" className="h-9 gap-1.5">
            <Send className="size-3.5" />
            {sending ? "..." : "发送"}
          </Button>
        </div>
      </div>

      {/* Split layout: Request (left) + Response (right) on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Request panel */}
        <div className="flex flex-col gap-4">
          <Tabs defaultValue="body" className="flex flex-col">
            <TabsList className="w-fit">
              <TabsTrigger value="body" className="text-xs">{"请求体"}</TabsTrigger>
              <TabsTrigger value="headers" className="text-xs">
                {"请求头"}
                <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">{headers.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="body" className="mt-3">
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="min-h-[240px] lg:min-h-[320px] font-mono text-xs leading-relaxed resize-y"
                placeholder={'{\n  "model": "gpt-4",\n  "messages": [...]\n}'}
              />
            </TabsContent>

            <TabsContent value="headers" className="mt-3">
              <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
                {headers.map((h) => (
                  <div key={h.id} className="flex items-center gap-2">
                    <Input
                      value={h.key}
                      onChange={(e) => updateHeader(h.id, "key", e.target.value)}
                      placeholder="Header"
                      className="h-8 text-xs font-mono flex-1"
                    />
                    <Input
                      value={h.value}
                      onChange={(e) => updateHeader(h.id, "value", e.target.value)}
                      placeholder="Value"
                      className="h-8 text-xs font-mono flex-[2]"
                    />
                    <Button variant="ghost" size="icon" className="size-7 shrink-0 text-muted-foreground hover:text-red-400" onClick={() => removeHeader(h.id)}>
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="h-7 w-fit gap-1.5 text-xs mt-1" onClick={addHeader}>
                  <Plus className="size-3" />
                  {"添加"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* History section */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <button
              className="flex w-full items-center gap-2 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
              onClick={() => setHistoryOpen(!historyOpen)}
            >
              {historyOpen ? <ChevronDown className="size-3.5 text-muted-foreground" /> : <ChevronRight className="size-3.5 text-muted-foreground" />}
              <Clock className="size-3.5 text-muted-foreground" />
              {"请求历史"}
              {history.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">{history.length}</Badge>
              )}
              {history.length > 0 && historyOpen && (
                <button
                  className="ml-auto text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  onClick={(e) => { e.stopPropagation(); clearHistory() }}
                >
                  <RotateCcw className="size-2.5" />
                  {"清除"}
                </button>
              )}
            </button>
            {historyOpen && (
              <div className="border-t border-border">
                {history.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    {"尚无请求记录"}
                  </div>
                ) : (
                  <ScrollArea className="max-h-48">
                    <div className="flex flex-col divide-y divide-border">
                      {history.map((entry) => (
                        <button
                          key={entry.id}
                          className="flex items-center gap-3 px-3 py-2 text-left hover:bg-muted/50 transition-colors"
                          onClick={() => loadFromHistory(entry)}
                        >
                          <span className={cn("font-mono text-[11px] font-semibold w-12 shrink-0", getMethodColor(entry.method))}>{entry.method}</span>
                          <span className={cn("font-mono text-[11px] font-semibold tabular-nums w-8 shrink-0", getStatusColor(entry.status))}>{entry.status}</span>
                          <span className="text-xs text-muted-foreground font-mono truncate flex-1">{entry.path}</span>
                          <span className="text-[10px] text-muted-foreground font-mono tabular-nums shrink-0">{entry.elapsed}ms</span>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Response panel */}
        <div className="rounded-lg border border-border bg-card flex flex-col overflow-hidden">
          {!response && !sending ? (
            <div className="flex-1 flex items-center justify-center py-16 lg:py-0">
              <div className="text-center">
                <Send className="size-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">{"发送请求以查看响应"}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">{"Ctrl+Enter 快速发送"}</p>
              </div>
            </div>
          ) : sending ? (
            <div className="flex-1 flex items-center justify-center py-16 lg:py-0">
              <div className="flex flex-col items-center gap-3">
                <div className="size-6 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">{"请求中..."}</span>
              </div>
            </div>
          ) : response ? (
            <>
              {/* Response header bar */}
              <div className="flex items-center gap-3 px-3 sm:px-4 py-2.5 border-b border-border bg-muted/30 flex-wrap">
                <Badge variant="outline" className={cn("font-mono text-xs font-semibold tabular-nums", statusColor)}>
                  {response.status}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono tabular-nums">{response.elapsed}ms</span>
                <span className="text-xs text-muted-foreground">{response.size}</span>
                <div className="ml-auto">
                  <CopyButton text={response.body} />
                </div>
              </div>

              {/* Response tabs */}
              <Tabs defaultValue="body" className="flex flex-col flex-1">
                <TabsList className="w-fit mx-3 mt-3">
                  <TabsTrigger value="body" className="text-xs">{"响应体"}</TabsTrigger>
                  <TabsTrigger value="headers" className="text-xs">{"响应头"}</TabsTrigger>
                </TabsList>
                <TabsContent value="body" className="flex-1 px-3 pb-3 mt-2">
                  <ScrollArea className="h-[260px] lg:h-[360px]">
                    <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-all leading-relaxed p-2">
                      {response.body}
                    </pre>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="headers" className="flex-1 px-3 pb-3 mt-2">
                  <div className="flex flex-col gap-1.5">
                    {Object.entries(response.headers).map(([key, value]) => (
                      <div key={key} className="flex flex-col sm:flex-row sm:gap-2 text-xs">
                        <span className="font-mono text-muted-foreground shrink-0">{key}:</span>
                        <span className="font-mono text-foreground break-all">{value}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default function PlaygroundPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">
          {"演练场"}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {"向配置的上游发送请求，或重放日志中的请求"}
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
        <PlaygroundInner />
      </Suspense>
    </div>
  )
}
