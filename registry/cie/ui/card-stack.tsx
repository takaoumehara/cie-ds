"use client"

import * as React from "react"
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react"

import { cn } from "@/lib/utils"

// Scroll · Card Stack (sticky "stacking cards" lineage — Olivier Larose / motion useScroll).
// Each <CardStackItem> is position: sticky with an incremental top offset (top + index × step), so later
// cards slide up and cover earlier ones. As the stack scrolls, every card but the last scales down toward
// 0.94–1 (deeper cards shrink more) and dims, driven by useScroll on the <CardStack> container.
// Cards are cie blocks: rounded-page, hairline border, bg-card.
// `hold` keeps the finished stack on screen for a while after the last card lands (default 60svh), so the
// reader gets to enjoy the completed stack before it scrolls away; the shrink / dim finishes as it lands.
// Reduced motion: a plain stacked list — sticky stays (it is layout, not animation), no scaling or dimming.

type Ctx = { index: number; count: number; progress: MotionValue<number>; top: number; step: number; reduce: boolean }
const StackCtx = React.createContext<Ctx | null>(null)

type CardStackProps = React.ComponentProps<"div"> & {
  /** px from the top of the viewport where the first card sticks. */
  top?: number
  /** px each following card sits lower than the previous one. */
  step?: number
  /** Extra scroll the completed stack stays pinned for (any CSS length). */
  hold?: string
}

function CardStack({ top = 80, step = 16, hold = "60svh", className, style, children, ...props }: CardStackProps) {
  const track = React.useRef<HTMLDivElement>(null)
  const reduce = !!useReducedMotion()
  // Progress runs over the cards only (the track stops short of the hold), so it completes as the last card lands.
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] })
  const items = React.Children.toArray(children).filter(React.isValidElement)
  return (
    <div data-slot="card-stack" className={cn("relative flex flex-col gap-8", className)} style={style} {...props}>
      <div
        ref={track}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{ bottom: `calc(${hold} + 2rem)` }}
      />
      {items.map((child, index) => (
        <StackCtx.Provider
          key={child.key ?? index}
          value={{ index, count: items.length, progress: scrollYProgress, top, step, reduce }}
        >
          {child}
        </StackCtx.Provider>
      ))}
      {/* Sticky boxes stop at their parent's content edge (padding does not count), so the hold is a real box. */}
      <div aria-hidden data-slot="card-stack-hold" style={{ height: hold }} />
    </div>
  )
}

function CardStackItem({ className, style, children, ...props }: React.ComponentProps<typeof motion.div>) {
  const ctx = React.useContext(StackCtx)
  const index = ctx?.index ?? 0
  const count = ctx?.count ?? 1
  const fallback = useMotionValue(0)
  const progress = ctx?.progress ?? fallback
  // Deeper cards (earlier, more covered) settle smaller: last card stays at 1, first at 0.94.
  const target = 1 - ((count - 1 - index) / Math.max(1, count - 1)) * 0.06
  const start = index / count
  const scale = useTransform(progress, [start, 1], [1, target])
  const dim = useTransform(progress, [start, 1], [0, ((count - 1 - index) / Math.max(1, count - 1)) * 0.5])
  const animate = ctx && !ctx.reduce
  return (
    <motion.div
      data-slot="card-stack-item"
      className={cn(
        "sticky origin-top overflow-hidden rounded-page border border-border bg-card p-7 text-card-foreground",
        className
      )}
      style={{ top: (ctx?.top ?? 0) + index * (ctx?.step ?? 0), ...(animate ? { scale } : {}), ...style }}
      {...props}
    >
      {children as React.ReactNode}
      {animate && (
        <motion.div
          data-slot="card-stack-dim"
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-background"
          style={{ opacity: dim }}
        />
      )}
    </motion.div>
  )
}

export { CardStack, CardStackItem }
