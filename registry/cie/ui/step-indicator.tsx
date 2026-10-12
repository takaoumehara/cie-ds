"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { cieDuration, cieTransition } from "@/lib/cie-motion"

// UI Parts · Step Indicator (stepper / progress-steps lineage).
// Circles joined by hairlines. A completed step fills with ink and its check draws in (pathLength),
// the hairline to the next step fills left → right (scaleX, origin-left) on cieTransition.move;
// the current step carries a soft ring. Mono uppercase labels; aria-current="step" on the current one.
// Reduced motion: state changes are instant (no draw, no fill sweep).

type StepIndicatorProps = Omit<React.ComponentProps<"ol">, "children"> & {
  steps: string[]
  /** Zero-based index of the current step. Steps before it are complete; steps.length = all done. */
  current: number
}

function StepIndicator({ steps, current, className, ...props }: StepIndicatorProps) {
  const reduce = useReducedMotion()
  const move = reduce ? { duration: 0 } : cieTransition.move
  const draw = reduce ? { duration: 0 } : { ...cieTransition.cell, delay: cieDuration.fast }
  const fade = reduce ? { duration: 0 } : cieTransition.fast

  return (
    <ol data-slot="step-indicator" className={cn("flex w-full items-start", className)} {...props}>
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        const last = i === steps.length - 1
        return (
          <li
            key={i}
            data-slot="step-indicator-step"
            data-state={done ? "complete" : active ? "current" : "upcoming"}
            aria-current={active ? "step" : undefined}
            className={cn("flex items-start", !last && "flex-1")}
          >
            <div className="flex flex-col items-center gap-2">
              <span
                data-slot="step-indicator-dot"
                className={cn(
                  "relative inline-flex size-8 shrink-0 items-center justify-center rounded-full border font-mono text-xs tabular-nums",
                  "transition-[background-color,border-color,color,box-shadow] duration-[var(--cie-t-cell,320ms)] ease-cie-expo motion-reduce:transition-none",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-foreground text-foreground ring-[3px] ring-foreground/15",
                  !done && !active && "border-border text-muted-foreground"
                )}
              >
                <AnimatePresence initial={false} mode="wait">
                  {done ? (
                    <motion.svg
                      key="check"
                      viewBox="0 0 24 24"
                      className="size-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      exit={{ opacity: 0 }}
                      transition={fade}
                    >
                      <motion.path
                        d="M5 12.5l4.5 4.5L19 7.5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={draw}
                      />
                    </motion.svg>
                  ) : (
                    <motion.span
                      key="num"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={fade}
                    >
                      {i + 1}
                    </motion.span>
                  )}
                </AnimatePresence>
                <span className="sr-only">{done ? " (complete)" : ""}</span>
              </span>
              <span
                data-slot="step-indicator-label"
                className={cn(
                  "font-mono text-xs whitespace-nowrap uppercase transition-colors duration-[var(--cie-t-cell,320ms)] ease-cie-expo",
                  done || active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
            {!last && (
              <span
                data-slot="step-indicator-connector"
                aria-hidden="true"
                className="relative mx-2 mt-4 h-px flex-1 overflow-hidden bg-border"
              >
                <motion.span
                  className="absolute inset-0 origin-left bg-foreground"
                  initial={false}
                  animate={{ scaleX: done ? 1 : 0 }}
                  transition={move}
                />
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}

export { StepIndicator }
