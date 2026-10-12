"use client"

import * as React from "react"
import { motion, useInView, useReducedMotion, type Variants } from "motion/react"

import { cn } from "@/lib/utils"
import { cieBlur, cieDuration, cieEase, cieScroll } from "@/lib/cie-motion"

// Showcase · Reveal on scroll (SmoothUI / cie scroll.css lineage), now in motion.
// <Reveal variant>        — one element.
// <RevealGroup> + <Reveal> — children stagger by --cie-t-stagger (24ms) × `stagger`.
// Variants: rise (default) · fade · blur (blur-in, --cie-blur-in) · slide · scale ·
//   clip / mask (mask reveal — wipes up from a clip-path edge) · clip-left (wipes in left → right).
// Reduced motion: renders in its shown state, no movement.

const variants: Record<string, Variants> = {
  rise: { hidden: { opacity: 0, y: cieScroll.revealY }, shown: { opacity: 1, y: 0 } },
  fade: { hidden: { opacity: 0 }, shown: { opacity: 1 } },
  blur: {
    hidden: { opacity: 0, y: 8, filter: `blur(${cieBlur.in}px)` },
    shown: { opacity: 1, y: 0, filter: "blur(0px)" },
  },
  slide: { hidden: { opacity: 0, x: -cieScroll.revealX * 2 }, shown: { opacity: 1, x: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.92 }, shown: { opacity: 1, scale: 1 } },
  clip: {
    hidden: { clipPath: "inset(100% 0% 0% 0%)", y: 12 },
    shown: { clipPath: "inset(0% 0% 0% 0%)", y: 0 },
  },
  "clip-left": {
    hidden: { clipPath: "inset(0% 100% 0% 0%)", x: -12 },
    shown: { clipPath: "inset(0% 0% 0% 0%)", x: 0 },
  },
}
variants.mask = variants.clip

type RevealVariant = "rise" | "fade" | "blur" | "slide" | "scale" | "clip" | "mask" | "clip-left"

const GroupCtx = React.createContext<{ inGroup: boolean }>({ inGroup: false })

type RevealProps = React.ComponentProps<typeof motion.div> & {
  variant?: RevealVariant
  /** Seconds. */
  delay?: number
  /** Seconds — defaults to --cie-t-rise (or --cie-t-move for the clip / mask wipes). */
  duration?: number
  /** Replay every time it re-enters the viewport. */
  repeat?: boolean
  /** Fraction visible before triggering. */
  amount?: number
}

function Reveal({
  variant = "rise",
  delay = 0,
  duration,
  repeat = false,
  amount = 0.25,
  className,
  children,
  ...props
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const { inGroup } = React.useContext(GroupCtx)
  const inView = useInView(ref, { once: !repeat, amount, margin: "0px 0px -8% 0px" })
  const reduce = useReducedMotion()
  const wipe = variant === "clip" || variant === "mask" || variant === "clip-left"
  const d = duration ?? (wipe ? cieDuration.move * 2 : cieDuration.rise * 1.5)
  return (
    <motion.div
      ref={ref}
      data-slot="reveal"
      className={cn(className)}
      variants={variants[variant]}
      initial={reduce ? false : "hidden"}
      {...(inGroup ? {} : { animate: inView || reduce ? "shown" : "hidden" })}
      transition={{ duration: d, ease: wipe ? cieEase.expo : cieEase.out, delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

type RevealGroupProps = React.ComponentProps<typeof motion.div> & {
  /** Multiplier on --cie-t-stagger (24ms). Default 3 → 72ms between items. */
  stagger?: number
  repeat?: boolean
  amount?: number
}

function RevealGroup({ stagger = 3, repeat = false, amount = 0.2, className, children, ...props }: RevealGroupProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: !repeat, amount })
  const reduce = useReducedMotion()
  return (
    <GroupCtx.Provider value={{ inGroup: true }}>
      <motion.div
        ref={ref}
        data-slot="reveal-group"
        className={className}
        initial={reduce ? false : "hidden"}
        animate={inView || reduce ? "shown" : "hidden"}
        variants={{ hidden: {}, shown: { transition: { staggerChildren: cieDuration.stagger * stagger } } }}
        {...props}
      >
        {children}
      </motion.div>
    </GroupCtx.Provider>
  )
}

export { Reveal, RevealGroup, type RevealVariant }
