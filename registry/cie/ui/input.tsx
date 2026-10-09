import * as React from "react"

import { cn } from "@/lib/utils"

// cie: block radius, hairline border that firms up on focus, mono-ready placeholder.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full min-w-0 rounded-md border border-input bg-transparent px-3.5 py-2 font-sans text-base text-foreground md:text-sm",
        "placeholder:text-muted-foreground selection:bg-foreground selection:text-background",
        "transition-[border-color,background-color,box-shadow] duration-[var(--cie-t-fast,180ms)] ease-cie-out",
        "hover:border-foreground/30",
        "outline-none focus-visible:border-foreground/60 focus-visible:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/30",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-mono file:text-xs file:uppercase file:text-foreground",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
