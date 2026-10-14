"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { cieDuration, cieEase, cieTransition } from "@/lib/cie-motion"

// Showcase · Expand card — the cie signature "block → page" morph, as a shared-layout
// transition (Aceternity Expandable Card lineage). A board cell grows into a full panel
// on --cie-t-move / expo; other cells step back. Esc / backdrop / × close; focus returns.
// Only the block morphs. Text never rides the morph (a 3xl → 7xl title would squash mid-flight): the cell's
// text keeps its shape via layout="position" scale correction, and the panel's text fades in after the block lands.
//
// <ExpandBoard>
//   <ExpandCard id="work" title="Work" summary="…">full content…</ExpandCard>
// </ExpandBoard>

type BoardCtx = {
  open: string | null
  setOpen: (id: string | null) => void
  boardId: string
}
const Ctx = React.createContext<BoardCtx | null>(null)

function ExpandBoard({ className, children, ...props }: React.ComponentProps<"div">) {
  const [open, setOpen] = React.useState<string | null>(null)
  const boardId = React.useId()
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [open])
  return (
    <Ctx.Provider value={{ open, setOpen, boardId }}>
      <div data-slot="expand-board" className={cn("grid gap-2 sm:grid-cols-2 lg:grid-cols-3", className)} {...props}>
        {children}
      </div>
    </Ctx.Provider>
  )
}

type ExpandCardProps = {
  id: string
  title: React.ReactNode
  /** Small mono register shown on the cell. */
  eyebrow?: React.ReactNode
  summary?: React.ReactNode
  /** Panel body (shown only when expanded). */
  children?: React.ReactNode
  className?: string
  panelClassName?: string
}

function ExpandCard({ id, title, eyebrow, summary, children, className, panelClassName }: ExpandCardProps) {
  const ctx = React.useContext(Ctx)
  if (!ctx) throw new Error("<ExpandCard> must be inside <ExpandBoard>")
  const { open, setOpen, boardId } = ctx
  const reduce = useReducedMotion()
  const isOpen = open === id
  const away = open !== null && !isOpen
  const cellRef = React.useRef<HTMLButtonElement>(null)
  const closeRef = React.useRef<HTMLButtonElement>(null)
  const lid = (part: string) => `${boardId}-${id}-${part}`
  const t = reduce ? { duration: 0 } : cieTransition.move

  React.useEffect(() => {
    if (isOpen) closeRef.current?.focus()
  }, [isOpen])

  return (
    <>
      <motion.button
        ref={cellRef}
        type="button"
        layoutId={lid("block")}
        data-slot="expand-card"
        aria-expanded={isOpen}
        onClick={() => setOpen(id)}
        className={cn(
          "group/cell relative flex min-h-44 flex-col justify-between overflow-hidden rounded-[var(--radius)] bg-card p-5 text-left text-card-foreground",
          "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
          className
        )}
        style={{ visibility: isOpen ? "hidden" : "visible" }}
        animate={{ opacity: away ? 0.35 : 1, scale: away ? 0.97 : 1 }}
        whileTap={{ scale: 0.97 }}
        transition={t}
      >
        {eyebrow && (
          <motion.span layout="position" transition={t} className="font-mono text-xs uppercase opacity-60">
            {eyebrow}
          </motion.span>
        )}
        <motion.span
          layout="position"
          transition={t}
          className="text-3xl font-[300] tracking-[-0.03em] transition-[font-weight] duration-[var(--cie-t-cell,320ms)] ease-cie-expo group-hover/cell:font-[560]"
        >
          {title}
        </motion.span>
        {summary && (
          <motion.span layout="position" transition={t} className="text-sm opacity-70">
            {summary}
          </motion.span>
        )}
      </motion.button>

      {/* Portalled so a transformed / filtered ancestor can't trap the fixed overlay. */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence onExitComplete={() => cellRef.current?.focus()}>
            {isOpen && (
              <div className="fixed inset-0 z-50 grid place-items-center p-2 sm:p-6">
                <motion.div
                  className="absolute inset-0 bg-background/70"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: cieDuration.move, ease: cieEase.expo }}
                  onClick={() => setOpen(null)}
                />
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={lid("title")}
                  layoutId={lid("block")}
                  transition={t}
                  className={cn(
                    "relative flex size-full max-h-[90svh] max-w-4xl flex-col overflow-hidden rounded-page bg-card text-card-foreground",
                    panelClassName
                  )}
                >
                  <motion.div
                    layout="position"
                    className="flex items-start justify-between gap-6 p-6 sm:p-10"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      transition: {
                        delay: reduce ? 0 : cieDuration.move * 0.55,
                        duration: cieDuration.cell,
                        ease: cieEase.out,
                      },
                    }}
                    exit={{ opacity: 0, transition: { duration: cieDuration.snap } }}
                  >
                    <div className="flex flex-col gap-3">
                      {eyebrow && <span className="font-mono text-xs uppercase opacity-60">{eyebrow}</span>}
                      <h2
                        id={lid("title")}
                        className="text-5xl leading-[0.95] font-[300] tracking-[-0.045em] sm:text-7xl"
                      >
                        {title}
                      </h2>
                    </div>
                    <button
                      ref={closeRef}
                      type="button"
                      onClick={() => setOpen(null)}
                      className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-card-foreground/10 transition-[rotate,background-color] duration-[var(--cie-t-cell,320ms)] ease-cie-expo outline-none hover:rotate-90 hover:bg-card-foreground/20 focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      <XIcon className="size-4" />
                      <span className="sr-only">Close</span>
                    </button>
                  </motion.div>
                  <motion.div
                    layout="position"
                    className="flex-1 overflow-y-auto px-6 pb-10 sm:px-10"
                    initial={{ opacity: 0, y: 22 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { delay: cieDuration.move * 0.6, duration: cieDuration.rise, ease: cieEase.out },
                    }}
                    exit={{ opacity: 0, transition: { duration: cieDuration.fast } }}
                  >
                    {children}
                  </motion.div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  )
}

export { ExpandBoard, ExpandCard }
