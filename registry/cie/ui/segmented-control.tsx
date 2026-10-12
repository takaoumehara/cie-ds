"use client"

import * as React from "react"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"
import { motion, MotionConfig, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { cieTransition } from "@/lib/cie-motion"

// UI · Segmented control (iOS / animated-tabs lineage) on Radix ToggleGroup type="single".
// - Exactly one segment is always selected: an empty value (re-clicking the active item) is ignored.
// - A shared-layout ink pill glides between segments on cieTransition.spring; the selected label
//   turns primary-foreground on --cie-t-cell expo. Roving focus + arrow keys from Radix.
// Reduced motion: MotionConfig "always" → the pill jumps.

type Ctx = { value: string; id: string }
const SegmentedCtx = React.createContext<Ctx>({ value: "", id: "" })

type SegmentedControlProps = Omit<
  React.ComponentProps<typeof ToggleGroupPrimitive.Root>,
  "type" | "value" | "defaultValue" | "onValueChange"
> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

function SegmentedControl({
  value: valueProp,
  defaultValue,
  onValueChange,
  className,
  ...props
}: SegmentedControlProps) {
  const [inner, setInner] = React.useState(defaultValue ?? "")
  const value = valueProp ?? inner
  const id = React.useId()
  const reduce = useReducedMotion()
  return (
    <SegmentedCtx.Provider value={{ value, id }}>
      <MotionConfig reducedMotion={reduce ? "always" : "never"}>
        <ToggleGroupPrimitive.Root
          data-slot="segmented-control"
          type="single"
          value={value}
          onValueChange={(v: string) => {
            if (!v) return
            setInner(v)
            onValueChange?.(v)
          }}
          className={cn(
            "relative inline-flex w-fit items-center gap-1 rounded-full border border-border p-1",
            className
          )}
          {...props}
        />
      </MotionConfig>
    </SegmentedCtx.Provider>
  )
}

function SegmentedControlItem({
  className,
  value,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  const ctx = React.useContext(SegmentedCtx)
  const active = ctx.value === value
  return (
    <ToggleGroupPrimitive.Item
      data-slot="segmented-control-item"
      value={value}
      className={cn(
        "relative inline-flex h-8 flex-1 items-center justify-center rounded-full px-4 text-sm font-[400] whitespace-nowrap text-muted-foreground",
        "transition-[color,font-weight] duration-[var(--cie-t-cell,320ms)] ease-cie-expo hover:text-foreground",
        "data-[state=on]:font-[520] data-[state=on]:text-primary-foreground",
        "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40",
        className
      )}
      {...props}
    >
      {active && (
        <motion.span
          data-slot="segmented-control-pill"
          layoutId={`${ctx.id}-pill`}
          className="absolute inset-0 rounded-full bg-primary"
          transition={cieTransition.spring}
        />
      )}
      <span data-slot="segmented-control-label" className="relative z-10">
        {children}
      </span>
    </ToggleGroupPrimitive.Item>
  )
}

export { SegmentedControl, SegmentedControlItem }
