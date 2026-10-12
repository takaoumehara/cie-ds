"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// UI · Slider (shadcn / Radix lineage). Single or range — pass an array with 1 or 2+ values.
// - Thin h-1 paper track, ink range; size-4 ink thumbs with a focus ring.
// - The thumb being dragged scales 1 → 1.25 on --cie-t-snap; `showValue` adds a font-mono
//   bubble above each thumb that fades/rises in on hover, focus or drag. `formatValue` formats it.
// Reduced motion: motion-reduce variants drop the scale and rise (bubble just appears).

type SliderProps = React.ComponentProps<typeof SliderPrimitive.Root> & {
  /** Show a value bubble above each thumb while hovering / dragging. */
  showValue?: boolean
  formatValue?: (value: number) => React.ReactNode
}

function Slider({
  value: valueProp,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  showValue = false,
  formatValue = (v) => v,
  className,
  onPointerDown,
  ...props
}: SliderProps) {
  const [inner, setInner] = React.useState<number[]>(defaultValue ?? [min])
  const values = valueProp ?? inner
  const [dragging, setDragging] = React.useState(false)

  React.useEffect(() => {
    if (!dragging) return
    const up = () => setDragging(false)
    window.addEventListener("pointerup", up)
    window.addEventListener("pointercancel", up)
    return () => {
      window.removeEventListener("pointerup", up)
      window.removeEventListener("pointercancel", up)
    }
  }, [dragging])

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      data-dragging={dragging ? "" : undefined}
      value={valueProp}
      defaultValue={defaultValue}
      min={min}
      max={max}
      onValueChange={(v) => {
        setInner(v)
        onValueChange?.(v)
      }}
      onPointerDown={(e) => {
        setDragging(true)
        onPointerDown?.(e)
      }}
      className={cn(
        "group/slider relative flex w-full touch-none items-center select-none data-[disabled]:opacity-40",
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        showValue && "data-[orientation=horizontal]:pt-7",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative grow overflow-hidden rounded-full bg-secondary data-[orientation=horizontal]:h-1 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
        />
      </SliderPrimitive.Track>
      {values.map((v, i) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={i}
          className={cn(
            "group/thumb relative block size-4 shrink-0 cursor-grab rounded-full bg-primary",
            "transition-[scale,box-shadow] duration-[var(--cie-t-snap,120ms)] ease-cie-out",
            "active:scale-125 active:cursor-grabbing group-data-[dragging]/slider:focus:scale-125 motion-reduce:scale-100!",
            "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[disabled]:pointer-events-none"
          )}
        >
          {showValue && (
            <span
              data-slot="slider-value"
              aria-hidden
              className={cn(
                "pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 translate-y-1 rounded-full bg-primary px-2 py-0.5",
                "font-mono text-xs whitespace-nowrap text-primary-foreground tabular-nums opacity-0",
                "transition-[opacity,translate] duration-[var(--cie-t-fast,180ms)] ease-cie-out",
                "group-hover/thumb:translate-y-0 group-hover/thumb:opacity-100",
                "group-focus-visible/thumb:translate-y-0 group-focus-visible/thumb:opacity-100",
                "group-data-[dragging]/slider:group-focus/thumb:translate-y-0 group-data-[dragging]/slider:group-focus/thumb:opacity-100",
                "motion-reduce:translate-y-0"
              )}
            >
              {formatValue(v)}
            </span>
          )}
        </SliderPrimitive.Thumb>
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
