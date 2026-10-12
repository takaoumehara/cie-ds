"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { AnimatePresence, motion, useDragControls, useReducedMotion, type PanInfo } from "motion/react"

import { cn } from "@/lib/utils"
import { cieTransition } from "@/lib/cie-motion"

// cie: lineage — Radix Dialog + motion, in the vein of vaul / iOS sheets. A floating page-radius panel inset
// 8px from the bottom edge with a grabber bar.
// Behaviour: rises y 100% → 0 on cieTransition.sheet. Drag the grabber down (drag="y", top locked at 0,
// bottom elastic 0.6): release past 30% of the sheet height or faster than 500px/s closes it, otherwise it
// springs back on cieTransition.spring. Open state lives in the Root (context) so AnimatePresence + forceMount
// can play the exit.
// Reduced motion: no slide and no drag — opacity only (the close button / Esc / overlay still dismiss).

type BottomSheetContextValue = { open: boolean; setOpen: (open: boolean) => void }

const BottomSheetContext = React.createContext<BottomSheetContextValue | null>(null)

function useBottomSheet() {
  const ctx = React.useContext(BottomSheetContext)
  if (!ctx) throw new Error("BottomSheet parts must be used inside <BottomSheet>")
  return ctx
}

function BottomSheet({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen)
  const open = openProp ?? uncontrolled
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setUncontrolled(next)
      onOpenChange?.(next)
    },
    [openProp, onOpenChange]
  )
  const ctx = React.useMemo(() => ({ open, setOpen }), [open, setOpen])
  return (
    <BottomSheetContext.Provider value={ctx}>
      <DialogPrimitive.Root data-slot="bottom-sheet" open={open} onOpenChange={setOpen} {...props} />
    </BottomSheetContext.Provider>
  )
}

function BottomSheetTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="bottom-sheet-trigger" {...props} />
}

function BottomSheetClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="bottom-sheet-close" {...props} />
}

const CLOSE_DISTANCE = 0.3 // fraction of sheet height
const CLOSE_VELOCITY = 500 // px/s

function BottomSheetContent({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof DialogPrimitive.Content>, "asChild" | "forceMount">) {
  const { open, setOpen } = useBottomSheet()
  const reduce = useReducedMotion()
  const dragControls = useDragControls()
  const sheetRef = React.useRef<HTMLDivElement>(null)

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const height = sheetRef.current?.offsetHeight ?? 0
    if (info.offset.y > height * CLOSE_DISTANCE || info.velocity.y > CLOSE_VELOCITY) setOpen(false)
    // otherwise the drag constraints pull it back with the cie spring (dragTransition below)
  }

  const fade = { duration: cieTransition.fast.duration, ease: cieTransition.fast.ease }

  return (
    <AnimatePresence>
      {open && (
        <DialogPrimitive.Portal forceMount>
          <DialogPrimitive.Overlay forceMount asChild>
            <motion.div
              data-slot="bottom-sheet-overlay"
              className="fixed inset-0 z-50 bg-background/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduce ? fade : cieTransition.sheet}
            />
          </DialogPrimitive.Overlay>
          <DialogPrimitive.Content forceMount asChild {...props}>
            <motion.div
              ref={sheetRef}
              data-slot="bottom-sheet-content"
              className={cn(
                "fixed inset-x-2 bottom-2 z-50 mx-auto flex max-h-[85vh] max-w-xl flex-col rounded-page border border-border bg-background text-foreground outline-none",
                className
              )}
              initial={reduce ? { opacity: 0 } : { y: "100%" }}
              animate={reduce ? { opacity: 1 } : { y: 0 }}
              exit={reduce ? { opacity: 0 } : { y: "100%" }}
              transition={reduce ? fade : cieTransition.sheet}
              drag={reduce ? false : "y"}
              dragListener={false}
              dragControls={dragControls}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              dragTransition={{
                bounceStiffness: cieTransition.spring.stiffness,
                bounceDamping: cieTransition.spring.damping,
              }}
              onDragEnd={onDragEnd}
            >
              <div
                data-slot="bottom-sheet-handle"
                aria-hidden
                onPointerDown={(e) => {
                  if (!reduce) dragControls.start(e)
                }}
                className={cn(
                  "flex h-7 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing",
                  reduce && "cursor-default"
                )}
              >
                <span
                  data-slot="bottom-sheet-grabber"
                  className="h-1 w-10 rounded-full bg-foreground/20 transition-[width,background-color] duration-[var(--cie-t-fast,180ms)] ease-cie-out"
                />
              </div>
              <div data-slot="bottom-sheet-body" className="flex min-h-0 flex-col gap-4 overflow-y-auto px-6 pb-6">
                {children}
              </div>
            </motion.div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      )}
    </AnimatePresence>
  )
}

function BottomSheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="bottom-sheet-header" className={cn("flex flex-col gap-2", className)} {...props} />
}

function BottomSheetTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="bottom-sheet-title"
      className={cn("text-2xl leading-tight font-[300] tracking-[-0.03em]", className)}
      {...props}
    />
  )
}

function BottomSheetDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="bottom-sheet-description"
      className={cn("text-sm leading-relaxed text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  BottomSheet,
  BottomSheetClose,
  BottomSheetContent,
  BottomSheetDescription,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetTrigger,
}
