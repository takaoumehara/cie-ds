"use client"

import * as React from "react"
import { NavigationMenu as NavigationMenuPrimitive } from "radix-ui"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// UI Parts · Mega Menu (shadcn Navigation Menu lineage) on Radix NavigationMenu.
// One shared viewport panel (rounded-page, hairline border, paper) sits under the list; its width and
// height glide between items via Radix's --radix-navigation-menu-viewport-width/height on
// --cie-t-move / expo. Content slides in from the side you moved towards (data-motion
// from-start / from-end / to-start / to-end, tw-animate-css). Chevron turns 180° on open.
// Links take the cie press nudge. Keyboard + aria from Radix.
// Reduced motion: no slide, no size glide — panels swap instantly.

function MegaMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & { viewport?: boolean }) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="mega-menu"
      data-viewport={viewport}
      className={cn("relative z-10 flex max-w-max flex-1 items-center justify-center", className)}
      {...props}
    >
      {children}
      {viewport && <MegaMenuViewport />}
    </NavigationMenuPrimitive.Root>
  )
}

function MegaMenuList({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="mega-menu-list"
      className={cn("group flex flex-1 list-none items-center justify-center gap-1", className)}
      {...props}
    />
  )
}

function MegaMenuItem({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return <NavigationMenuPrimitive.Item data-slot="mega-menu-item" className={cn("relative", className)} {...props} />
}

const triggerStyle = cn(
  "group/trigger inline-flex h-9 w-max items-center justify-center gap-1 rounded-full px-4 text-sm font-[400] text-foreground",
  "transition-[background-color,font-weight] duration-[var(--cie-t-cell,320ms)] ease-cie-expo",
  "hover:bg-accent hover:font-[520] data-[state=open]:bg-accent data-[state=open]:font-[520]",
  "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40"
)

function MegaMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger data-slot="mega-menu-trigger" className={cn(triggerStyle, className)} {...props}>
      {children}
      <ChevronDownIcon
        aria-hidden="true"
        className="relative top-px size-3.5 text-muted-foreground transition-transform duration-[var(--cie-t-move,360ms)] ease-cie-expo group-data-[state=open]/trigger:rotate-180 motion-reduce:transition-none"
      />
    </NavigationMenuPrimitive.Trigger>
  )
}

function MegaMenuContent({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="mega-menu-content"
      className={cn(
        "top-0 left-0 w-full p-3 md:absolute md:w-auto",
        "duration-[var(--cie-t-move,360ms)] ease-cie-expo",
        "data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in data-[motion^=to-]:animate-out data-[motion^=to-]:fade-out",
        "data-[motion=from-end]:slide-in-from-right-12 data-[motion=from-start]:slide-in-from-left-12",
        "data-[motion=to-end]:slide-out-to-right-12 data-[motion=to-start]:slide-out-to-left-12",
        "motion-reduce:animate-none",
        className
      )}
      {...props}
    />
  )
}

function MegaMenuViewport({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div className="absolute top-full left-0 isolate z-50 flex justify-center">
      <NavigationMenuPrimitive.Viewport
        data-slot="mega-menu-viewport"
        className={cn(
          "relative mt-2 h-[var(--radix-navigation-menu-viewport-height)] w-full origin-top-left overflow-hidden rounded-page border border-border bg-background text-foreground md:w-[var(--radix-navigation-menu-viewport-width)]",
          "transition-[width,height] duration-[var(--cie-t-move,360ms)] ease-cie-expo",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.97]",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.97]",
          "motion-reduce:animate-none motion-reduce:transition-none",
          className
        )}
        {...props}
      />
    </div>
  )
}

function MegaMenuLink({
  className,
  variant = "item",
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link> & {
  /** "item" = a row inside a panel; "trigger" = a plain top-level link styled like a trigger. */
  variant?: "item" | "trigger"
}) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="mega-menu-link"
      className={cn(
        variant === "trigger"
          ? triggerStyle
          : cn(
              "flex flex-col gap-1 rounded-[var(--cie-r)] p-3 text-sm",
              "transition-[background-color,translate] duration-[var(--cie-t-fast,180ms)] ease-cie-out",
              "hover:translate-x-[var(--cie-hover-nudge,3px)] hover:bg-accent focus:bg-accent motion-reduce:hover:translate-x-0",
              "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
              "data-[active=true]:font-[520]"
            ),
        className
      )}
      {...props}
    />
  )
}

export { MegaMenu, MegaMenuContent, MegaMenuItem, MegaMenuLink, MegaMenuList, MegaMenuTrigger, MegaMenuViewport }
