"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { cieGsapEase, gsap, useCieGsap } from "@/lib/cie-gsap"

// Pro · Pin + scrub (GSAP ScrollTrigger lineage, cie-gsap adapter).
// <PinScrub>      — pins a full-viewport stage for `distance` of scroll (e.g. "150%" = 1.5 viewports) and
//                   scrubs a timeline you build: timeline={(tl, q) => tl.to(q("[data-a]"), { … })}, where
//                   q = gsap.utils.selector(stage). Scrubbed tweens default to ease "none" (scroll = time).
// <PinScrubSteps> — preset: N children cross-fade / rise one after another while pinned (step i lands at
//                   progress i/N), with a hairline progress bar and a mono counter.
// Reduced motion: no pin, no scrub. PinScrub jumps the timeline to its end state (freeze frame);
// PinScrubSteps renders every step stacked, statically.

type Timeline = ReturnType<typeof gsap.timeline>
type Selector = ReturnType<typeof gsap.utils.selector>


type PinScrubProps = React.ComponentProps<"div"> & {
  /** Scroll distance the stage stays pinned for, relative to the viewport height ("150%") or in px ("800"). */
  distance?: string
  /** true = 1:1 with scroll, a number = seconds of catch-up smoothing. */
  scrub?: boolean | number
  /** Where pinning starts (ScrollTrigger `start`). */
  start?: string
  /** Build the scrubbed timeline. `q` selects inside the stage. */
  timeline?: (tl: Timeline, q: Selector) => void
}

function PinScrub({
  distance = "150%",
  scrub = 0.6,
  start = "top top",
  timeline,
  className,
  children,
  ...props
}: PinScrubProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  useCieGsap(
    ref,
    ({ reduced }) => {
      const el = ref.current
      if (!el) return
      const q = gsap.utils.selector(el)
      if (reduced) {
        // Freeze frame: build the same timeline, then jump straight to its end. No pin, no scrub.
        const tl = gsap.timeline({ paused: true, defaults: { ease: cieGsapEase.scrub } })
        timeline?.(tl, q)
        tl.progress(1)
        return
      }
      const tl = gsap.timeline({
        defaults: { ease: cieGsapEase.scrub },
        scrollTrigger: {
          trigger: el,
          start,
          end: `+=${distance}`,
          pin: true,
          anticipatePin: 1,
          scrub,
          invalidateOnRefresh: true,
        },
      })
      timeline?.(tl, q)
    },
    [distance, scrub, start]
  )

  return (
    <div ref={ref} data-slot="pin-scrub" className={cn("relative h-svh w-full overflow-hidden", className)} {...props}>
      {children}
    </div>
  )
}

type PinScrubStepsProps = Omit<PinScrubProps, "timeline"> & {
  /** Show the hairline progress bar + counter. */
  progress?: boolean
}

function PinScrubSteps({
  distance,
  scrub = 0.6,
  start = "top top",
  progress = true,
  className,
  children,
  ...props
}: PinScrubStepsProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const items = React.Children.toArray(children)
  const n = items.length
  const span = distance ?? `${Math.max(1, n) * 80}%`

  useCieGsap(
    ref,
    ({ reduced }) => {
      const el = ref.current
      if (!el || reduced || n === 0) return // reduced: CSS (motion-reduce:) stacks every step statically
      const q = gsap.utils.selector(el)
      const steps = q("[data-slot=pin-scrub-step]")
      const counter = q("[data-slot=pin-scrub-counter]")[0]
      gsap.set(steps, { autoAlpha: (i: number) => (i === 0 ? 1 : 0), y: (i: number) => (i === 0 ? 0 : 40) })

      const tl = gsap.timeline({
        defaults: { ease: cieGsapEase.scrub },
        scrollTrigger: {
          trigger: el,
          start,
          end: `+=${span}`,
          pin: true,
          anticipatePin: 1,
          scrub,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (!counter) return
            const i = Math.min(n - 1, Math.floor(self.progress * n))
            counter.textContent = `${String(i + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}`
          },
        },
      })
      // Timeline length = n units; step i is fully in at time i (progress i/n), then holds.
      for (let i = 1; i < n; i++) {
        tl.to(steps[i - 1], { autoAlpha: 0, y: -40, duration: 0.4 }, i - 0.4)
        tl.to(steps[i], { autoAlpha: 1, y: 0, duration: 0.4 }, i - 0.4)
      }
      tl.fromTo(q("[data-slot=pin-scrub-bar]"), { scaleX: 0 }, { scaleX: 1, duration: n }, 0)
    },
    [n, span, scrub, start]
  )

  return (
    <div
      ref={ref}
      data-slot="pin-scrub-steps"
      className={cn("relative w-full overflow-hidden motion-safe:h-svh motion-reduce:py-16", className)}
      {...props}
    >
      <div data-slot="pin-scrub-stage" className="grid h-full w-full items-center px-6 motion-reduce:gap-12 sm:px-10">
        {items.map((child, i) => (
          <div key={i} data-slot="pin-scrub-step" className="will-change-transform motion-safe:[grid-area:1/1]">
            {child}
          </div>
        ))}
      </div>
      {progress && (
        <div
          aria-hidden
          className="absolute inset-x-6 bottom-6 flex items-center gap-4 motion-reduce:hidden sm:inset-x-10"
        >
          <span
            data-slot="pin-scrub-counter"
            className="font-mono text-xs text-muted-foreground uppercase tabular-nums"
          >
            {`01 / ${String(n).padStart(2, "0")}`}
          </span>
          <span className="relative h-px flex-1 bg-border">
            <span data-slot="pin-scrub-bar" className="absolute inset-0 origin-left bg-foreground" />
          </span>
        </div>
      )}
    </div>
  )
}

export { PinScrub, PinScrubSteps }
