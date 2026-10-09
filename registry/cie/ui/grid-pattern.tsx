"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { cieEase } from "@/lib/cie-motion"

// Atmosphere · SVG grid / dot / cross field with an edge fade and optional
// "breathing" cells. Inspired by Aceternity Grid & Dot Backgrounds and Magic UI
// Animated Grid Pattern. Colour = currentColor → defaults to text-foreground/15.

type GridPatternProps = React.ComponentProps<"div"> & {
  variant?: "grid" | "dots" | "cross"
  /** Cell size in px. */
  size?: number
  /** Edge fade. */
  fade?: "radial" | "top" | "bottom" | "none"
  /** Number of softly pulsing highlight cells (grid variant). 0 to disable. */
  cells?: number
  /** Seconds per highlight cycle. */
  cycle?: number
}

const masks = {
  radial: "radial-gradient(ellipse at center, var(--foreground) 20%, transparent 72%)",
  top: "linear-gradient(to bottom, var(--foreground) 30%, transparent)",
  bottom: "linear-gradient(to top, var(--foreground) 30%, transparent)",
  none: undefined,
}

function useCells(count: number, size: number, ref: React.RefObject<HTMLDivElement | null>) {
  const [cells, setCells] = React.useState<{ id: number; x: number; y: number }[]>([])
  React.useEffect(() => {
    const el = ref.current
    if (!el || count === 0) return
    const make = () => {
      const cols = Math.max(1, Math.floor(el.clientWidth / size))
      const rows = Math.max(1, Math.floor(el.clientHeight / size))
      setCells(
        Array.from({ length: count }, (_, id) => ({
          id: id + Math.random(),
          x: Math.floor(Math.random() * cols),
          y: Math.floor(Math.random() * rows),
        }))
      )
    }
    make()
    const ro = new ResizeObserver(make)
    ro.observe(el)
    return () => ro.disconnect()
  }, [count, size, ref])
  return [cells, setCells] as const
}

function GridPattern({
  variant = "grid",
  size = 40,
  fade = "radial",
  cells = 0,
  cycle = 4,
  className,
  style,
  ...props
}: GridPatternProps) {
  const id = React.useId().replace(/:/g, "")
  const ref = React.useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [lit, setLit] = useCells(variant === "grid" ? cells : 0, size, ref)
  const mask = masks[fade]

  const relocate = (cellId: number) => {
    const el = ref.current
    if (!el) return
    const cols = Math.max(1, Math.floor(el.clientWidth / size))
    const rows = Math.max(1, Math.floor(el.clientHeight / size))
    setLit((prev) =>
      prev.map((c) =>
        c.id === cellId
          ? { id: Math.random(), x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) }
          : c
      )
    )
  }

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-slot="grid-pattern"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden text-foreground/15", className)}
      style={{ maskImage: mask, WebkitMaskImage: mask, ...style }}
      {...props}
    >
      <svg className="absolute inset-0 size-full">
        <defs>
          <pattern id={`p-${id}`} width={size} height={size} patternUnits="userSpaceOnUse">
            {variant === "grid" && (
              <path d={`M ${size} 0 L 0 0 0 ${size}`} fill="none" stroke="currentColor" strokeWidth={1} />
            )}
            {variant === "dots" && <circle cx={size / 2} cy={size / 2} r={1.25} fill="currentColor" />}
            {variant === "cross" && (
              <path
                d={`M ${size / 2 - 4} ${size / 2} h 8 M ${size / 2} ${size / 2 - 4} v 8`}
                stroke="currentColor"
                strokeWidth={1}
              />
            )}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p-${id})`} />
        {lit.map((c, i) => (
          <motion.rect
            key={c.id}
            x={c.x * size + 1}
            y={c.y * size + 1}
            width={size - 1}
            height={size - 1}
            fill="currentColor"
            initial={{ opacity: 0 }}
            animate={reduce ? { opacity: 0.6 } : { opacity: [0, 0.9, 0] }}
            transition={
              reduce
                ? { duration: 0 }
                : { duration: cycle, ease: cieEase.out, delay: (i * cycle) / Math.max(1, lit.length) }
            }
            onAnimationComplete={() => !reduce && relocate(c.id)}
          />
        ))}
      </svg>
    </div>
  )
}

export { GridPattern }
