"use client"

import * as React from "react"
import { Toast as ToastPrimitive } from "radix-ui"
import { CheckIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// cie: lineage — shadcn (Radix) Toast + a tiny sonner-style imperative queue.
// An ink pill (bg-primary / text-primary-foreground, --cie-r radius, no shadow), optional check icon;
// variant "destructive" swaps to bg-destructive (the only extra hue, errors only).
// Behaviour: rises from the bottom (y 100% → 0) on --cie-t-rise / ease-cie-out (cieTransition.rise in CSS form);
// swipe right to dismiss (follows --radix-toast-swipe-move-x, snaps back on cancel, flies out on end).
// Usage: render <Toaster /> once, then call toast("Saved") / toast("Failed", { variant: "destructive" }).
// Reduced motion: motion-reduce removes the rise / slide — opacity only; swipe still dismisses.

/* ------------------------------------------------------------------ primitives */

function ToastProvider({ swipeDirection = "right", ...props }: React.ComponentProps<typeof ToastPrimitive.Provider>) {
  return <ToastPrimitive.Provider swipeDirection={swipeDirection} {...props} />
}

function ToastViewport({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Viewport>) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "fixed right-0 bottom-0 z-[100] m-0 flex max-h-screen w-full list-none flex-col-reverse gap-2 p-4 outline-none sm:max-w-[400px]",
        className
      )}
      {...props}
    />
  )
}

function Toast({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Root> & { variant?: "default" | "destructive" }) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      data-variant={variant}
      className={cn(
        "group/toast pointer-events-auto relative flex w-full items-center gap-3 overflow-hidden rounded-[var(--cie-r)] py-3 pr-10 pl-4 text-sm",
        "bg-primary text-primary-foreground data-[variant=destructive]:bg-destructive data-[variant=destructive]:text-background",
        // rise in, fade + slide right out
        "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-full data-[state=open]:fade-in-0 data-[state=open]:duration-[var(--cie-t-rise,400ms)] data-[state=open]:ease-cie-out",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-right-full data-[state=closed]:duration-[var(--cie-t-fast,180ms)] data-[state=closed]:ease-cie-out",
        // swipe
        "data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x) data-[swipe=move]:transition-none",
        "data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[translate] data-[swipe=cancel]:duration-[var(--cie-t-fast,180ms)] data-[swipe=cancel]:ease-cie-out",
        "data-[swipe=end]:translate-x-(--radix-toast-swipe-end-x) data-[swipe=end]:animate-out data-[swipe=end]:fade-out-0",
        "motion-reduce:data-[state=open]:slide-in-from-bottom-0 motion-reduce:data-[state=closed]:slide-out-to-right-0",
        className
      )}
      {...props}
    />
  )
}

function ToastTitle({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Title>) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("font-[480] tracking-[-0.01em]", className)}
      {...props}
    />
  )
}

function ToastDescription({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Description>) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("text-xs opacity-70", className)}
      {...props}
    />
  )
}

function ToastAction({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Action>) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      className={cn(
        "ml-auto inline-flex h-7 shrink-0 items-center rounded-full border border-current/30 px-3 text-xs font-[480]",
        "transition-[background-color,scale] duration-[var(--cie-t-fast,180ms)] ease-cie-out hover:bg-current/10 active:scale-[var(--cie-press-scale,0.97)]",
        "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className
      )}
      {...props}
    />
  )
}

function ToastClose({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Close>) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Close"
      className={cn(
        "absolute top-1/2 right-2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-full opacity-60",
        "transition-[opacity,background-color] duration-[var(--cie-t-fast,180ms)] ease-cie-out hover:bg-current/10 hover:opacity-100",
        "outline-none focus-visible:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:size-3.5",
        className
      )}
      {...props}
    >
      <XIcon />
    </ToastPrimitive.Close>
  )
}

/* ------------------------------------------------------------------ imperative queue */

type ToastOptions = {
  description?: React.ReactNode
  variant?: "default" | "destructive"
  /** true → check icon; or pass your own node. */
  icon?: boolean | React.ReactNode
  /** ms before auto-dismiss (Radix default 5000). */
  duration?: number
  action?: { label: string; altText?: string; onClick: () => void }
}

type ToastRecord = ToastOptions & { id: number; message: React.ReactNode; open: boolean }

let records: ToastRecord[] = []
let nextId = 1
const listeners = new Set<() => void>()

function emit(next: ToastRecord[]) {
  records = next
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const getSnapshot = () => records
const getServerSnapshot = (): ToastRecord[] => []

function dismiss(id: number) {
  emit(records.map((t) => (t.id === id ? { ...t, open: false } : t)))
  // drop the record once the exit animation has played
  setTimeout(() => emit(records.filter((t) => t.id !== id)), 400)
}

/** Fire a toast. Returns its id; `toast.dismiss(id)` closes it early. */
function toast(message: React.ReactNode, opts: ToastOptions = {}) {
  const id = nextId++
  emit([...records, { ...opts, id, message, open: true }])
  return id
}
toast.dismiss = dismiss

function Toaster({
  className,
  duration,
  ...props
}: Omit<React.ComponentProps<typeof ToastProvider>, "children"> & { className?: string }) {
  const items = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return (
    <ToastProvider duration={duration} {...props}>
      {items.map(({ id, message, description, variant, icon, duration: d, action, open }) => (
        <Toast
          key={id}
          variant={variant}
          duration={d}
          open={open}
          onOpenChange={(o) => {
            if (!o) dismiss(id)
          }}
        >
          {icon ? (
            <span data-slot="toast-icon" className="inline-flex shrink-0 [&_svg]:size-4">
              {icon === true ? <CheckIcon /> : icon}
            </span>
          ) : null}
          <div className="flex min-w-0 flex-col gap-0.5">
            <ToastTitle>{message}</ToastTitle>
            {description ? <ToastDescription>{description}</ToastDescription> : null}
          </div>
          {action ? (
            <ToastAction altText={action.altText ?? action.label} onClick={action.onClick}>
              {action.label}
            </ToastAction>
          ) : null}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport className={className} />
    </ToastProvider>
  )
}

export { Toast, ToastAction, ToastClose, ToastDescription, Toaster, ToastProvider, ToastTitle, ToastViewport, toast }
export type { ToastOptions }
