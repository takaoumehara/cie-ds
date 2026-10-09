"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

// Atmosphere · Film grain overlay. Pure SVG feTurbulence → alpha → flooded with
// currentColor, so the grain is tinted by the theme (default text-foreground).
// `animated` jitters the grain with steps() — CSS only, zero JS per frame.

type NoiseProps = React.ComponentProps<"div"> & {
  /** 0–1 overlay opacity. */
  opacity?: number
  /** Turbulence base frequency — higher = finer grain. */
  frequency?: number
  animated?: boolean
}

function Noise({ opacity = 0.08, frequency = 0.8, animated = true, className, style, ...props }: NoiseProps) {
  const id = React.useId().replace(/:/g, "")
  return (
    <div
      aria-hidden="true"
      data-slot="noise"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden text-foreground", className)}
      style={{ opacity, ...style }}
      {...props}
    >
      <svg className={cn("absolute -inset-[10%] size-[120%]", animated && "motion-safe:animate-cie-grain")}>
        <filter id={`n-${id}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency={frequency} numOctaves={3} stitchTiles="stitch" result="t" />
          <feColorMatrix in="t" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.6 -0.55" result="a" />
          <feFlood floodColor="currentColor" result="f" />
          <feComposite in="f" in2="a" operator="in" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#n-${id})`} />
      </svg>
    </div>
  )
}

export { Noise }
