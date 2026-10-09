"use client"

import * as React from "react"
import { Accordion as AccordionPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// Micro · Smooth Accordion (transitions.dev lineage) on Radix Accordion.
// Height opens on --cie-t-move / expo (via the accordion-down/up keyframes that ship
// with tw-animate-css), the body rises + un-blurs a beat later, and the + rotates to ×.
// Big Outfit rows with a hairline divider — the cie list language.

function SmoothAccordion(props: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

function SmoothAccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b border-border first:border-t", className)}
      {...props}
    />
  )
}

function SmoothAccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/acc flex flex-1 items-center justify-between gap-6 py-5 text-left text-xl font-[300] tracking-[-0.02em]",
          "transition-[font-weight,translate] duration-[var(--cie-t-cell,320ms)] ease-cie-expo hover:font-[460] hover:translate-x-[var(--cie-hover-nudge,3px)] data-[state=open]:font-[460]",
          "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40",
          className
        )}
        {...props}
      >
        {children}
        <span
          aria-hidden="true"
          className="relative inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary transition-[rotate,background-color] duration-[var(--cie-t-move,360ms)] ease-cie-expo group-data-[state=open]/acc:rotate-[135deg] group-data-[state=open]/acc:bg-primary group-data-[state=open]/acc:text-primary-foreground"
        >
          <span className="absolute h-px w-3 bg-current" />
          <span className="absolute h-3 w-px bg-current" />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function SmoothAccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className={cn(
        "group/content overflow-hidden",
        "duration-[var(--cie-t-move,360ms)] ease-cie-expo data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      )}
      {...props}
    >
      <div
        className={cn(
          "pb-6 text-sm leading-relaxed text-muted-foreground",
          "transition-[opacity,translate,filter] duration-[var(--cie-t-rise,400ms)] ease-cie-out",
          "starting:-translate-y-2 starting:opacity-0 starting:blur-[3px] [transition-delay:60ms]",
          "group-data-[state=closed]/content:-translate-y-2 group-data-[state=closed]/content:opacity-0 group-data-[state=closed]/content:blur-[3px] group-data-[state=closed]/content:[transition-delay:0ms]",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}

export { SmoothAccordion, SmoothAccordionContent, SmoothAccordionItem, SmoothAccordionTrigger }
