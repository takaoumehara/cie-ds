"use client"

import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

// Micro · Text Shimmer (Magic UI Animated Shiny Text lineage). Muted text with a
// foreground-bright band passing through — for "Generating…", status lines, eyebrows.

type TextShimmerProps = React.ComponentProps<"span"> & {
  asChild?: boolean
  /** Seconds per sweep. */
  duration?: number
  /** Band width in px. */
  spread?: number
}

function TextShimmer({ asChild, duration = 2.4, spread = 80, className, style, ...props }: TextShimmerProps) {
  const Comp = asChild ? Slot.Root : "span"
  return (
    <Comp
      data-slot="text-shimmer"
      className={cn(
        "inline-block bg-clip-text text-transparent",
        "bg-[linear-gradient(90deg,var(--muted-foreground)_0%,var(--muted-foreground)_calc(50%-var(--spread)),var(--foreground)_50%,var(--muted-foreground)_calc(50%+var(--spread)),var(--muted-foreground)_100%)] bg-size-[250%_100%] bg-no-repeat",
        "motion-safe:animate-cie-shimmer motion-reduce:text-muted-foreground",
        className
      )}
      style={{ "--spread": `${spread}px`, "--cie-shimmer-duration": `${duration}s`, ...style } as React.CSSProperties}
      {...props}
    />
  )
}

export { TextShimmer }
