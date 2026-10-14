"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { cieGsapDuration, cieGsapEase, gsap, useCieGsap } from "@/lib/cie-gsap"

// Pro · Horizontal scroll (GSAP ScrollTrigger lineage, cie-gsap adapter).
// Vertical scroll drives a horizontal track: the section pins and the track translates by
// -(trackWidth - viewportWidth), scrubbed 1:1 (ease "none"), re-measured on every refresh
// (invalidateOnRefresh). Optional `snap` settles on panel edges with cieGsapEase.expo over --cie-t-move.
// Reduced motion: no pin, no scrub — a native horizontal scroller (overflow-x auto + scroll-snap).


type HorizontalScrollProps = React.ComponentProps<"section"> & {
  /** true = 1:1 with scroll, a number = seconds of catch-up smoothing. */
  scrub?: boolean | number
  /** Settle on the nearest panel when scrolling stops. */
  snap?: boolean
  /** Extra classes for the moving track. */
  trackClassName?: string
}

function HorizontalScroll({
  scrub = 0.6,
  snap = false,
  className,
  trackClassName,
  children,
  ...props
}: HorizontalScrollProps) {
  const ref = React.useRef<HTMLElement>(null)
  const count = React.Children.count(children)

  useCieGsap(
    ref,
    ({ reduced }) => {
      const root = ref.current
      const track = root?.querySelector<HTMLElement>("[data-slot=horizontal-scroll-track]")
      if (!root || !track || reduced) return // reduced: CSS (motion-reduce:) makes it a native scroller
      const dist = () => Math.max(0, track.scrollWidth - root.clientWidth)
      gsap.to(track, {
        x: () => -dist(),
        ease: cieGsapEase.scrub,
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: () => `+=${dist()}`,
          pin: true,
          anticipatePin: 1,
          scrub,
          invalidateOnRefresh: true,
          snap:
            snap && count > 1
              ? { snapTo: 1 / (count - 1), duration: cieGsapDuration.move, ease: cieGsapEase.expo }
              : undefined,
        },
      })
    },
    [scrub, snap, count]
  )

  return (
    <section
      ref={ref}
      data-slot="horizontal-scroll"
      className={cn(
        "relative h-svh w-full overflow-hidden",
        "motion-reduce:snap-x motion-reduce:snap-mandatory motion-reduce:overflow-x-auto",
        "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className
      )}
      {...props}
    >
      <div
        data-slot="horizontal-scroll-track"
        className={cn("flex h-full w-max will-change-transform", trackClassName)}
      >
        {children}
      </div>
    </section>
  )
}

function HorizontalScrollPanel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="horizontal-scroll-panel"
      className={cn("relative h-full w-[85vw] shrink-0 snap-start sm:w-[60vw]", className)}
      {...props}
    />
  )
}

export { HorizontalScroll, HorizontalScrollPanel }
