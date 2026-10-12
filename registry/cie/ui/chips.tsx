"use client"

import * as React from "react"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { cieTransition } from "@/lib/cie-motion"

// UI · Filter chips (Material filter-chip lineage) on Radix ToggleGroup type="multiple".
// - Each chip is an outlined pill; "on" inverts to ink (bg-primary) on --cie-t-cell expo.
// - A check icon grows in from zero width + scale (cieTransition.cell), nudging the label over.
// - Tap scale from --cie-press-scale. Roving focus + arrow keys from Radix.
// Reduced motion: the check appears/disappears instantly, no press scale.

const ChipsCtx = React.createContext<string[]>([])

type ChipsProps = Omit<
  React.ComponentProps<typeof ToggleGroupPrimitive.Root>,
  "type" | "value" | "defaultValue" | "onValueChange"
> & {
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}

function Chips({ value: valueProp, defaultValue, onValueChange, className, ...props }: ChipsProps) {
  const [inner, setInner] = React.useState<string[]>(defaultValue ?? [])
  const value = valueProp ?? inner
  return (
    <ChipsCtx.Provider value={value}>
      <ToggleGroupPrimitive.Root
        data-slot="chips"
        type="multiple"
        value={value}
        onValueChange={(v: string[]) => {
          setInner(v)
          onValueChange?.(v)
        }}
        className={cn("flex flex-wrap items-center gap-2", className)}
        {...props}
      />
    </ChipsCtx.Provider>
  )
}

function Chip({ className, value, children, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  const selected = React.useContext(ChipsCtx).includes(value)
  const reduce = useReducedMotion()
  return (
    <ToggleGroupPrimitive.Item
      data-slot="chip"
      value={value}
      className={cn(
        "inline-flex h-8 items-center rounded-full border border-border px-3.5 text-sm font-[400] whitespace-nowrap text-foreground select-none",
        "transition-[background-color,color,border-color,font-weight,scale] duration-[var(--cie-t-cell,320ms)] ease-cie-expo",
        "hover:border-foreground/40 active:scale-[var(--cie-press-scale,0.97)] active:duration-[var(--cie-t-snap,120ms)] motion-reduce:active:scale-100",
        "data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:font-[520] data-[state=on]:text-primary-foreground",
        "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40",
        className
      )}
      {...props}
    >
      <AnimatePresence initial={false}>
        {selected && (
          <motion.span
            data-slot="chip-check"
            aria-hidden
            className="-ml-1 inline-flex shrink-0 items-center overflow-hidden"
            initial={{ width: 0, scale: 0.4, opacity: 0 }}
            animate={{ width: "auto", scale: 1, opacity: 1 }}
            exit={{ width: 0, scale: 0.4, opacity: 0 }}
            transition={reduce ? { duration: 0 } : cieTransition.cell}
          >
            <CheckIcon className="mr-1.5 size-3.5" strokeWidth={2.25} />
          </motion.span>
        )}
      </AnimatePresence>
      <span data-slot="chip-label">{children}</span>
    </ToggleGroupPrimitive.Item>
  )
}

export { Chip, Chips }
