"use client"

import * as React from "react"
import { useInView, useMotionValue, useReducedMotion, useSpring } from "motion/react"

import { cn } from "@/lib/utils"

// Showcase · Number ticker (Magic UI lineage). Counts to `value` with a critically-damped
// spring when scrolled into view. Tabular figures so the width never jitters.

type NumberTickerProps = Omit<React.ComponentProps<"span">, "children"> & {
  value: number
  from?: number
  decimals?: number
  /** Seconds before counting starts. */
  delay?: number
  locale?: string
}

function NumberTicker({ value, from = 0, decimals = 0, delay = 0, locale, className, ...props }: NumberTickerProps) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()
  const mv = useMotionValue(reduce ? value : from)
  const spring = useSpring(mv, { stiffness: 70, damping: 26, mass: 1 })
  const fmt = React.useMemo(
    () => new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }),
    [locale, decimals]
  )

  React.useEffect(() => {
    if (!inView) return
    const t = setTimeout(() => mv.set(value), delay * 1000)
    return () => clearTimeout(t)
  }, [inView, value, delay, mv])

  React.useEffect(
    () =>
      spring.on("change", (v) => {
        if (ref.current) ref.current.textContent = fmt.format(Number(v.toFixed(decimals)))
      }),
    [spring, fmt, decimals]
  )

  return (
    <span ref={ref} data-slot="number-ticker" className={cn("inline-block tabular-nums", className)} {...props}>
      {fmt.format(reduce ? value : from)}
    </span>
  )
}

export { NumberTicker }
