"use client"

import * as React from "react"
import { motion, MotionConfig, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { cieTransition } from "@/lib/cie-motion"

// Scroll · Scrollspy (table-of-contents lineage — Bootstrap scrollspy / docs TOCs).
// An IntersectionObserver watches each section id; the first section inside the active band
// (from `offset` px below the top to ~45% of the viewport) is marked current. The ink marker bar
// glides between entries as a shared-layout element (layoutId, cieTransition.spring).
// Clicking an entry scrolls smoothly to its section (minus `offset`); pass `root` for an inner scroll box.
// The current link carries aria-current="location".
// Reduced motion: the marker jumps (no layout animation) and clicks scroll instantly.

type ScrollspyItem = { id: string; label: React.ReactNode }

type ScrollspyProps = Omit<React.ComponentProps<"nav">, "children"> & {
  items: ScrollspyItem[]
  /** px reserved at the top (sticky header height) — used for the active band and scroll target. */
  offset?: number
  /** Inner scroll container holding the sections. Defaults to the window. */
  root?: React.RefObject<HTMLElement | null>
}

function Scrollspy({ items, offset = 0, root, className, "aria-label": ariaLabel, ...props }: ScrollspyProps) {
  const reduce = useReducedMotion()
  const id = React.useId()
  const [active, setActive] = React.useState(items[0]?.id ?? "")
  const ids = items.map((i) => i.id).join("|")

  React.useEffect(() => {
    const list = ids.split("|").filter(Boolean)
    const els = list.map((x) => document.getElementById(x)).filter((el): el is HTMLElement => !!el)
    if (!els.length) return
    const visible = new Map<string, boolean>()
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => visible.set(e.target.id, e.isIntersecting))
        const first = list.find((x) => visible.get(x))
        if (first) setActive(first)
      },
      { root: root?.current ?? null, rootMargin: `-${offset}px 0px -55% 0px`, threshold: 0 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [ids, offset, root])

  const go = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    const el = document.getElementById(target)
    if (!el) return
    e.preventDefault()
    setActive(target)
    const behavior: ScrollBehavior = reduce ? "auto" : "smooth"
    const box = root?.current
    if (box) {
      const top = el.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - offset
      box.scrollTo({ top, behavior })
    } else {
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior })
    }
  }

  return (
    <MotionConfig reducedMotion={reduce ? "always" : "never"}>
      <nav
        data-slot="scrollspy"
        aria-label={ariaLabel ?? "On this page"}
        className={cn("text-sm", className)}
        {...props}
      >
        <ul data-slot="scrollspy-list" className="relative flex flex-col border-l border-border">
          {items.map((item) => {
            const current = item.id === active
            return (
              <li key={item.id} data-slot="scrollspy-item" className="relative">
                {current && (
                  <motion.span
                    layoutId={`${id}-marker`}
                    data-slot="scrollspy-marker"
                    aria-hidden
                    className="absolute inset-y-1 -left-px w-0.5 rounded-full bg-foreground"
                    transition={cieTransition.spring}
                  />
                )}
                <a
                  href={`#${item.id}`}
                  data-slot="scrollspy-link"
                  data-active={current || undefined}
                  aria-current={current ? "location" : undefined}
                  onClick={(e) => go(e, item.id)}
                  className={cn(
                    "block rounded-[var(--cie-r)] py-1.5 pr-2 pl-4 font-[400] text-muted-foreground",
                    "transition-[color,font-weight] duration-[var(--cie-t-cell,320ms)] ease-cie-expo hover:text-foreground",
                    "data-[active]:font-[520] data-[active]:text-foreground",
                    "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  )}
                >
                  {item.label}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </MotionConfig>
  )
}

export { Scrollspy, type ScrollspyItem }
