"use client"

import * as React from "react"
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"
import { CheckIcon, CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// cie: lineage — shadcn DropdownMenu on Radix. Same paper panel as Popover (--cie-r radius, hairline border,
// no shadow), scaling from the trigger origin 0.96 → 1 on --cie-t-cell / expo.
// Behaviour: items are h-9 rounded blocks; the highlighted item fills bg-secondary and its label nudges 2px
// right — the cie "press" behaviour — on --cie-t-fast / ease-cie-out.
// Reduced motion: motion-reduce removes the panel scale and the label nudge — colour/opacity only.

function DropdownMenu(props: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuTrigger(props: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

function DropdownMenuGroup(props: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

function DropdownMenuRadioGroup(props: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
}

function DropdownMenuContent({
  className,
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[11rem] overflow-x-hidden overflow-y-auto",
          "rounded-[var(--cie-r)] border border-border bg-background p-1.5 text-foreground outline-none",
          "origin-(--radix-dropdown-menu-content-transform-origin)",
          "duration-[var(--cie-t-cell,320ms)] ease-cie-expo",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.96]",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.96] data-[state=closed]:duration-[var(--cie-t-fast,180ms)]",
          "motion-reduce:zoom-in-100 motion-reduce:zoom-out-100",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

const itemBase = cn(
  "group/item relative flex h-9 cursor-default items-center gap-2 rounded-[calc(var(--cie-r)-4px)] px-2.5 text-sm font-[400] outline-none select-none",
  "transition-colors duration-[var(--cie-t-fast,180ms)] ease-cie-out",
  "data-[highlighted]:bg-secondary data-[highlighted]:text-secondary-foreground",
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
)

/** The part that nudges 2px right while its item is highlighted. */
function ItemLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      data-slot="dropdown-menu-item-label"
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2",
        "transition-transform duration-[var(--cie-t-fast,180ms)] ease-cie-out",
        "group-data-[highlighted]/item:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-data-[highlighted]/item:translate-x-0"
      )}
    >
      {children}
    </span>
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        itemBase,
        "data-[inset]:pl-8",
        "data-[variant=destructive]:text-destructive data-[variant=destructive]:data-[highlighted]:bg-destructive/10 data-[variant=destructive]:data-[highlighted]:text-destructive",
        className
      )}
      {...props}
    >
      <ItemLabel>{children}</ItemLabel>
    </DropdownMenuPrimitive.Item>
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(itemBase, "pl-8", className)}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2.5 flex size-4 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator data-slot="dropdown-menu-checkbox-indicator">
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      <ItemLabel>{children}</ItemLabel>
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(itemBase, "pl-8", className)}
      {...props}
    >
      <span className="pointer-events-none absolute left-2.5 flex size-4 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator data-slot="dropdown-menu-radio-indicator">
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      <ItemLabel>{children}</ItemLabel>
    </DropdownMenuPrimitive.RadioItem>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & { inset?: boolean }) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2.5 pt-2 pb-1.5 font-mono text-xs tracking-[0.02em] text-muted-foreground uppercase data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1.5 my-1.5 h-px bg-border", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn("ml-auto pl-4 font-mono text-xs tracking-[0.02em] text-muted-foreground uppercase", className)}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
}
