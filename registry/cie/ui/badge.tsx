"use client"

import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { cieTransition } from "@/lib/cie-motion"

// UI Parts · Badge + CountBadge (shadcn Badge lineage + notification-dot pattern).
// <Badge>: a small static pill label — default (ink), secondary, outline, destructive.
// <CountBadge>: wraps a control (e.g. a bell button) and pins an ink count bubble to its top-right.
// The bubble pops in / out with cieTransition.spring; digit changes roll vertically (up when the
// count rises, down when it falls) via AnimatePresence popLayout; above `max` it reads "99+"; 0 hides it.
// Reduced motion: bubble and digits swap instantly.

const badgeVariants = cva(
  [
    "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2.5 py-0.5 text-xs font-[460] whitespace-nowrap",
    "transition-[background-color,color,border-color] duration-[var(--cie-t-cell,320ms)] ease-cie-expo",
    "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary: "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/70",
        outline: "border-border text-foreground [a&]:hover:bg-accent",
        destructive: "border-transparent bg-destructive text-background [a&]:hover:bg-destructive/90",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"
  return (
    <Comp
      data-slot="badge"
      data-variant={variant ?? "default"}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

type CountBadgeProps = React.ComponentProps<"span"> & {
  count: number
  /** Above this the bubble reads `${max}+`. */
  max?: number
  /** Screen-reader text for the count (the bubble itself is aria-hidden). */
  srLabel?: (count: number) => string
}

function CountBadge({
  count,
  max = 99,
  srLabel = (n) => `${n} unread`,
  className,
  children,
  ...props
}: CountBadgeProps) {
  const reduce = useReducedMotion()
  const display = count > max ? `${max}+` : String(count)
  const prev = React.useRef(count)
  const dir = count >= prev.current ? 1 : -1
  React.useEffect(() => {
    prev.current = count
  }, [count])
  const pop = reduce ? { duration: 0 } : cieTransition.spring
  const roll = reduce ? { duration: 0 } : cieTransition.fast

  return (
    <span data-slot="count-badge" className={cn("relative inline-flex", className)} {...props}>
      {children}
      <AnimatePresence initial={false}>
        {count > 0 && (
          <motion.span
            key="bubble"
            data-slot="count-badge-bubble"
            aria-hidden="true"
            className="pointer-events-none absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center overflow-hidden rounded-full bg-primary px-1 font-mono text-[10px] leading-none text-primary-foreground tabular-nums ring-2 ring-background"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={pop}
          >
            <AnimatePresence initial={false} mode="popLayout" custom={dir}>
              <motion.span
                key={display}
                custom={dir}
                variants={{
                  enter: (d: number) => ({ y: reduce ? 0 : `${d * 100}%`, opacity: 0 }),
                  center: { y: 0, opacity: 1 },
                  exit: (d: number) => ({ y: reduce ? 0 : `${d * -100}%`, opacity: 0 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={roll}
                className="inline-block"
              >
                {display}
              </motion.span>
            </AnimatePresence>
          </motion.span>
        )}
      </AnimatePresence>
      {count > 0 && <span className="sr-only">{srLabel(count)}</span>}
    </span>
  )
}

export { Badge, badgeVariants, CountBadge }
