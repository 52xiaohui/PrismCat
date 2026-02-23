export interface LogEntry {
  id: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  status: number
  upstream: string
  path: string
  latency: number
  time: string
  streaming: boolean
  tag?: string
  targetUrl: string
  requestHeaders: Record<string, string>
  requestBody: string | null
  responseHeaders: Record<string, string>
  responseBody: string | null
}

export interface Upstream {
  id: string
  name: string
  targetUrl: string
  timeout: number
  proxyAddress: string
}

export interface TimeSeriesPoint {
  time: string
  requests: number
  errors: number
  latency: number
}

export interface UpstreamDistribution {
  name: string
  value: number
  fill: string
}

export interface StatusDistribution {
  name: string
  value: number
  fill: string
}

export interface Stats {
  total: number
  success: number
  errors: number
  streaming: number
  avgLatency: number
  upstreamCount: number
}

export interface PlaygroundHistoryEntry {
  id: string
  method: string
  upstream: string
  path: string
  status: number
  elapsed: number
  timestamp: number
}
