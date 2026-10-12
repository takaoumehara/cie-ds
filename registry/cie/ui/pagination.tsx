"use client"

import * as React from "react"
import { motion, MotionConfig, useReducedMotion } from "motion/react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { cieTransition } from "@/lib/cie-motion"

// UI · Pagination (shadcn / MUI usePagination lineage). Page buttons with ellipses
// (first, last, 1 sibling either side of the current page) between prev/next arrows.
// - The current page is marked by a shared-layout ink pill that glides on cieTransition.spring.
// - nav aria-label="Pagination", aria-current="page" on the current page.
// Reduced motion: MotionConfig "always" → the pill jumps.

const SIBLINGS = 1

function getRange(page: number, total: number): (number | "ellipsis-start" | "ellipsis-end")[] {
  const slots = SIBLINGS * 2 + 5 // first, last, current, 2 ellipses
  if (total <= slots) return Array.from({ length: total }, (_, i) => i + 1)
  const left = Math.max(page - SIBLINGS, 2)
  const right = Math.min(page + SIBLINGS, total - 1)
  const showLeft = left > 3
  const showRight = right < total - 2
  if (!showLeft) {
    const count = 3 + SIBLINGS * 2
    return [...Array.from({ length: count }, (_, i) => i + 1), "ellipsis-end", total]
  }
  if (!showRight) {
    const count = 3 + SIBLINGS * 2
    return [1, "ellipsis-start", ...Array.from({ length: count }, (_, i) => total - count + i + 1)]
  }
  return [1, "ellipsis-start", ...Array.from({ length: right - left + 1 }, (_, i) => left + i), "ellipsis-end", total]
}

type PaginationProps = Omit<React.ComponentProps<"nav">, "onChange"> & {
  page?: number
  defaultPage?: number
  onPageChange?: (page: number) => void
  /** Number of pages. */
  total: number
}

const itemClass = [
  "relative inline-flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-[400] tabular-nums",
  "transition-[color,font-weight,background-color,scale,opacity] duration-[var(--cie-t-cell,320ms)] ease-cie-expo",
  "active:scale-[var(--cie-press-scale,0.97)] active:duration-[var(--cie-t-snap,120ms)] motion-reduce:active:scale-100",
  "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40",
].join(" ")

function Pagination({ page: pageProp, defaultPage = 1, onPageChange, total, className, ...props }: PaginationProps) {
  const [inner, setInner] = React.useState(defaultPage)
  const page = Math.min(Math.max(pageProp ?? inner, 1), Math.max(total, 1))
  const id = React.useId()
  const reduce = useReducedMotion()

  const go = (p: number) => {
    const next = Math.min(Math.max(p, 1), total)
    if (next === page) return
    setInner(next)
    onPageChange?.(next)
  }

  return (
    <MotionConfig reducedMotion={reduce ? "always" : "never"}>
      <nav data-slot="pagination" aria-label="Pagination" className={cn("flex justify-center", className)} {...props}>
        <ul data-slot="pagination-list" className="flex items-center gap-1">
          <li>
            <button
              type="button"
              data-slot="pagination-prev"
              aria-label="Previous page"
              disabled={page <= 1}
              onClick={() => go(page - 1)}
              className={cn(itemClass, "text-foreground hover:bg-accent [&_svg]:size-4")}
            >
              <ChevronLeftIcon />
            </button>
          </li>
          {getRange(page, total).map((item) =>
            typeof item === "number" ? (
              <li key={item}>
                <button
                  type="button"
                  data-slot="pagination-link"
                  aria-label={`Page ${item}`}
                  aria-current={item === page ? "page" : undefined}
                  onClick={() => go(item)}
                  className={cn(
                    itemClass,
                    "text-muted-foreground hover:text-foreground",
                    "aria-[current=page]:font-[520] aria-[current=page]:text-primary-foreground"
                  )}
                >
                  {item === page && (
                    <motion.span
                      data-slot="pagination-pill"
                      layoutId={`${id}-pill`}
                      className="absolute inset-0 rounded-full bg-primary"
                      transition={cieTransition.spring}
                    />
                  )}
                  <span className="relative z-10">{item}</span>
                </button>
              </li>
            ) : (
              <li key={item} aria-hidden>
                <span
                  data-slot="pagination-ellipsis"
                  className="inline-flex size-8 items-center justify-center font-mono text-xs text-muted-foreground"
                >
                  …
                </span>
              </li>
            )
          )}
          <li>
            <button
              type="button"
              data-slot="pagination-next"
              aria-label="Next page"
              disabled={page >= total}
              onClick={() => go(page + 1)}
              className={cn(itemClass, "text-foreground hover:bg-accent [&_svg]:size-4")}
            >
              <ChevronRightIcon />
            </button>
          </li>
        </ul>
      </nav>
    </MotionConfig>
  )
}

export { Pagination }
