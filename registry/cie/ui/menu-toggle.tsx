"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { cieTransition } from "@/lib/cie-motion"

// UI Parts · Menu Toggle (cie site nav.css lineage — the vanilla hamburger → X morph, in React).
// Three ink bars on a pill: when open, the outer bars translate to the centre and rotate ±45°
// while the middle bar collapses (scaleX → 0), on cieTransition.move (360ms expo).
// aria-expanded + an aria-label that flips "Open menu" / "Close menu". Controlled or uncontrolled.
// Reduced motion: the bars swap instantly (no rotate / translate travel).

type MenuToggleProps = Omit<React.ComponentProps<"button">, "onChange"> & {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Accessible labels for the closed / open state. */
  labels?: { open: string; close: string }
}

const GAP = 7 // bar height 2px + gap 5px → distance between bar centres

function MenuToggle({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  labels = { open: "Open menu", close: "Close menu" },
  className,
  onClick,
  ...props
}: MenuToggleProps) {
  const [inner, setInner] = React.useState(defaultOpen)
  const open = openProp ?? inner
  const reduce = useReducedMotion()
  const t = reduce ? { duration: 0 } : cieTransition.move
  const fade = reduce ? { duration: 0 } : cieTransition.fast

  return (
    <button
      type="button"
      data-slot="menu-toggle"
      data-state={open ? "open" : "closed"}
      aria-expanded={open}
      aria-label={open ? labels.close : labels.open}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented) return
        setInner(!open)
        onOpenChange?.(!open)
      }}
      className={cn(
        "relative inline-flex size-11 shrink-0 flex-col items-center justify-center gap-[5px] rounded-full bg-secondary text-foreground select-none",
        "transition-[background-color,scale] duration-[var(--cie-t-cell,320ms)] ease-cie-expo hover:bg-secondary/70",
        "active:scale-[var(--cie-press-scale,0.97)] active:duration-[var(--cie-t-snap,120ms)] motion-reduce:active:scale-100",
        "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40",
        className
      )}
      {...props}
    >
      <motion.span
        data-slot="menu-toggle-bar"
        aria-hidden="true"
        className="block h-0.5 w-[18px] rounded-[1px] bg-current"
        initial={false}
        animate={open ? { y: GAP, rotate: 45 } : { y: 0, rotate: 0 }}
        transition={t}
      />
      <motion.span
        data-slot="menu-toggle-bar"
        aria-hidden="true"
        className="block h-0.5 w-[18px] rounded-[1px] bg-current"
        initial={false}
        animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={{ scaleX: t, opacity: fade }}
      />
      <motion.span
        data-slot="menu-toggle-bar"
        aria-hidden="true"
        className="block h-0.5 w-[18px] rounded-[1px] bg-current"
        initial={false}
        animate={open ? { y: -GAP, rotate: -45 } : { y: 0, rotate: 0 }}
        transition={t}
      />
    </button>
  )
}

export { MenuToggle }
