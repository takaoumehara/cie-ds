"use client"

import * as React from "react"
import { motion, useInView, useReducedMotion, type Variants } from "motion/react"

import { cn } from "@/lib/utils"
import { cieDuration, cieEase } from "@/lib/cie-motion"

// Showcase · Split-text reveal (SmoothUI / Magic UI Text Animate lineage).
// Splits a string into words or characters and rises them in on view, staggered by
// --cie-t-stagger. Optional weight motion: glyphs land light (200) and settle at `weight`.
// Screen readers get the plain string once (aria-label); the pieces are aria-hidden.

type SplitTextProps = Omit<React.HTMLAttributes<HTMLElement>, "children"> & {
  children: string
  by?: "word" | "char"
  effect?: "rise" | "blur" | "mask" | "weight"
  /** Seconds before the first piece. */
  delay?: number
  /** Multiplier on --cie-t-stagger (24ms). */
  stagger?: number
  /** Final font-weight for the weight effect. */
  weight?: number
  once?: boolean
  as?: "span" | "h1" | "h2" | "h3" | "p"
}

const effects: Record<NonNullable<SplitTextProps["effect"]>, Variants> = {
  rise: { hidden: { opacity: 0, y: "0.45em" }, shown: { opacity: 1, y: 0 } },
  blur: { hidden: { opacity: 0, filter: "blur(8px)", y: "0.2em" }, shown: { opacity: 1, filter: "blur(0px)", y: 0 } },
  mask: { hidden: { y: "105%" }, shown: { y: 0 } },
  weight: { hidden: { opacity: 0, fontWeight: 200 }, shown: { opacity: 1, fontWeight: 500 } },
}

function SplitText({
  children,
  by = "word",
  effect = "rise",
  delay = 0,
  stagger,
  weight = 500,
  once = true,
  as = "span",
  className,
  style,
  ...props
}: SplitTextProps) {
  const ref = React.useRef<HTMLElement>(null)
  const inView = useInView(ref, { once, amount: 0.4 })
  const reduce = useReducedMotion()
  const Tag = as as React.ElementType
  const words = children.split(/(\s+)/)
  const step = cieDuration.stagger * (stagger ?? (by === "char" ? 1.5 : 4))
  const v = effect === "weight" ? { ...effects.weight, shown: { opacity: 1, fontWeight: weight } } : effects[effect]
  const duration = effect === "mask" ? cieDuration.move * 1.6 : cieDuration.rise * 1.5
  const ease = effect === "mask" ? cieEase.expo : cieEase.out

  let i = 0
  const piece = (text: string, key: string) => {
    const n = i++
    const inner = (
      <motion.span
        key={key}
        className="inline-block whitespace-pre"
        variants={v}
        transition={{ duration, ease, delay: delay + n * step }}
      >
        {text}
      </motion.span>
    )
    return effect === "mask" ? (
      <span key={key} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
        {inner}
      </span>
    ) : (
      inner
    )
  }

  return (
    <Tag
      ref={ref}
      data-slot="split-text"
      aria-label={children}
      className={cn("inline", className)}
      style={style}
      {...props}
    >
      <motion.span
        aria-hidden="true"
        initial={reduce ? false : "hidden"}
        animate={inView || reduce ? "shown" : "hidden"}
      >
        {words.map((w, wi) =>
          /^\s+$/.test(w) ? (
            <span key={`s${wi}`}>{w}</span>
          ) : by === "word" ? (
            piece(w, `w${wi}`)
          ) : (
            <span key={`w${wi}`} className="inline-block whitespace-nowrap">
              {Array.from(w).map((c, ci) => piece(c, `c${wi}-${ci}`))}
            </span>
          )
        )}
      </motion.span>
    </Tag>
  )
}

export { SplitText }
