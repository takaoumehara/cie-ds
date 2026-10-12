"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

// UI Parts · Skeleton (shadcn lineage). A faint ink-alpha block with a brighter ink band sweeping
// through on the shared `animate-cie-shimmer` keyframes (same background-position sweep as
// <TextShimmer>). Radius follows --cie-r; pass rounded-full for avatars / pills.
// Reduced motion: static block, no sweep. Decorative — mark the loading region with aria-busy.

type SkeletonProps = React.ComponentProps<"div"> & {
  /** Seconds per sweep. */
  duration?: number
}

function Skeleton({ duration = 1.8, className, style, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "rounded-[var(--cie-r)] bg-foreground/[0.06]",
        "bg-[linear-gradient(90deg,transparent_0%,transparent_35%,color-mix(in_oklab,var(--foreground)_7%,transparent)_50%,transparent_65%,transparent_100%)] bg-size-[250%_100%] bg-no-repeat",
        "motion-safe:animate-cie-shimmer motion-reduce:bg-none",
        className
      )}
      style={{ "--cie-shimmer-duration": `${duration}s`, ...style } as React.CSSProperties}
      {...props}
    />
  )
}

export { Skeleton }
