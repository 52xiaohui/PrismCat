"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  FileText,
  Play,
  Settings,
  Search,
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { mockLogs } from "@/lib/mock-data"

const pages = [
  { name: "\u4eea\u8868\u76d8", href: "/dashboard", icon: BarChart3 },
  { name: "\u65e5\u5fd7", href: "/", icon: FileText },
  { name: "\u6f14\u7ec3\u573a", href: "/playground", icon: Play },
  { name: "\u8bbe\u7f6e", href: "/settings", icon: Settings },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  const navigate = useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router]
  )

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={"\u641c\u7d22\u9875\u9762\u3001\u65e5\u5fd7 ID\u3001\u8def\u5f84..."} />
      <CommandList>
        <CommandEmpty>{"\u672a\u627e\u5230\u7ed3\u679c"}</CommandEmpty>
        <CommandGroup heading={"\u9875\u9762"}>
          {pages.map((page) => (
            <CommandItem
              key={page.href}
              onSelect={() => navigate(page.href)}
            >
              <page.icon className="size-4 mr-2" />
              {page.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading={"\u6700\u8fd1\u65e5\u5fd7"}>
          {mockLogs.slice(0, 5).map((log) => (
            <CommandItem
              key={log.id}
              onSelect={() => navigate(`/?search=${encodeURIComponent(log.id)}`)}
            >
              <Search className="size-4 mr-2" />
              <span className="font-mono text-xs">
                {log.method} {log.path}
              </span>
              <span className="ml-auto text-xs text-muted-foreground font-mono">
                {log.id}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
