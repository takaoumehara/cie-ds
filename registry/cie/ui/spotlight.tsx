"use client"

import * as React from "react"
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "motion/react"

import { cn } from "@/lib/utils"
import { cieTransition } from "@/lib/cie-motion"

// Atmosphere · Cursor spotlight (Aceternity Spotlight / Card Spotlight lineage).
// A soft foreground-tinted pool follows the pointer inside the container, and the
// border can light up where the cursor is. Colours come from --foreground only.

type SpotlightProps = React.ComponentProps<"div"> & {
  /** Radius of the light pool in px. */
  radius?: number
  /** 0–100: strength of the pool (percent of --foreground). */
  strength?: number
  /** Light the border under the cursor too. */
  border?: boolean
}

function Spotlight({
  radius = 360,
  strength = 10,
  border = true,
  className,
  children,
  onPointerMove,
  onPointerLeave,
  ...props
}: SpotlightProps) {
  const reduce = useReducedMotion()
  const mx = useMotionValue(-radius)
  const my = useMotionValue(-radius)
  const x = useSpring(mx, cieTransition.follow)
  const y = useSpring(my, cieTransition.follow)
  const [active, setActive] = React.useState(false)

  const pool = useMotionTemplate`radial-gradient(${radius}px circle at ${x}px ${y}px, color-mix(in oklab, var(--foreground) ${strength}%, transparent), transparent 70%)`
  const rim = useMotionTemplate`radial-gradient(${radius * 0.6}px circle at ${x}px ${y}px, color-mix(in oklab, var(--foreground) 55%, transparent), transparent 70%)`

  return (
    <div
      data-slot="spotlight"
      className={cn("group/spotlight relative isolate overflow-hidden rounded-page border border-border", className)}
      onPointerMove={(e) => {
        onPointerMove?.(e)
        if (reduce) return
        const r = e.currentTarget.getBoundingClientRect()
        mx.set(e.clientX - r.left)
        my.set(e.clientY - r.top)
        setActive(true)
      }}
      onPointerLeave={(e) => {
        onPointerLeave?.(e)
        setActive(false)
      }}
      {...props}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: pool }}
        animate={{ opacity: active ? 1 : 0 }}
        transition={cieTransition.cell}
      />
      {border && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px rounded-[inherit] p-px cie-ring-mask"
          style={{ background: rim }}
          animate={{ opacity: active ? 1 : 0 }}
          transition={cieTransition.cell}
        />
      )}
      {children}
    </div>
  )
}

export { Spotlight }
