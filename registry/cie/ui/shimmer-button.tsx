"use client"

import * as React from "react"
import { Slot } from "radix-ui"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

// Micro · Shimmer Button (Magic UI Shimmer / Shiny Button lineage). The cie Button with
// a light band sweeping across its surface, and an optional orbiting beam on the rim.
// The band is the button's own foreground colour at low alpha — no new hue.

type ShimmerButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    /** Seconds per sweep. */
    duration?: number
    /** Rotating rim highlight. */
    rim?: boolean
  }

function ShimmerButton({
  className,
  variant = "default",
  size = "lg",
  asChild = false,
  duration = 2.4,
  rim = true,
  style,
  children,
  ...props
}: ShimmerButtonProps) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      data-slot="shimmer-button"
      className={cn(
        buttonVariants({ variant, size }),
        "group/shimmer relative isolate overflow-hidden",
        // sweep band
        "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-[linear-gradient(110deg,transparent_30%,color-mix(in_oklab,currentColor_28%,transparent)_50%,transparent_70%)] before:bg-size-[250%_100%] motion-safe:before:animate-cie-shimmer",
        className
      )}
      style={{ "--cie-shimmer-duration": `${duration}s`, ...style } as React.CSSProperties}
      {...props}
    >
      {rim && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit] p-px cie-ring-mask"
        >
          <span className="absolute top-1/2 left-1/2 aspect-square w-[300%] -translate-1/2 bg-[conic-gradient(from_0deg,transparent_0_300deg,currentColor_360deg)] opacity-60 motion-safe:animate-[spin_var(--cie-shimmer-duration)_linear_infinite]" />
        </span>
      )}
      {asChild ? children : <span className="relative">{children}</span>}
    </Comp>
  )
}

export { ShimmerButton }
