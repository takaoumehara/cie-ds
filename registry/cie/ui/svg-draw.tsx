"use client"

import * as React from "react"
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react"

import { cn } from "@/lib/utils"
import { cieDuration, cieEase, cieTransition } from "@/lib/cie-motion"

// Scroll · SVG line drawing (motion pathLength lineage), scroll-linked 13.
// <SvgDraw d viewBox>                 — one path.
// <SvgDraw viewBox><SvgDrawPath d/>…  — several paths drawn together.
// trigger "scroll" (default): pathLength follows the element's scroll progress through the
// viewport, smoothed by the cieTransition.follow spring. trigger "view": draws once on entering
// the viewport (cieEase.expo). Stroke is currentColor, fill none, round caps — set colour and
// weight from the outside (text-foreground, strokeWidth).
// Reduced motion: drawn in full, nothing scroll-linked.

type ScrollOffset = NonNullable<Parameters<typeof useScroll>[0]>["offset"]

type DrawCtx = { length: MotionValue<number>; strokeWidth: number }
const SvgDrawContext = React.createContext<DrawCtx | null>(null)

type SvgDrawProps = Omit<React.ComponentProps<"svg">, "ref" | "offset"> & {
  /** Shorthand for a single path. Or pass <SvgDrawPath> children. */
  d?: string
  trigger?: "scroll" | "view"
  /** Stroke width in viewBox units. */
  strokeWidth?: number
  /** Seconds — view mode only. */
  duration?: number
  /** Seconds — view mode only. */
  delay?: number
  /** Scroll mode: viewport offsets for 0 → 1 drawn. */
  scrollOffset?: ScrollOffset
  /** Scroll container (defaults to the window). */
  container?: React.RefObject<HTMLElement | null>
}

function SvgDraw({
  d,
  trigger = "scroll",
  strokeWidth = 1.5,
  duration = cieDuration.scene * 3,
  delay = 0,
  scrollOffset = ["start 0.9", "end 0.45"],
  container,
  viewBox = "0 0 100 100",
  className,
  children,
  ...props
}: SvgDrawProps) {
  const ref = React.useRef<SVGSVGElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref as unknown as React.RefObject<HTMLElement>,
    container,
    offset: scrollOffset,
  })
  const { stiffness, damping, mass } = cieTransition.follow
  const scrolled = useSpring(scrollYProgress, { stiffness, damping, mass })
  const viewed = useMotionValue(reduce ? 1 : 0)
  const inView = useInView(ref, { once: true, amount: 0.5 })

  React.useEffect(() => {
    if (trigger !== "view") return
    if (reduce) {
      viewed.set(1)
      return
    }
    if (!inView) return
    const controls = animate(viewed, 1, { duration, delay, ease: cieEase.expo })
    return () => controls.stop()
  }, [trigger, inView, reduce, duration, delay, viewed])

  const full = useMotionValue(1)
  const length = reduce ? full : trigger === "scroll" ? scrolled : viewed

  return (
    <SvgDrawContext.Provider value={{ length, strokeWidth }}>
      <svg
        ref={ref}
        data-slot="svg-draw"
        viewBox={viewBox}
        fill="none"
        aria-hidden={props["aria-label"] ? undefined : true}
        className={cn("block overflow-visible text-foreground", className)}
        {...props}
      >
        {d ? <SvgDrawPath d={d} /> : null}
        {children}
      </svg>
    </SvgDrawContext.Provider>
  )
}

type SvgDrawPathProps = Omit<React.ComponentProps<typeof motion.path>, "pathLength" | "ref">

function SvgDrawPath({ style, ...props }: SvgDrawPathProps) {
  const ctx = React.useContext(SvgDrawContext)
  const fallback = useMotionValue(1)
  const length = ctx?.length ?? fallback
  // Hide the round-cap dot that a zero-length path would otherwise leave.
  const opacity = useTransform(length, [0, 0.01], [0, 1])
  return (
    <motion.path
      data-slot="svg-draw-path"
      fill="none"
      stroke="currentColor"
      strokeWidth={ctx?.strokeWidth ?? 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ pathLength: length, opacity, ...style }}
      {...props}
    />
  )
}

export { SvgDraw, SvgDrawPath }
