"use client"

import { useState } from "react"
import { Check, ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface MultiSelectProps {
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)

  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value))
    } else {
      onChange([...selected, value])
    }
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange([])
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-8 justify-between text-sm font-normal",
            selected.length === 0 && "text-muted-foreground",
            className
          )}
        >
          <span className="flex items-center gap-1.5 truncate">
            {selected.length === 0 ? (
              placeholder
            ) : selected.length <= 2 ? (
              <span className="flex items-center gap-1">
                {selected.map((s) => (
                  <Badge
                    key={s}
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 font-mono"
                  >
                    {options.find((o) => o.value === s)?.label ?? s}
                  </Badge>
                ))}
              </span>
            ) : (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0"
              >
                {selected.length} {"项已选"}
              </Badge>
            )}
          </span>
          <span className="flex items-center gap-0.5 shrink-0">
            {selected.length > 0 && (
              <span
                role="button"
                tabIndex={0}
                className="rounded-sm p-0.5 hover:bg-muted"
                onClick={clear}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    clear(e as unknown as React.MouseEvent)
                  }
                }}
              >
                <X className="size-3 text-muted-foreground" />
              </span>
            )}
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0" align="start">
        <Command>
          <CommandInput placeholder={`${placeholder}...`} className="h-8" />
          <CommandList>
            <CommandEmpty>{"无匹配项"}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggle(option.value)}
                  >
                    <div
                      className={cn(
                        "flex size-4 items-center justify-center rounded-sm border border-input",
                        isSelected && "bg-primary border-primary"
                      )}
                    >
                      {isSelected && (
                        <Check className="size-3 text-primary-foreground" />
                      )}
                    </div>
                    <span className="text-sm">{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
