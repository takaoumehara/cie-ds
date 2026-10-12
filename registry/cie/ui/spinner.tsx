"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { cieDuration, cieTransition } from "@/lib/cie-motion"

// UI Parts · Spinner (status spinner lineage — loading that resolves in place).
// loading: a quarter arc spins (0.8s linear). success: the arc closes into a full ring and a check
// draws in. error: the ring turns destructive and an × draws in. idle: just the faint track.
// Glyph swaps run through AnimatePresence on cieTransition.cell. role="status" + aria-label per state.
// Reduced motion: no spin, glyphs appear without the draw.

type SpinnerState = "loading" | "success" | "error" | "idle"

type SpinnerProps = Omit<React.ComponentProps<"span">, "children"> & {
  state?: SpinnerState
  /** Accessible label per state. */
  labels?: Partial<Record<SpinnerState, string>>
}

const defaultLabels: Record<SpinnerState, string> = {
  loading: "Loading",
  success: "Done",
  error: "Error",
  idle: "Idle",
}

function Spinner({ state = "loading", labels, className, ...props }: SpinnerProps) {
  const reduce = useReducedMotion()
  const cell = reduce ? { duration: 0 } : cieTransition.cell
  const draw = reduce ? { duration: 0 } : { ...cieTransition.cell, delay: cieDuration.snap }
  const label = labels?.[state] ?? defaultLabels[state]
  const arc = state === "loading" ? 0.25 : state === "idle" ? 0 : 1

  return (
    <span
      role="status"
      aria-label={label}
      data-slot="spinner"
      data-state={state}
      className={cn(
        "inline-flex size-5 shrink-0 text-foreground transition-colors duration-[var(--cie-t-cell,320ms)] ease-cie-expo",
        state === "error" && "text-destructive",
        className
      )}
      {...props}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        className="size-full"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" strokeWidth={2} className="opacity-15" />
        <g
          className={cn(
            "origin-center [transform-box:fill-box]",
            state !== "idle" && "animate-spin [animation-duration:800ms] motion-reduce:animate-none"
          )}
        >
          <motion.circle
            cx="12"
            cy="12"
            r="10"
            strokeWidth={2}
            transform="rotate(-90 12 12)"
            initial={false}
            animate={{ pathLength: arc, opacity: arc === 0 ? 0 : 1 }}
            transition={cell}
          />
        </g>
        <AnimatePresence initial={false}>
          {state === "success" && (
            <motion.path
              key="check"
              d="M7.5 12.5l3 3 6-6.5"
              strokeWidth={2.25}
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={draw}
            />
          )}
          {state === "error" && (
            <motion.path
              key="x"
              d="M8.5 8.5l7 7M15.5 8.5l-7 7"
              strokeWidth={2.25}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={draw}
            />
          )}
        </AnimatePresence>
      </svg>
    </span>
  )
}

export { Spinner }
export type { SpinnerState }
