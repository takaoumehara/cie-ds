"use client"

import * as React from "react"
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react"

import { cn } from "@/lib/utils"
import { cieTransition } from "@/lib/cie-motion"

// Scroll · Hide Header (headroom.js lineage, motion useScroll + useMotionValueEvent).
// Slides away (y 0 → -100%, cieTransition.move) once you scroll down past `threshold` px, and returns
// as soon as you scroll up by the same amount. Always shown within `revealTop` px of the top, and
// whenever focus moves inside it (keyboard users never lose the nav).
// Sticky by default; pass `container` to follow an inner scroll box instead of the window.
// Paper glass: bg-background/80 + backdrop-blur + hairline bottom border.
// Reduced motion: no slide — it fades out/in (opacity only, cieTransition.fast).

type HideHeaderProps = Omit<React.ComponentProps<typeof motion.header>, "children"> & {
  children?: React.ReactNode
  /** Inner scroll container to watch instead of the window. */
  container?: React.RefObject<HTMLElement | null>
  /** px of travel in one direction before the header toggles. */
  threshold?: number
  /** Always shown while scrollY is under this many px. */
  revealTop?: number
}

function HideHeader({
  container,
  threshold = 8,
  revealTop = 64,
  className,
  children,
  onFocusCapture,
  ...props
}: HideHeaderProps) {
  const reduce = useReducedMotion()
  const [hidden, setHidden] = React.useState(false)
  const anchor = React.useRef(0)
  const { scrollY } = useScroll(container ? { container } : undefined)

  useMotionValueEvent(scrollY, "change", (y) => {
    if (y < revealTop) {
      anchor.current = y
      setHidden(false)
      return
    }
    // Keep the anchor at the furthest point in the current direction, toggle once we turn back by `threshold`.
    if (hidden ? y > anchor.current : y < anchor.current) anchor.current = y
    const delta = y - anchor.current
    if (!hidden && delta > threshold) {
      setHidden(true)
      anchor.current = y
    } else if (hidden && delta < -threshold) {
      setHidden(false)
      anchor.current = y
    }
  })

  return (
    <motion.header
      data-slot="hide-header"
      data-state={hidden ? "hidden" : "visible"}
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border bg-background/80 text-foreground backdrop-blur-md",
        hidden && "pointer-events-none",
        className
      )}
      initial={false}
      animate={reduce ? { opacity: hidden ? 0 : 1 } : { y: hidden ? "-100%" : "0%" }}
      transition={reduce ? cieTransition.fast : cieTransition.move}
      onFocusCapture={(e) => {
        setHidden(false)
        onFocusCapture?.(e)
      }}
      {...props}
    >
      {children}
    </motion.header>
  )
}

export { HideHeader }
