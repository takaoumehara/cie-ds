"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"
import { motion, MotionConfig, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { cieTransition } from "@/lib/cie-motion"

// UI · Switch (shadcn / Radix lineage). Pill track paper → ink on --cie-t-cell expo.
// - The thumb is a layout element: it slides between ends on cieTransition.spring.
// - While pressed the thumb squashes a little wider (Apple-style stretch), released on spring.
// Reduced motion: MotionConfig "always" → thumb jumps, colours still swap.

function Switch({
  className,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  const reduce = useReducedMotion()
  const [pressed, setPressed] = React.useState(false)
  return (
    <MotionConfig reducedMotion={reduce ? "always" : "never"}>
      <SwitchPrimitive.Root
        data-slot="switch"
        className={cn(
          "peer inline-flex h-6 w-10 shrink-0 cursor-pointer items-center justify-start rounded-full bg-secondary p-0.5",
          "transition-[background-color,opacity] duration-[var(--cie-t-cell,320ms)] ease-cie-expo",
          "data-[state=checked]:justify-end data-[state=checked]:bg-primary",
          "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-40",
          className
        )}
        onPointerDown={(e) => {
          setPressed(true)
          onPointerDown?.(e)
        }}
        onPointerUp={(e) => {
          setPressed(false)
          onPointerUp?.(e)
        }}
        onPointerLeave={(e) => {
          setPressed(false)
          onPointerLeave?.(e)
        }}
        onPointerCancel={(e) => {
          setPressed(false)
          onPointerCancel?.(e)
        }}
        {...props}
      >
        <SwitchPrimitive.Thumb asChild>
          <motion.span
            data-slot="switch-thumb"
            layout
            transition={cieTransition.spring}
            className={cn(
              "pointer-events-none block h-5 rounded-full bg-background",
              "data-[state=checked]:bg-primary-foreground",
              pressed ? "w-6" : "w-5"
            )}
          />
        </SwitchPrimitive.Thumb>
      </SwitchPrimitive.Root>
    </MotionConfig>
  )
}

export { Switch }
