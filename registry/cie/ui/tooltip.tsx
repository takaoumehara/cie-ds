"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// cie: lineage — shadcn Tooltip on Radix. An inverted ink-on-paper pill (bg-primary) with small text.
// Behaviour: opens with fade + 4px slide from the trigger side + scale 0.96 → 1 over --cie-t-fast / ease-cie-out
// (tw-animate-css data-[state] utilities). Provider defaults to a 200ms delay.
// Reduced motion: motion-reduce drops the slide and scale — opacity only.

function TooltipProvider({ delayDuration = 200, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />
}

function Tooltip(props: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

function TooltipTrigger(props: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 6,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-fit max-w-xs rounded-full bg-primary px-3 py-1.5 text-xs font-[400] tracking-[-0.005em] text-balance text-primary-foreground",
          "origin-(--radix-tooltip-content-transform-origin)",
          "duration-[var(--cie-t-fast,180ms)] ease-cie-out",
          "animate-in fade-in-0 zoom-in-[0.96]",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.96]",
          "data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1",
          "motion-reduce:zoom-in-100 motion-reduce:zoom-out-100 motion-reduce:slide-in-from-top-0 motion-reduce:slide-in-from-bottom-0 motion-reduce:slide-in-from-left-0 motion-reduce:slide-in-from-right-0",
          className
        )}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
