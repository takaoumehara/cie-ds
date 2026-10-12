"use client"

import * as React from "react"
import { motion, useReducedMotion, type HTMLMotionProps, type Variants } from "motion/react"

import { cn } from "@/lib/utils"
import { cieDuration, cieScroll, cieTransition } from "@/lib/cie-motion"

// UI Parts · Empty State (shadcn Empty lineage). A centred block: an icon in a round secondary tile,
// a light Outfit title, a muted description and an actions slot. On mount / first view the parts
// rise in one after another (y cieScroll.revealY → 0 on cieTransition.rise, staggered
// cieDuration.stagger × 4); the icon tile floats up with a slight scale.
// Reduced motion: parts fade in only, no travel.

function useRise(scale = false): Variants {
  const reduce = useReducedMotion()
  return {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: cieScroll.revealY, ...(scale ? { scale: 0.9 } : {}) },
    show: reduce
      ? { opacity: 1, transition: cieTransition.fast }
      : { opacity: 1, y: 0, scale: 1, transition: cieTransition.rise },
  }
}

function EmptyState({ className, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      data-slot="empty-state"
      className={cn("flex w-full flex-col items-center justify-center gap-3 p-8 text-center text-balance", className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: cieDuration.stagger * 4 } } }}
      {...props}
    />
  )
}

function EmptyStateIcon({ className, ...props }: HTMLMotionProps<"div">) {
  const variants = useRise(true)
  return (
    <motion.div
      data-slot="empty-state-icon"
      aria-hidden="true"
      variants={variants}
      className={cn(
        "mb-2 flex size-14 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground [&_svg]:size-6 [&_svg]:stroke-[1.5]",
        className
      )}
      {...props}
    />
  )
}

function EmptyStateTitle({ className, ...props }: HTMLMotionProps<"h3">) {
  const variants = useRise()
  return (
    <motion.h3
      data-slot="empty-state-title"
      variants={variants}
      className={cn("text-2xl font-[300] tracking-[-0.03em] text-foreground", className)}
      {...props}
    />
  )
}

function EmptyStateDescription({ className, ...props }: HTMLMotionProps<"p">) {
  const variants = useRise()
  return (
    <motion.p
      data-slot="empty-state-description"
      variants={variants}
      className={cn("max-w-sm text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function EmptyStateActions({ className, ...props }: HTMLMotionProps<"div">) {
  const variants = useRise()
  return (
    <motion.div
      data-slot="empty-state-actions"
      variants={variants}
      className={cn("mt-3 flex flex-wrap items-center justify-center gap-2", className)}
      {...props}
    />
  )
}

export { EmptyState, EmptyStateActions, EmptyStateDescription, EmptyStateIcon, EmptyStateTitle }
