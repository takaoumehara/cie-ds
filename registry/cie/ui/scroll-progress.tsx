"use client"

import * as React from "react"
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react"

import { cn } from "@/lib/utils"
import { cieTransition } from "@/lib/cie-motion"

// Scroll · Scroll Progress (reading-progress bar lineage — Magic UI / motion `useScroll`).
// variant="bar"    — a 2px ink hairline that fills left → right (scaleX from scrollYProgress, origin-left).
// variant="circle" — a small ring that draws itself (pathLength), with an optional mono percentage.
// Measures the page by default; pass `container` for an inner scroll box, or `target` to measure one
// element as it passes (start start → end end). Progress is smoothed with cieTransition.spring.
// Reduced motion: no spring smoothing — the value maps 1:1 to scroll (no overshoot, no follow-through).

type Ref = React.RefObject<HTMLElement | null>

type ScrollProgressProps = Omit<React.ComponentProps<"div">, "children"> & {
  variant?: "bar" | "circle"
  /** bar: fixed to the viewport top (default), sticky to its scroll parent's top, or in flow. circle: default static. */
  position?: "fixed" | "sticky" | "static"
  /** Measure this element's passage instead of the whole page / container. */
  target?: Ref
  /** Inner scroll container (overflow-y-auto) to track instead of the window. */
  container?: Ref
  /** circle only: show the percentage in mono beside the ring. */
  showValue?: boolean
  /** circle only: ring diameter in px. */
  size?: number
}

const { stiffness, damping, mass } = cieTransition.spring

function useProgress(target?: Ref, container?: Ref): MotionValue<number> {
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    ...(target ? { target, offset: ["start start", "end end"] as const } : {}),
    ...(container ? { container } : {}),
  })
  const smooth = useSpring(scrollYProgress, { stiffness, damping, mass, restDelta: 0.001 })
  return reduce ? scrollYProgress : smooth
}

const positions = {
  fixed: "fixed inset-x-0 top-0 z-50",
  sticky: "sticky top-0 z-10",
  static: "relative",
}

function ScrollProgress({
  variant = "bar",
  position,
  target,
  container,
  showValue = false,
  size = 40,
  className,
  ...props
}: ScrollProgressProps) {
  const progress = useProgress(target, container)
  const percent = useTransform(progress, (v) => `${Math.round(Math.min(1, Math.max(0, v)) * 100)}`)

  if (variant === "circle") {
    const pos = position ?? "static"
    const r = size / 2 - 2
    return (
      <div
        data-slot="scroll-progress"
        data-variant="circle"
        aria-hidden
        className={cn(
          "inline-flex items-center gap-2 text-foreground",
          pos === "fixed" ? "fixed right-6 bottom-6 z-50" : pos === "sticky" ? "sticky top-4 z-10" : "relative",
          className
        )}
        {...props}
      >
        <svg
          data-slot="scroll-progress-ring"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={2} className="stroke-border" />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={2}
            strokeLinecap="round"
            className="stroke-foreground"
            style={{ pathLength: progress }}
          />
        </svg>
        {showValue && (
          <span data-slot="scroll-progress-value" className="font-mono text-xs tabular-nums uppercase">
            <motion.span>{percent}</motion.span>%
          </span>
        )}
      </div>
    )
  }

  return (
    <div
      data-slot="scroll-progress"
      data-variant="bar"
      aria-hidden
      className={cn("pointer-events-none h-[2px] w-full", positions[position ?? "fixed"], className)}
      {...props}
    >
      <motion.div
        data-slot="scroll-progress-bar"
        className="h-full w-full origin-left bg-foreground will-change-transform"
        style={{ scaleX: progress }}
      />
    </div>
  )
}

export { ScrollProgress }
