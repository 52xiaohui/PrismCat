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

export const upstreams: Upstream[] = [
  {
    id: "up-1",
    name: "openai-main",
    targetUrl: "https://api.openai.com/v1",
    timeout: 30000,
    proxyAddress: "https://proxy.example.com/openai-main",
  },
  {
    id: "up-2",
    name: "anthropic-prod",
    targetUrl: "https://api.anthropic.com/v1",
    timeout: 60000,
    proxyAddress: "https://proxy.example.com/anthropic-prod",
  },
  {
    id: "up-3",
    name: "local-llm",
    targetUrl: "http://localhost:8080/v1",
    timeout: 120000,
    proxyAddress: "https://proxy.example.com/local-llm",
  },
]

export const mockLogs: LogEntry[] = [
  {
    id: "log-a1b2c3d4",
    method: "POST",
    status: 200,
    upstream: "openai-main",
    path: "/v1/chat/completions",
    latency: 1243,
    time: "2026-02-24T10:32:15Z",
    streaming: true,
    tag: "production",
    targetUrl: "https://api.openai.com/v1/chat/completions",
    requestHeaders: {
      "Content-Type": "application/json",
      Authorization: "Bearer sk-***...***3f",
      "X-Request-ID": "req-a1b2c3d4",
    },
    requestBody: JSON.stringify(
      {
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Explain quantum computing" },
        ],
        stream: true,
      },
      null,
      2
    ),
    responseHeaders: {
      "Content-Type": "text/event-stream",
      "X-Request-ID": "req-a1b2c3d4",
      "openai-processing-ms": "1200",
    },
    responseBody:
      'data: {"choices":[{"delta":{"content":"Quantum computing uses..."}}]}\n\ndata: [DONE]',
  },
  {
    id: "log-e5f6g7h8",
    method: "POST",
    status: 200,
    upstream: "anthropic-prod",
    path: "/v1/messages",
    latency: 856,
    time: "2026-02-24T10:31:42Z",
    streaming: false,
    targetUrl: "https://api.anthropic.com/v1/messages",
    requestHeaders: {
      "Content-Type": "application/json",
      "x-api-key": "sk-ant-***...***9a",
      "anthropic-version": "2023-06-01",
    },
    requestBody: JSON.stringify(
      {
        model: "claude-3-sonnet-20240229",
        max_tokens: 1024,
        messages: [{ role: "user", content: "Write a haiku about APIs" }],
      },
      null,
      2
    ),
    responseHeaders: {
      "Content-Type": "application/json",
      "request-id": "req-e5f6g7h8",
    },
    responseBody: JSON.stringify(
      {
        content: [
          {
            type: "text",
            text: "Requests flow like streams\nJSON whispers through the wire\nResponses return",
          },
        ],
        model: "claude-3-sonnet-20240229",
        usage: { input_tokens: 12, output_tokens: 24 },
      },
      null,
      2
    ),
  },
  {
    id: "log-i9j0k1l2",
    method: "POST",
    status: 429,
    upstream: "openai-main",
    path: "/v1/chat/completions",
    latency: 45,
    time: "2026-02-24T10:30:58Z",
    streaming: false,
    tag: "rate-limited",
    targetUrl: "https://api.openai.com/v1/chat/completions",
    requestHeaders: {
      "Content-Type": "application/json",
      Authorization: "Bearer sk-***...***7e",
    },
    requestBody: JSON.stringify(
      {
        model: "gpt-4",
        messages: [{ role: "user", content: "Hello" }],
      },
      null,
      2
    ),
    responseHeaders: {
      "Content-Type": "application/json",
      "retry-after": "20",
      "x-ratelimit-remaining-requests": "0",
    },
    responseBody: JSON.stringify(
      {
        error: {
          message: "Rate limit reached for gpt-4",
          type: "tokens",
          code: "rate_limit_exceeded",
        },
      },
      null,
      2
    ),
  },
  {
    id: "log-m3n4o5p6",
    method: "GET",
    status: 200,
    upstream: "openai-main",
    path: "/v1/models",
    latency: 132,
    time: "2026-02-24T10:29:30Z",
    streaming: false,
    targetUrl: "https://api.openai.com/v1/models",
    requestHeaders: {
      Authorization: "Bearer sk-***...***3f",
    },
    requestBody: null,
    responseHeaders: {
      "Content-Type": "application/json",
    },
    responseBody: JSON.stringify(
      {
        data: [
          { id: "gpt-4", object: "model" },
          { id: "gpt-3.5-turbo", object: "model" },
        ],
      },
      null,
      2
    ),
  },
  {
    id: "log-q7r8s9t0",
    method: "POST",
    status: 500,
    upstream: "local-llm",
    path: "/v1/chat/completions",
    latency: 5023,
    time: "2026-02-24T10:28:15Z",
    streaming: true,
    tag: "error",
    targetUrl: "http://localhost:8080/v1/chat/completions",
    requestHeaders: {
      "Content-Type": "application/json",
    },
    requestBody: JSON.stringify(
      {
        model: "llama-2-70b",
        messages: [{ role: "user", content: "Analyze this document..." }],
        stream: true,
      },
      null,
      2
    ),
    responseHeaders: {
      "Content-Type": "application/json",
    },
    responseBody: JSON.stringify(
      {
        error: {
          message: "Internal server error: CUDA out of memory",
          type: "server_error",
        },
      },
      null,
      2
    ),
  },
  {
    id: "log-u1v2w3x4",
    method: "POST",
    status: 200,
    upstream: "anthropic-prod",
    path: "/v1/messages",
    latency: 2341,
    time: "2026-02-24T10:27:00Z",
    streaming: true,
    targetUrl: "https://api.anthropic.com/v1/messages",
    requestHeaders: {
      "Content-Type": "application/json",
      "x-api-key": "sk-ant-***...***9a",
      "anthropic-version": "2023-06-01",
    },
    requestBody: JSON.stringify(
      {
        model: "claude-3-opus-20240229",
        max_tokens: 4096,
        messages: [
          { role: "user", content: "Translate this to Japanese: Hello World" },
        ],
        stream: true,
      },
      null,
      2
    ),
    responseHeaders: {
      "Content-Type": "text/event-stream",
    },
    responseBody:
      'event: content_block_delta\ndata: {"delta":{"text":"\\u3053\\u3093\\u306b\\u3061\\u306f\\u4e16\\u754c"}}\n\nevent: message_stop',
  },
  {
    id: "log-y5z6a7b8",
    method: "DELETE",
    status: 404,
    upstream: "openai-main",
    path: "/v1/files/file-abc123",
    latency: 89,
    time: "2026-02-24T10:25:30Z",
    streaming: false,
    targetUrl: "https://api.openai.com/v1/files/file-abc123",
    requestHeaders: {
      Authorization: "Bearer sk-***...***3f",
    },
    requestBody: null,
    responseHeaders: {
      "Content-Type": "application/json",
    },
    responseBody: JSON.stringify(
      {
        error: {
          message: "No such file: file-abc123",
          type: "invalid_request_error",
          code: "resource_not_found",
        },
      },
      null,
      2
    ),
  },
  {
    id: "log-c9d0e1f2",
    method: "PUT",
    status: 200,
    upstream: "local-llm",
    path: "/v1/models/llama-2-70b/config",
    latency: 67,
    time: "2026-02-24T10:24:00Z",
    streaming: false,
    tag: "admin",
    targetUrl: "http://localhost:8080/v1/models/llama-2-70b/config",
    requestHeaders: {
      "Content-Type": "application/json",
      Authorization: "Bearer admin-token",
    },
    requestBody: JSON.stringify(
      {
        max_batch_size: 32,
        temperature_default: 0.7,
      },
      null,
      2
    ),
    responseHeaders: {
      "Content-Type": "application/json",
    },
    responseBody: JSON.stringify({ status: "ok", updated: true }, null, 2),
  },
]

export function getStats() {
  const total = mockLogs.length
  const success = mockLogs.filter(
    (l) => l.status >= 200 && l.status < 300
  ).length
  const errors = mockLogs.filter((l) => l.status >= 400).length
  const streaming = mockLogs.filter((l) => l.streaming).length
  const avgLatency = Math.round(
    mockLogs.reduce((sum, l) => sum + l.latency, 0) / total
  )
  const upstreamCount = new Set(mockLogs.map((l) => l.upstream)).size
  return { total, success, errors, streaming, avgLatency, upstreamCount }
}

export interface TimeSeriesPoint {
  time: string
  requests: number
  errors: number
  latency: number
}

export const timeSeriesData: TimeSeriesPoint[] = [
  { time: "00:00", requests: 12, errors: 1, latency: 420 },
  { time: "01:00", requests: 8, errors: 0, latency: 380 },
  { time: "02:00", requests: 5, errors: 0, latency: 350 },
  { time: "03:00", requests: 3, errors: 0, latency: 310 },
  { time: "04:00", requests: 4, errors: 1, latency: 490 },
  { time: "05:00", requests: 6, errors: 0, latency: 360 },
  { time: "06:00", requests: 15, errors: 0, latency: 400 },
  { time: "07:00", requests: 28, errors: 2, latency: 520 },
  { time: "08:00", requests: 45, errors: 3, latency: 680 },
  { time: "09:00", requests: 62, errors: 2, latency: 750 },
  { time: "10:00", requests: 78, errors: 4, latency: 890 },
  { time: "11:00", requests: 85, errors: 3, latency: 820 },
  { time: "12:00", requests: 72, errors: 2, latency: 760 },
  { time: "13:00", requests: 68, errors: 1, latency: 710 },
  { time: "14:00", requests: 82, errors: 5, latency: 920 },
  { time: "15:00", requests: 90, errors: 3, latency: 850 },
  { time: "16:00", requests: 88, errors: 2, latency: 800 },
  { time: "17:00", requests: 75, errors: 4, latency: 870 },
  { time: "18:00", requests: 58, errors: 1, latency: 620 },
  { time: "19:00", requests: 42, errors: 2, latency: 550 },
  { time: "20:00", requests: 35, errors: 1, latency: 480 },
  { time: "21:00", requests: 28, errors: 0, latency: 420 },
  { time: "22:00", requests: 20, errors: 1, latency: 390 },
  { time: "23:00", requests: 15, errors: 0, latency: 360 },
]

export interface UpstreamDistribution {
  name: string
  value: number
  fill: string
}

export const upstreamDistribution: UpstreamDistribution[] = [
  { name: "openai-main", value: 4, fill: "var(--color-chart-1)" },
  { name: "anthropic-prod", value: 2, fill: "var(--color-chart-2)" },
  { name: "local-llm", value: 2, fill: "var(--color-chart-3)" },
]

export interface StatusDistribution {
  name: string
  value: number
  fill: string
}

export const statusDistribution: StatusDistribution[] = [
  { name: "2xx", value: 5, fill: "oklch(0.62 0.19 145)" },
  { name: "4xx", value: 2, fill: "oklch(0.75 0.18 85)" },
  { name: "5xx", value: 1, fill: "oklch(0.577 0.245 27.325)" },
]
