"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

// Micro · Border Beam (Magic UI lineage). A short foreground-coloured comet travels
// the rounded border of its parent. Place inside any `relative` element with a radius;
// it inherits the radius. Monochrome: fades from --foreground to transparent.

type BorderBeamProps = {
  /** Comet length in px. */
  size?: number
  /** Seconds per lap. */
  duration?: number
  /** Seconds offset (use to stagger several beams). */
  delay?: number
  /** Border width in px. */
  width?: number
  reverse?: boolean
  className?: string
  style?: React.CSSProperties
}

function BorderBeam({
  size = 80,
  duration = 6,
  delay = 0,
  width = 1,
  reverse = false,
  className,
  style,
}: BorderBeamProps) {
  const reduce = useReducedMotion()
  return (
    <div
      aria-hidden="true"
      data-slot="border-beam"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] cie-ring-mask"
      style={{ padding: width }}
    >
      <motion.div
        className={cn(
          "absolute aspect-square bg-linear-to-l from-foreground via-foreground/40 to-transparent",
          className
        )}
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          ...style,
        }}
        initial={{ offsetDistance: reverse ? "100%" : "0%" }}
        animate={reduce ? undefined : { offsetDistance: reverse ? ["100%", "0%"] : ["0%", "100%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration, delay: -delay }}
      />
    </div>
  )
}

export { BorderBeam }
