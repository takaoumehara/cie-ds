"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "radix-ui"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// cie: floating page-radius panel inset from the viewport edge, slides on --cie-t-move / expo
// (the signature "block → page" timing). Mono register label slot via <SheetHeader>.

function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger(props: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose(props: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal(props: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-background/60",
        "duration-[var(--cie-t-move,360ms)] ease-cie-expo data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

const sideClasses = {
  right:
    "inset-y-2 right-2 w-[calc(100%-1rem)] sm:max-w-md data-[state=open]:slide-in-from-right-[110%] data-[state=closed]:slide-out-to-right-[110%]",
  left: "inset-y-2 left-2 w-[calc(100%-1rem)] sm:max-w-md data-[state=open]:slide-in-from-left-[110%] data-[state=closed]:slide-out-to-left-[110%]",
  top: "inset-x-2 top-2 max-h-[85vh] data-[state=open]:slide-in-from-top-[110%] data-[state=closed]:slide-out-to-top-[110%]",
  bottom:
    "inset-x-2 bottom-2 max-h-[85vh] data-[state=open]:slide-in-from-bottom-[110%] data-[state=closed]:slide-out-to-bottom-[110%]",
} as const

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: keyof typeof sideClasses
  showCloseButton?: boolean
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-50 flex flex-col gap-4 overflow-y-auto rounded-page border border-border bg-background p-6 text-foreground outline-none",
          "duration-[var(--cie-t-move,360ms)] ease-cie-expo data-[state=open]:animate-in data-[state=closed]:animate-out",
          sideClasses[side],
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            className={cn(
              "absolute top-5 right-5 inline-flex size-8 items-center justify-center rounded-full bg-secondary text-foreground",
              "transition-[background-color,scale,rotate] duration-[var(--cie-t-cell,320ms)] ease-cie-expo hover:rotate-90 hover:bg-secondary/70 active:scale-[var(--cie-press-scale,0.97)]",
              "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:size-4"
            )}
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-header" className={cn("flex flex-col gap-2 pr-10", className)} {...props} />
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-footer" className={cn("mt-auto flex flex-col gap-2", className)} {...props} />
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-3xl leading-[0.95] font-[300] tracking-[-0.04em]", className)}
      {...props}
    />
  )
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger }
