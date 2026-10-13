"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

// Layout · AnchorNav (Apple product-page in-page nav lineage, cie "editorial" tokens).
// A sticky row (top-0, bg-background/80 + backdrop blur, hairline below) inside the page column:
// product / page title on the left, section links on the right (15px / 500, no underline), optional `action`
// (e.g. a small pill Button). On narrow screens the links scroll horizontally with no scrollbar, edges faded.
// The current section is tracked with a small inline IntersectionObserver over the `items` ids (the first section
// inside the band from the nav's bottom edge to ~45% of the viewport) and shown in full ink; the rest stay muted.
// The active link carries aria-current="location" and is kept in view inside the scrolling list.
// Clicking scrolls to the section minus the nav height (+ `top`).
// Reduced motion: scrolling is instant (prefers-reduced-motion), the ink change is a plain colour swap.

type AnchorNavItem = { id: string; label: React.ReactNode }

type AnchorNavProps = Omit<React.ComponentProps<"nav">, "title"> & {
  title?: React.ReactNode
  items: AnchorNavItem[]
  /** Trailing slot, e.g. <Button size="sm">Buy</Button>. */
  action?: React.ReactNode
  /** Sticky offset in px (e.g. a global site header above). Also added to the scroll target offset. */
  top?: number
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
}

function AnchorNav({
  title,
  items,
  action,
  top = 0,
  className,
  style,
  "aria-label": ariaLabel,
  ...props
}: AnchorNavProps) {
  const navRef = React.useRef<HTMLElement>(null)
  const listRef = React.useRef<HTMLUListElement>(null)
  const [active, setActive] = React.useState(items[0]?.id ?? "")
  const [height, setHeight] = React.useState(52)
  const ids = items.map((i) => i.id).join("|")

  // Measure own height so the observer band and scroll target sit just under the nav.
  React.useEffect(() => {
    const el = navRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

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
      { rootMargin: `-${Math.round(top + height)}px 0px -55% 0px`, threshold: 0 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [ids, top, height])

  // Keep the active link visible inside the horizontally scrolling list (no page scroll).
  React.useEffect(() => {
    const ul = listRef.current
    const a = ul?.querySelector<HTMLElement>(`[data-anchor="${CSS.escape(active)}"]`)
    if (!ul || !a || ul.scrollWidth <= ul.clientWidth) return
    const left = a.offsetLeft // ul is `relative`, so it is the offsetParent
    const right = left + a.offsetWidth
    if (left < ul.scrollLeft + 16 || right > ul.scrollLeft + ul.clientWidth - 16)
      ul.scrollTo({ left: left - 24, behavior: prefersReducedMotion() ? "auto" : "smooth" })
  }, [active])

  const go = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    const el = document.getElementById(target)
    if (!el) return
    e.preventDefault()
    setActive(target)
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - top - height + 1,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    })
    history.replaceState?.(null, "", `#${target}`)
  }

  return (
    <nav
      ref={navRef}
      data-slot="anchor-nav"
      aria-label={ariaLabel ?? "Sections"}
      style={{ top, ...style }}
      className={cn(
        "sticky z-40 border-b border-hairline bg-background/80 text-foreground backdrop-blur-xl backdrop-saturate-150",
        className
      )}
      {...props}
    >
      <div data-slot="anchor-nav-inner" className="mx-auto flex h-13 w-full max-w-page items-center gap-4 px-gutter">
        {title != null && title !== false && (
          <span
            data-slot="anchor-nav-title"
            className="max-w-[40%] shrink-0 truncate text-[19px] leading-none font-[400] tracking-[-0.015em] sm:text-[21px]"
          >
            {title}
          </span>
        )}
        <ul
          ref={listRef}
          data-slot="anchor-nav-list"
          className={cn(
            "relative ml-auto flex min-w-0 items-center gap-5 overflow-x-auto px-3 py-1 sm:gap-7",
            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            "[mask-image:linear-gradient(to_right,transparent,var(--foreground)_12px,var(--foreground)_calc(100%-12px),transparent)]"
          )}
        >
          {items.map((item) => {
            const current = item.id === active
            return (
              <li key={item.id} data-slot="anchor-nav-item" className="shrink-0">
                <a
                  href={`#${item.id}`}
                  data-anchor={item.id}
                  data-active={current || undefined}
                  aria-current={current ? "location" : undefined}
                  onClick={(e) => go(e, item.id)}
                  className={cn(
                    "block rounded-sm text-[15px] leading-none font-[500] tracking-[-0.005em] whitespace-nowrap",
                    "transition-colors duration-[var(--cie-t-cell,320ms)] ease-cie-expo",
                    "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    current ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </a>
              </li>
            )
          })}
        </ul>
        {action != null && action !== false && (
          <div data-slot="anchor-nav-action" className="shrink-0">
            {action}
          </div>
        )}
      </div>
    </nav>
  )
}

export { AnchorNav }
export type { AnchorNavProps, AnchorNavItem }
