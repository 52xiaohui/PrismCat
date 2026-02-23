export function getMethodColor(method: string) {
  switch (method) {
    case "GET":
      return "text-emerald-400"
    case "POST":
      return "text-sky-400"
    case "PUT":
      return "text-amber-400"
    case "DELETE":
      return "text-red-400"
    case "PATCH":
      return "text-orange-400"
    default:
      return "text-muted-foreground"
  }
}

export function getStatusColor(status: number) {
  if (status >= 200 && status < 300) return "text-emerald-400"
  if (status >= 400 && status < 500) return "text-amber-400"
  if (status >= 500) return "text-red-400"
  return "text-muted-foreground"
}

export function getMethodBadgeClass(method: string) {
  switch (method) {
    case "GET":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
    case "POST":
      return "bg-sky-500/15 text-sky-400 border-sky-500/30"
    case "PUT":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30"
    case "DELETE":
      return "bg-red-500/15 text-red-400 border-red-500/30"
    case "PATCH":
      return "bg-orange-500/15 text-orange-400 border-orange-500/30"
    default:
      return "bg-muted text-muted-foreground border-border"
  }
}

/**
 * Format time as HH:MM:SS using UTC to avoid hydration mismatches
 * between server and client (different timezones).
 */
export function formatTime(time: string) {
  const date = new Date(time)
  const h = String(date.getUTCHours()).padStart(2, "0")
  const m = String(date.getUTCMinutes()).padStart(2, "0")
  const s = String(date.getUTCSeconds()).padStart(2, "0")
  return `${h}:${m}:${s}`
}

export function exportAsJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportAsCsv(
  rows: Record<string, unknown>[],
  filename: string
) {
  if (rows.length === 0) return
  const keys = Object.keys(rows[0])
  const csv = [
    keys.join(","),
    ...rows.map((r) =>
      keys
        .map((k) => {
          const v = String(r[k] ?? "")
          return v.includes(",") || v.includes('"')
            ? `"${v.replace(/"/g, '""')}"`
            : v
        })
        .join(",")
    ),
  ].join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
