import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// cie: pill shape, weight-breath on hover (400 → 560), tap scale from --cie-press-scale,
// colour changes on --cie-t-cell / expo. No shadow.
const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-sans text-sm font-[400] tracking-[-0.01em] select-none",
    "transition-[background-color,color,border-color,font-weight,scale,opacity] duration-[var(--cie-t-cell,320ms)] ease-cie-expo",
    "hover:font-[560] active:scale-[var(--cie-press-scale,0.97)] active:duration-[var(--cie-t-snap,120ms)]",
    "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
    "disabled:pointer-events-none disabled:opacity-40 aria-invalid:ring-destructive/30",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-border bg-transparent text-foreground hover:border-foreground/40 hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70",
        ghost: "text-foreground hover:bg-accent",
        link: "rounded-none px-0 text-foreground underline decoration-transparent underline-offset-4 hover:decoration-current",
        destructive: "bg-destructive text-background hover:bg-destructive/90",
      },
      size: {
        default: "h-10 px-5 has-[>svg]:px-4",
        sm: "h-8 px-3.5 text-xs has-[>svg]:px-3",
        lg: "h-12 px-7 text-base has-[>svg]:px-6",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant ?? "default"}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
