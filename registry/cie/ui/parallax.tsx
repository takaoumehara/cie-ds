"use client"

import * as React from "react"
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react"

import { cn } from "@/lib/utils"
import { cieScroll } from "@/lib/cie-motion"

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

function ScrollExpand({ inset = 0.22, length = 1.6, className, children, ...props }: ScrollExpandProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  // Scrubbed motion follows scroll distance: a soft in-out over most of the run (not expo, which crammed the
  // whole change into a few pixels), spring-smoothed for trackpads, then it holds full-bleed for the last 15%.
  const raw = useTransform(scrollYProgress, [0.04, 0.85], [0, 1], { ease: smoothstep })
  const p = useSpring(raw, { stiffness: 220, damping: 40, mass: 0.5 })
  const clip = useTransform(p, (v) => {
    const i = (1 - v) * inset * 100
    const y = (1 - v) * inset * 70
    const r = (1 - v) * 44
    return `inset(${y}% ${i}% ${y}% ${i}% round ${r}px)`
  })
  const scale = useTransform(p, [0, 1], [1.18, 1])
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

const smoothstep = (t: number) => t * t * (3 - 2 * t)

export { Parallax, ScrollExpand }
