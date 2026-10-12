"use client"
// cie-ds adapter for GSAP + ScrollTrigger — the opt-in "Pro" layer for pinned / scrubbed scroll scenes
// (pin + scrub, scrollytelling, horizontal scroll, image sequences, scroll-driven camera moves).
// Everything else in cie stays on `motion`. This file makes GSAP speak cie tokens:
//   - cie easings registered as named CustomEases: "cie-expo", "cie-out", "cie-snap"
//   - cie durations re-exported in seconds (GSAP uses seconds, like motion)
//   - useCieGsap(): scoped setup + automatic cleanup, with prefers-reduced-motion split via gsap.matchMedia
import * as React from "react"
import { gsap } from "gsap"
import { CustomEase } from "gsap/CustomEase"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import { cieDuration, cieEase } from "@/lib/cie-motion"

const svgPath = ([x1, y1, x2, y2]: readonly number[]) => `M0,0 C${x1},${y1} ${x2},${y2} 1,1`

let registered = false
function registerCie() {
  if (registered || typeof window === "undefined") return
  gsap.registerPlugin(ScrollTrigger, CustomEase)
  CustomEase.create("cie-expo", svgPath(cieEase.expo))
  CustomEase.create("cie-out", svgPath(cieEase.out))
  CustomEase.create("cie-snap", svgPath(cieEase.snap))
  watchLayout()
  registered = true
}

// Pins measure their start / end once. When content above them changes height later (fonts, images,
// accordions, lazily revealed sections) the measurements go stale and pins release early, so re-measure
// whenever the document's height changes (debounced) and once fonts are ready.
function watchLayout() {
  let lastHeight = document.documentElement.scrollHeight
  let timer: ReturnType<typeof setTimeout> | undefined
  const refresh = () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      const height = document.documentElement.scrollHeight
      if (Math.abs(height - lastHeight) < 2) return
      lastHeight = height
      ScrollTrigger.refresh()
    }, 120)
  }
  new ResizeObserver(refresh).observe(document.body)
  document.fonts?.ready.then(() => ScrollTrigger.refresh())
}
registerCie()

/** Named GSAP eases matching cieEase. Use as `ease: cieGsapEase.expo`. */
const cieGsapEase = {
  expo: "cie-expo",
  out: "cie-out",
  snap: "cie-snap",
  /** Scrubbed timelines map scroll distance 1:1 — no easing on top. */
  scrub: "none",
} as const

/** Seconds, straight from tokens. */
const cieGsapDuration = cieDuration

const useIsomorphicLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect

type CieGsapContext = {
  /** true when the user prefers reduced motion — show the end state (freeze frame), skip pins and scrubs. */
  reduced: boolean
}

/**
 * Run GSAP setup scoped to `scope`. Selector strings inside resolve within the scope, and every tween /
 * ScrollTrigger created inside is reverted on unmount, on deps change, and when the reduced-motion
 * preference flips (setup re-runs with the new `reduced`).
 */
function useCieGsap(
  scope: React.RefObject<HTMLElement | null>,
  setup: (ctx: CieGsapContext) => void | (() => void),
  deps: React.DependencyList = []
) {
  const setupRef = React.useRef(setup)
  setupRef.current = setup

  useIsomorphicLayoutEffect(() => {
    registerCie()
    const mm = gsap.matchMedia(scope.current ?? undefined)
    mm.add(
      { reduced: "(prefers-reduced-motion: reduce)", full: "(prefers-reduced-motion: no-preference)" },
      (context) => setupRef.current({ reduced: Boolean(context.conditions?.reduced) })
    )
    return () => mm.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

export { gsap, ScrollTrigger, cieGsapEase, cieGsapDuration, useCieGsap, type CieGsapContext }
