"use client"

import { useState } from "react"
import {
  Plus,
  Trash2,
  Copy,
  Check,
  Save,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { upstreams as initialUpstreams, type Upstream } from "@/lib/mock-data"

function UpstreamsTab() {
  const [list, setList] = useState<Upstream[]>(initialUpstreams)
  const [name, setName] = useState("")
  const [targetUrl, setTargetUrl] = useState("")
  const [timeout, setTimeout_] = useState("30000")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const addUpstream = () => {
    if (!name || !targetUrl) return
    const newUp: Upstream = {
      id: `up-${Date.now()}`,
      name,
      targetUrl,
      timeout: parseInt(timeout) || 30000,
      proxyAddress: `https://proxy.example.com/${name}`,
    }
    setList([...list, newUp])
    setName("")
    setTargetUrl("")
    setTimeout_("30000")
    toast.success(`\u4e0a\u6e38 "${name}" \u5df2\u6dfb\u52a0`)
  }

  const removeUpstream = (id: string) => {
    const target = list.find((u) => u.id === id)
    setList(list.filter((u) => u.id !== id))
    if (target) toast.info(`\u4e0a\u6e38 "${target.name}" \u5df2\u79fb\u9664`)
  }

  const copyProxyAddress = (upstream: Upstream) => {
    navigator.clipboard.writeText(upstream.proxyAddress)
    setCopiedId(upstream.id)
    window.setTimeout(() => setCopiedId(null), 1500)
    toast.success("\u5df2\u590d\u5236\u4ee3\u7406\u5730\u5740")
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Add form */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-medium text-foreground mb-4">
          {"\u6dfb\u52a0\u4e0a\u6e38"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">
              {"\u540d\u79f0"}
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="openai-main"
              className="h-8 text-sm font-mono"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">
              {"\u76ee\u6807 URL"}
            </Label>
            <Input
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="h-8 text-sm font-mono"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">
              {"\u8d85\u65f6\u65f6\u95f4 (ms)"}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                value={timeout}
                onChange={(e) => setTimeout_(e.target.value)}
                placeholder="30000"
                className="h-8 text-sm font-mono tabular-nums"
                type="number"
              />
              <Button size="sm" className="h-8 gap-1.5" onClick={addUpstream}>
                <Plus className="size-3.5" />
                {"\u6dfb\u52a0"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2">
        {list.map((upstream) => (
          <div
            key={upstream.id}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border border-border bg-card px-3 sm:px-4 py-3"
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm font-medium text-foreground font-mono">
                {upstream.name}
              </span>
              <span className="text-xs text-muted-foreground font-mono truncate">
                {upstream.targetUrl}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {"\u8d85\u65f6"}: {upstream.timeout}ms
              </span>
            </div>
            <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 text-xs text-muted-foreground"
                onClick={() => copyProxyAddress(upstream)}
              >
                {copiedId === upstream.id ? (
                  <Check className="size-3 text-emerald-400" />
                ) : (
                  <Copy className="size-3" />
                )}
                <span className="hidden xs:inline">{"\u590d\u5236\u4ee3\u7406\u5730\u5740"}</span>
                <span className="xs:hidden">{"\u590d\u5236"}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-destructive-foreground"
                onClick={() => removeUpstream(upstream.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            {"\u6682\u65e0\u4e0a\u6e38\u914d\u7f6e"}
          </div>
        )}
      </div>
    </div>
  )
}

function LoggingTab() {
  const [maxReqBody, setMaxReqBody] = useState("512")
  const [maxResBody, setMaxResBody] = useState("512")
  const [separateThreshold, setSeparateThreshold] = useState("256")
  const [previewSize, setPreviewSize] = useState("128")
  const [storeBase64, setStoreBase64] = useState(false)
  const [sensitiveHeaders, setSensitiveHeaders] = useState(
    "authorization\nx-api-key\ncookie"
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">
            {"\u6700\u5927\u8bf7\u6c42\u4f53\u5927\u5c0f (KB)"}
          </Label>
          <Input
            value={maxReqBody}
            onChange={(e) => setMaxReqBody(e.target.value)}
            className="h-8 text-sm font-mono tabular-nums"
            type="number"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">
            {"\u6700\u5927\u54cd\u5e94\u4f53\u5927\u5c0f (KB)"}
          </Label>
          <Input
            value={maxResBody}
            onChange={(e) => setMaxResBody(e.target.value)}
            className="h-8 text-sm font-mono tabular-nums"
            type="number"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">
            {"\u4f53\u5206\u79bb\u9608\u503c (KB)"}
          </Label>
          <Input
            value={separateThreshold}
            onChange={(e) => setSeparateThreshold(e.target.value)}
            className="h-8 text-sm font-mono tabular-nums"
            type="number"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">
            {"\u5206\u79bb\u4f53\u9884\u89c8\u5927\u5c0f (KB)"}
          </Label>
          <Input
            value={previewSize}
            onChange={(e) => setPreviewSize(e.target.value)}
            className="h-8 text-sm font-mono tabular-nums"
            type="number"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
        <Switch
          checked={storeBase64}
          onCheckedChange={setStoreBase64}
          id="store-base64"
        />
        <Label htmlFor="store-base64" className="text-sm text-foreground cursor-pointer">
          {"\u5b58\u50a8 Base64 \u6570\u636e"}
        </Label>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">
          {"\u654f\u611f\u5934\u5b57\u6bb5"}
        </Label>
        <Textarea
          value={sensitiveHeaders}
          onChange={(e) => setSensitiveHeaders(e.target.value)}
          className="min-h-[100px] font-mono text-xs leading-relaxed bg-card"
          placeholder={"\u6bcf\u884c\u4e00\u4e2a\u5934\u5b57\u6bb5\u540d\u79f0"}
        />
        <p className="text-[10px] text-muted-foreground">
          {"\u6bcf\u884c\u4e00\u4e2a\u5934\u5b57\u6bb5\u540d\u79f0\uff0c\u8fd9\u4e9b\u5b57\u6bb5\u5c06\u5728\u65e5\u5fd7\u4e2d\u88ab\u8131\u654f"}
        </p>
      </div>
    </div>
  )
}

function StorageTab() {
  const [retentionDays, setRetentionDays] = useState("30")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5 max-w-xs">
        <Label className="text-xs text-muted-foreground">
          {"\u4fdd\u7559\u5929\u6570"}
        </Label>
        <Input
          value={retentionDays}
          onChange={(e) => setRetentionDays(e.target.value)}
          className="h-8 text-sm font-mono tabular-nums"
          type="number"
        />
        <p className="text-[10px] text-muted-foreground">
          {"\u8bbe\u4e3a 0 \u8868\u793a\u6c38\u4e45\u4fdd\u7559"}
        </p>
      </div>

      <div className="flex flex-col gap-1.5 max-w-lg">
        <Label className="text-xs text-muted-foreground">
          {"\u6570\u636e\u5e93\u8def\u5f84"}
        </Label>
        <Input
          value="/data/prismcat.db"
          readOnly
          className="h-8 text-sm font-mono text-muted-foreground bg-muted/50"
        />
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true)
    // Simulate async save
    setTimeout(() => {
      setSaving(false)
      toast.success("\u8bbe\u7f6e\u5df2\u4fdd\u5b58", {
        description: "\u914d\u7f6e\u5df2\u6210\u529f\u66f4\u65b0",
      })
    }, 600)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">
          {"\u8bbe\u7f6e"}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {"\u7ba1\u7406\u4e0a\u6e38\u914d\u7f6e\u3001\u65e5\u5fd7\u8bb0\u5f55\u4e0e\u5b58\u50a8\u7b56\u7565"}
        </p>
      </div>

      <Tabs defaultValue="upstreams">
        <TabsList>
          <TabsTrigger value="upstreams">
            {"\u4e0a\u6e38\u914d\u7f6e"}
          </TabsTrigger>
          <TabsTrigger value="logging">
            {"\u65e5\u5fd7\u8bb0\u5f55"}
          </TabsTrigger>
          <TabsTrigger value="storage">
            {"\u5b58\u50a8\u8bbe\u7f6e"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upstreams">
          <UpstreamsTab />
        </TabsContent>

        <TabsContent value="logging">
          <LoggingTab />
        </TabsContent>

        <TabsContent value="storage">
          <StorageTab />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button className="gap-1.5" onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Save className="size-3.5" />
          )}
          {saving ? "\u4fdd\u5b58\u4e2d..." : "\u4fdd\u5b58\u8bbe\u7f6e"}
        </Button>
      </div>
    </div>
  )
}
