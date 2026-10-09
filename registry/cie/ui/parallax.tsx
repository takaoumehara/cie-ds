"use client"

import * as React from "react"
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react"

import { cn } from "@/lib/utils"
import { cieEase, cieScroll } from "@/lib/cie-motion"

// Showcase · Scroll-linked parallax (SmoothUI / motion lineage).
// <Parallax speed>     — element drifts against scroll. Default range = --cie-parallax-max (48px) × speed.
// <ScrollExpand>       — the cie signature, scroll-driven: a block grows into a full page as it
//                        passes through the viewport (radius → 0, inset → 0).
// Both are off under prefers-reduced-motion.

type ParallaxProps = React.ComponentProps<typeof motion.div> & {
  /** Multiplier on the token range. Negative moves with the scroll. 1 = ±48px. */
  speed?: number
  /** Horizontal instead of vertical. */
  axis?: "y" | "x"
  /** Smooth the motion with a spring (nice with trackpads, off = 1:1 with scroll). */
  smooth?: boolean
}

function Parallax({ speed = 1, axis = "y", smooth = true, className, style, children, ...props }: ParallaxProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const range = cieScroll.parallaxMax * speed
  const raw = useTransform(scrollYProgress, [0, 1], [range, -range])
  const sprung = useSpring(raw, { stiffness: 200, damping: 40, mass: 0.4 })
  const v: MotionValue<number> = smooth ? sprung : raw
  return (
    <motion.div
      ref={ref}
      data-slot="parallax"
      className={cn("will-change-transform", className)}
      style={reduce ? style : { ...(axis === "y" ? { y: v } : { x: v }), ...style }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

type ScrollExpandProps = React.ComponentProps<"div"> & {
  /** Starting inset as a fraction of the viewport width on each side (0–0.4). */
  inset?: number
  /** Scroll distance (in viewport heights) the expansion takes. */
  length?: number
}

function ScrollExpand({ inset = 0.18, length = 1.2, className, children, ...props }: ScrollExpandProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const p = useTransform(scrollYProgress, [0, 0.85], [0, 1], { ease: (t) => cubic(cieEase.expo, t) })
  const clip = useTransform(p, (v) => {
    const i = (1 - v) * inset * 100
    const y = (1 - v) * inset * 60
    const r = (1 - v) * 44
    return `inset(${y}% ${i}% ${y}% ${i}% round ${r}px)`
  })
  const scale = useTransform(p, [0, 1], [1.12, 1])
  return (
    <div
      ref={ref}
      data-slot="scroll-expand"
      className="relative"
      style={{ height: `${100 + length * 100}svh` }}
      {...props}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        <motion.div
          className={cn("absolute inset-0 bg-card text-card-foreground", className)}
          style={reduce ? undefined : { clipPath: clip }}
        >
          <motion.div className="size-full" style={reduce ? undefined : { scale }}>
            {children}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

// Evaluate a CSS cubic-bezier at x (Newton–Raphson), so scroll maps through the cie expo curve.
function cubic([x1, y1, x2, y2]: readonly number[], x: number) {
  const bx = (t: number) => 3 * (1 - t) ** 2 * t * x1 + 3 * (1 - t) * t ** 2 * x2 + t ** 3
  const by = (t: number) => 3 * (1 - t) ** 2 * t * y1 + 3 * (1 - t) * t ** 2 * y2 + t ** 3
  const dx = (t: number) => 3 * (1 - t) ** 2 * x1 + 6 * (1 - t) * t * (x2 - x1) + 3 * t ** 2 * (1 - x2)
  let t = x
  for (let i = 0; i < 6; i++) {
    const d = dx(t)
    if (Math.abs(d) < 1e-6) break
    t -= (bx(t) - x) / d
    t = Math.min(1, Math.max(0, t))
  }
  return by(t)
}

export { Parallax, ScrollExpand }
