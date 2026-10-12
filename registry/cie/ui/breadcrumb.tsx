"use client"

import * as React from "react"
import { Slot } from "radix-ui"
import { AnimatePresence, motion, useReducedMotion, type HTMLMotionProps } from "motion/react"
import { MoreHorizontalIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { cieTransition } from "@/lib/cie-motion"

// UI Parts · Breadcrumb (shadcn lineage, same composable API).
// Links take the cie "press" nudge (translateX var(--cie-hover-nudge)) on hover; the current page is
// weight 520 with aria-current="page"; separators are a muted mono "/".
// Collapse: give <BreadcrumbList maxItems={n}> and, when there are more items, the middle ones fold
// into a "…" button (separators are then inserted for you). Pressing it expands the hidden items:
// they grow in width + fade on cieTransition.move, siblings glide along (motion layout).
// Reduced motion: items appear instantly, no nudge.

const AnimateCtx = React.createContext(false)

function Breadcrumb(props: React.ComponentProps<"nav">) {
  return <nav aria-label="Breadcrumb" data-slot="breadcrumb" {...props} />
}

type BreadcrumbListProps = React.ComponentProps<"ol"> & {
  /** Collapse middle items into "…" when the item count exceeds this. */
  maxItems?: number
  /** Items kept before the ellipsis (default 1). */
  itemsBeforeCollapse?: number
}

function BreadcrumbList({ className, children, maxItems, itemsBeforeCollapse = 1, ...props }: BreadcrumbListProps) {
  const [expanded, setExpanded] = React.useState(false)
  const ref = React.useRef<HTMLOListElement>(null)
  const focusAfterExpand = React.useRef(false)

  const items = React.Children.toArray(children).filter(
    (c): c is React.ReactElement => React.isValidElement(c) && c.type !== BreadcrumbSeparator
  )
  const collapsible = maxItems != null && items.length > maxItems
  const before = Math.max(1, itemsBeforeCollapse)
  const after = collapsible ? Math.max(1, maxItems - before) : 0

  React.useEffect(() => {
    if (!expanded || !focusAfterExpand.current) return
    focusAfterExpand.current = false
    const links = ref.current?.querySelectorAll<HTMLElement>('[data-slot="breadcrumb-link"]')
    links?.[before]?.focus()
  }, [expanded, before])

  const cls = cn("flex flex-wrap items-center gap-1.5 text-sm break-words text-muted-foreground sm:gap-2.5", className)

  if (maxItems == null) {
    return (
      <ol data-slot="breadcrumb-list" className={cls} {...props}>
        {children}
      </ol>
    )
  }

  const nodes: React.ReactNode[] = []
  items.forEach((item, i) => {
    const hidden = collapsible && !expanded && i >= before && i < items.length - after
    if (hidden) {
      if (i === before) {
        nodes.push(<BreadcrumbSeparator key="sep-ellipsis" />)
        nodes.push(
          <BreadcrumbItem key="ellipsis">
            <BreadcrumbEllipsis
              aria-expanded={false}
              onClick={() => {
                focusAfterExpand.current = true
                setExpanded(true)
              }}
            />
          </BreadcrumbItem>
        )
      }
      return
    }
    const key = item.key ?? i
    if (i > 0) nodes.push(<BreadcrumbSeparator key={`sep-${key}`} />)
    nodes.push(React.cloneElement(item, { key: `item-${key}` }))
  })

  return (
    <ol ref={ref} data-slot="breadcrumb-list" className={cls} {...props}>
      <AnimateCtx.Provider value>
        <AnimatePresence initial={false}>{nodes}</AnimatePresence>
      </AnimateCtx.Provider>
    </ol>
  )
}

function useItemMotion(): HTMLMotionProps<"li"> {
  const animated = React.useContext(AnimateCtx)
  const reduce = useReducedMotion()
  if (!animated) return {}
  const t = reduce ? { duration: 0 } : cieTransition.move
  return {
    layout: reduce ? false : "position",
    initial: { opacity: 0, width: 0 },
    animate: { opacity: 1, width: "auto" },
    exit: { opacity: 0, width: 0 },
    transition: t,
    // clip the growing width but leave room for the focus ring
    style: { overflow: "clip", overflowClipMargin: 4 },
  }
}

function BreadcrumbItem({ className, ...props }: HTMLMotionProps<"li">) {
  const m = useItemMotion()
  return (
    <motion.li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5 whitespace-nowrap", className)}
      {...m}
      {...props}
    />
  )
}

function BreadcrumbLink({ asChild, className, ...props }: React.ComponentProps<"a"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "a"
  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn(
        "inline-block rounded-[4px] font-[400] text-muted-foreground",
        "transition-[color,translate] duration-[var(--cie-t-fast,180ms)] ease-cie-out",
        "hover:translate-x-[var(--cie-hover-nudge,3px)] hover:text-foreground motion-reduce:hover:translate-x-0",
        "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className
      )}
      {...props}
    />
  )
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-[520] text-foreground", className)}
      {...props}
    />
  )
}

function BreadcrumbSeparator({ children, className, ...props }: HTMLMotionProps<"li">) {
  const m = useItemMotion()
  return (
    <motion.li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("inline-flex items-center font-mono text-xs text-muted-foreground/60 select-none", className)}
      {...m}
      {...props}
    >
      {children ?? "/"}
    </motion.li>
  )
}

function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="breadcrumb-ellipsis"
      aria-label="Show all breadcrumbs"
      className={cn(
        "inline-flex h-6 w-8 items-center justify-center rounded-full text-muted-foreground",
        "transition-[background-color,color] duration-[var(--cie-t-cell,320ms)] ease-cie-expo hover:bg-accent hover:text-foreground",
        "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className
      )}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" aria-hidden="true" />
    </button>
  )
}

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
}
