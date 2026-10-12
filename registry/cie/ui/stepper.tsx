"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { MinusIcon, PlusIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { cieTransition } from "@/lib/cie-motion"

// UI · Numeric stepper (iOS stepper / odometer lineage). −/+ round icon buttons around a number.
// - The number rolls: incrementing pushes the old value up and the new one rises from below;
//   decrementing does the reverse (AnimatePresence popLayout, cieTransition.fast).
// - role="spinbutton" on the wrapper with aria-valuenow/min/max; ArrowUp/Down, PageUp/Down,
//   Home/End step the value. Buttons disable at the bounds.
// Reduced motion: the number swaps instantly.

type StepperProps = Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> & {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  /** Formats the displayed number (aria-valuetext follows it when it returns a string). */
  formatValue?: (value: number) => React.ReactNode
}

function Stepper({
  value: valueProp,
  defaultValue,
  onValueChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  disabled = false,
  formatValue = (v) => v,
  className,
  onKeyDown,
  ...props
}: StepperProps) {
  const [inner, setInner] = React.useState(defaultValue ?? (Number.isFinite(min) ? min : 0))
  const value = valueProp ?? inner
  const [dir, setDir] = React.useState<1 | -1>(1)
  const reduce = useReducedMotion()

  const set = (next: number) => {
    const clamped = Math.min(max, Math.max(min, next))
    if (clamped === value) return
    setDir(clamped > value ? 1 : -1)
    setInner(clamped)
    onValueChange?.(clamped)
  }

  const label = formatValue(value)
  const offset = "0.9em"

  return (
    <div
      data-slot="stepper"
      role="spinbutton"
      tabIndex={disabled ? -1 : 0}
      aria-valuenow={value}
      aria-valuemin={Number.isFinite(min) ? min : undefined}
      aria-valuemax={Number.isFinite(max) ? max : undefined}
      aria-valuetext={typeof label === "string" ? label : undefined}
      aria-disabled={disabled || undefined}
      onKeyDown={(e) => {
        onKeyDown?.(e)
        if (disabled || e.defaultPrevented) return
        const map: Record<string, number> = {
          ArrowUp: value + step,
          ArrowRight: value + step,
          ArrowDown: value - step,
          ArrowLeft: value - step,
          PageUp: value + step * 10,
          PageDown: value - step * 10,
        }
        if (e.key in map) set(map[e.key])
        else if (e.key === "Home" && Number.isFinite(min)) set(min)
        else if (e.key === "End" && Number.isFinite(max)) set(max)
        else return
        e.preventDefault()
      }}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border p-1",
        "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-disabled:opacity-40",
        className
      )}
      {...props}
    >
      <StepperButton
        aria-label="Decrease"
        tabIndex={-1}
        disabled={disabled || value - step < min}
        onClick={() => set(value - step)}
      >
        <MinusIcon />
      </StepperButton>
      <span
        data-slot="stepper-value"
        className="relative inline-flex h-8 min-w-[3ch] items-center justify-center overflow-hidden px-1 text-sm font-[520] tabular-nums"
      >
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.span
            key={value}
            custom={dir}
            variants={{
              enter: (d: 1 | -1) => ({ y: reduce ? 0 : d > 0 ? offset : `-${offset}`, opacity: 0 }),
              center: { y: 0, opacity: 1 },
              exit: (d: 1 | -1) => ({ y: reduce ? 0 : d > 0 ? `-${offset}` : offset, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={reduce ? { duration: 0 } : cieTransition.fast}
            className="inline-block"
          >
            {label}
          </motion.span>
        </AnimatePresence>
      </span>
      <StepperButton
        aria-label="Increase"
        tabIndex={-1}
        disabled={disabled || value + step > max}
        onClick={() => set(value + step)}
      >
        <PlusIcon />
      </StepperButton>
    </div>
  )
}

function StepperButton({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="stepper-button"
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground",
        "transition-[background-color,scale,opacity] duration-[var(--cie-t-cell,320ms)] ease-cie-expo hover:bg-secondary/70",
        "active:scale-[var(--cie-press-scale,0.97)] active:duration-[var(--cie-t-snap,120ms)] motion-reduce:active:scale-100",
        "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40",
        "[&_svg]:pointer-events-none [&_svg]:size-4",
        className
      )}
      {...props}
    />
  )
}

export { Stepper }
