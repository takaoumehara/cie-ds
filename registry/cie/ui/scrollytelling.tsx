"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { gsap, ScrollTrigger, useCieGsap } from "@/lib/cie-gsap"

// Pro · Scrollytelling (NYT / Pudding "sticky graphic" lineage, GSAP ScrollTrigger via cie-gsap).
// Two columns: text steps scroll normally on the left, the figure on the right is pinned (ScrollTrigger
// pin) and swaps its state per active step — `figure={(i) => …}` receives the active index. The active
// step is full ink, the others muted (colour cross-fade on --cie-t-cell). Below md the figure pins on
// top (half viewport) and the steps scroll beneath it (gsap.matchMedia).
// Reduced motion: no pin and no tracking — every step is full ink and carries its own figure inline.

type StepCtx = { index: number; active: boolean }
const ScrollytellingStepContext = React.createContext<StepCtx>({ index: 0, active: true })


type ScrollytellingProps = Omit<React.ComponentProps<"section">, "children"> & {
  /** Render the figure for the active step index. */
  figure: (index: number) => React.ReactNode
  /** <ScrollytellingStep> elements. */
  children: React.ReactNode
  /** Figure side on desktop. */
  side?: "right" | "left"
  /** Called when the active step changes. */
  onStepChange?: (index: number) => void
}

function Scrollytelling({ figure, side = "right", onStepChange, className, children, ...props }: ScrollytellingProps) {
  const ref = React.useRef<HTMLElement>(null)
  const [active, setActive] = React.useState(0)
  const steps = React.Children.toArray(children)
  const n = steps.length
  const onChange = React.useRef(onStepChange)
  onChange.current = onStepChange

  const activate = React.useCallback((i: number) => {
    setActive(i)
    onChange.current?.(i)
  }, [])

  useCieGsap(
    ref,
    ({ reduced }) => {
      const root = ref.current
      if (!root || reduced) return
      const fig = root.querySelector<HTMLElement>("[data-slot=scrollytelling-figure]")
      const col = root.querySelector<HTMLElement>("[data-slot=scrollytelling-steps]")
      const els = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-slot=scrollytelling-step]"))
      if (!fig || !col) return
      const mm = gsap.matchMedia()
      mm.add({ desktop: "(min-width: 768px)", mobile: "(max-width: 767.98px)" }, (context) => {
        const desktop = Boolean(context.conditions?.desktop)
        // The steps column sets the length; the figure pins beside it (desktop) or above it (mobile).
        ScrollTrigger.create({
          trigger: fig,
          start: "top top",
          endTrigger: col,
          end: desktop ? "bottom bottom" : "bottom 50%",
          pin: fig,
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        })
        els.forEach((el, i) =>
          ScrollTrigger.create({
            trigger: el,
            start: desktop ? "top 55%" : "top 80%",
            end: desktop ? "bottom 55%" : "bottom 80%",
            onEnter: () => activate(i),
            onEnterBack: () => activate(i),
          })
        )
      })
      return () => mm.revert()
    },
    [n]
  )

  return (
    <section
      ref={ref}
      data-slot="scrollytelling"
      className={cn("relative grid w-full md:grid-cols-2 md:gap-10", className)}
      {...props}
    >
      <div
        data-slot="scrollytelling-figure-cell"
        className={cn("relative z-10 motion-reduce:hidden", side === "left" ? "md:order-1" : "md:order-2")}
      >
        <div
          data-slot="scrollytelling-figure"
          className="flex h-[50svh] items-center justify-center bg-background md:h-svh"
        >
          {figure(active)}
        </div>
      </div>
      <div
        data-slot="scrollytelling-steps"
        className={cn("relative flex flex-col px-6 sm:px-10", side === "left" ? "md:order-2" : "md:order-1")}
      >
        {steps.map((step, i) => (
          <ScrollytellingStepContext.Provider key={i} value={{ index: i, active: i === active }}>
            {step}
            <div data-slot="scrollytelling-inline-figure" className="hidden py-8 motion-reduce:block">
              {figure(i)}
            </div>
          </ScrollytellingStepContext.Provider>
        ))}
      </div>
    </section>
  )
}

function ScrollytellingStep({ className, children, ...props }: React.ComponentProps<"div">) {
  const { index, active } = React.useContext(ScrollytellingStepContext)
  return (
    <div
      data-slot="scrollytelling-step"
      data-index={index}
      data-active={active ? "" : undefined}
      aria-current={active ? "step" : undefined}
      className={cn(
        "flex min-h-[70svh] flex-col justify-center py-12 motion-reduce:min-h-0 md:min-h-[80svh]",
        "text-muted-foreground transition-colors duration-[var(--cie-t-cell,320ms)] ease-cie-expo",
        "data-[active]:text-foreground motion-reduce:text-foreground motion-reduce:transition-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Scrollytelling, ScrollytellingStep }
