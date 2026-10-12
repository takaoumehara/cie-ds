"use client"

import * as React from "react"
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react"

import { cn } from "@/lib/utils"

// Scroll · Text fill on scroll (Aceternity / Apple "text reveal" lineage), scroll-linked 14.
// A paragraph sits muted (each word at `from` opacity, default 0.2) and fills with ink word by
// word as the element travels through the viewport (offset "start 0.85" → "end 0.4").
// Uses window scroll; pass `container` for an inner scroller. Words remain plain text, so screen
// readers read the paragraph normally.
// Reduced motion: full ink, nothing scroll-linked.

type TextFillProps = Omit<React.HTMLAttributes<HTMLElement>, "children"> & {
  /** The paragraph. Split on whitespace into words. */
  children: string
  /** Opacity of a word before it fills. */
  from?: number
  /** Scroll container (defaults to the window). */
  container?: React.RefObject<HTMLElement | null>
  as?: "p" | "h1" | "h2" | "h3" | "div" | "span"
}

function TextFill({ children, from = 0.2, container, as = "p", className, ...props }: TextFillProps) {
  const ref = React.useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const Tag = as as React.ElementType
  const { scrollYProgress } = useScroll({
    target: ref,
    container,
    offset: ["start 0.85", "end 0.4"],
  })
  const words = children.split(/\s+/).filter(Boolean)
  const n = words.length

  return (
    <Tag ref={ref} data-slot="text-fill" className={cn("text-foreground", className)} {...props}>
      {words.map((w, i) => (
        <React.Fragment key={i}>
          {reduce ? (
            <span data-slot="text-fill-word">{w}</span>
          ) : (
            <Word progress={scrollYProgress} range={[i / n, (i + 1) / n]} from={from}>
              {w}
            </Word>
          )}
          {i < n - 1 ? " " : null}
        </React.Fragment>
      ))}
    </Tag>
  )
}

function Word({
  progress,
  range,
  from,
  children,
}: {
  progress: MotionValue<number>
  range: [number, number]
  from: number
  children: string
}) {
  const opacity = useTransform(progress, range, [from, 1])
  return (
    <motion.span data-slot="text-fill-word" style={{ opacity }}>
      {children}
    </motion.span>
  )
}

export { TextFill }
