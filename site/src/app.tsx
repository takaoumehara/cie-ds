import * as React from "react"
import { ChevronRightIcon, MenuIcon, SearchIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { FLAT, TREE, href, isBranch, parse, sameRoute, type Branch, type Leaf, type Route } from "./nav"
import { LangToggle, T, ThemeToggle } from "./ui"
import { Page } from "./pages/index"

function useRoute(): Route {
  const [route, setRoute] = React.useState<Route>(() => parse(location.hash) ?? { page: "overview" })
  React.useEffect(() => {
    const on = () => {
      const r = parse(location.hash)
      // Plain #anchors (demos' own in-page links) are not routes — keep the current page.
      if (r) setRoute(r)
    }
    window.addEventListener("hashchange", on)
    return () => window.removeEventListener("hashchange", on)
  }, [])
  return route
}

const routeInBranch = (b: Branch, r: Route) =>
  (b.route && sameRoute(b.route, r)) || b.children.some((c) => sameRoute(c.route, r))

function NavLink({ leaf, active, onNavigate, depth }: { leaf: Leaf; active: boolean; onNavigate?: () => void; depth: number }) {
  return (
    <a
      href={href(leaf.route)}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-8 items-center justify-between gap-2 rounded-full py-1 pr-3 text-[14px] text-muted-foreground",
        "transition-[background-color,color] duration-[var(--cie-t-fast)] ease-cie-out hover:bg-accent hover:text-foreground",
        "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        active && "bg-accent font-[500] text-foreground",
        depth === 0 ? "pl-3" : "pl-7"
      )}
    >
      <span className="truncate">{leaf.ja ? <T ja={leaf.ja} en={leaf.label} /> : leaf.label}</span>
      {leaf.badge && <span className="shrink-0 font-mono text-[10px] uppercase opacity-70">{leaf.badge}</span>}
    </a>
  )
}

function BranchNode({ branch, route, onNavigate }: { branch: Branch; route: Route; onNavigate?: () => void }) {
  const contains = routeInBranch(branch, route)
  const [open, setOpen] = React.useState(contains)
  React.useEffect(() => {
    if (contains) setOpen(true)
  }, [contains])
  const id = `nav-${branch.id}`
  const active = branch.route && sameRoute(branch.route, route)
  return (
    <li>
      <div className="flex items-center">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          aria-label={`${open ? "Collapse" : "Expand"} ${branch.label}`}
          onClick={() => setOpen((o) => !o)}
          className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <ChevronRightIcon
            className={cn("size-4 transition-transform duration-[var(--cie-t-cell)] ease-cie-expo", open && "rotate-90")}
          />
        </button>
        {branch.route ? (
          <a
            href={href(branch.route)}
            onClick={() => {
              setOpen(true)
              onNavigate?.()
            }}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-8 flex-1 items-center rounded-full px-2 text-[14px] outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50",
              active && "bg-accent font-[500]"
            )}
          >
            {branch.ja ? <T ja={branch.ja} en={branch.label} /> : branch.label}
            <span className="ml-auto pr-2 font-mono text-[10px] text-muted-foreground">{branch.children.length}</span>
          </a>
        ) : (
          <button type="button" onClick={() => setOpen((o) => !o)} className="flex min-h-8 flex-1 items-center px-2 text-left text-[14px]">
            {branch.ja ? <T ja={branch.ja} en={branch.label} /> : branch.label}
            <span className="ml-auto pr-2 font-mono text-[10px] text-muted-foreground">{branch.children.length}</span>
          </button>
        )}
      </div>
      <div
        id={id}
        className={cn(
          "grid transition-[grid-template-rows] duration-[var(--cie-t-cell)] ease-cie-expo motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
        inert={!open}
      >
        <ul className="overflow-hidden">
          {branch.children.map((leaf) => (
            <li key={href(leaf.route)}>
              <NavLink leaf={leaf} depth={1} active={sameRoute(leaf.route, route)} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      </div>
    </li>
  )
}

function Sidebar({ route, onNavigate, autoFocus }: { route: Route; onNavigate?: () => void; autoFocus?: boolean }) {
  const [q, setQ] = React.useState("")
  const input = React.useRef<HTMLInputElement>(null)
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({})
  React.useEffect(() => {
    if (autoFocus) input.current?.focus()
  }, [autoFocus])
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(t.tagName) && !t.isContentEditable && input.current?.offsetParent) {
        e.preventDefault()
        input.current.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const query = q.trim().toLowerCase()
  const results = query
    ? FLAT.filter(({ leaf, trail }) =>
        [leaf.label, leaf.ja ?? "", leaf.keywords, ...trail].join(" ").toLowerCase().includes(query)
      )
    : []

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-14 shrink-0 items-center gap-2 px-4">
        <a href="#/" onClick={onNavigate} className="flex items-baseline gap-2 rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
          <span className="text-xl font-[400] tracking-[-0.03em]">cie-ds</span>
          <span className="font-mono text-xs text-muted-foreground uppercase">/ docs</span>
        </a>
      </div>
      <div className="shrink-0 px-3 pb-3">
        <label className="flex h-9 items-center gap-2 rounded-full border border-input px-3 text-sm focus-within:ring-[3px] focus-within:ring-ring/50">
          <SearchIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="sr-only">Search the docs</span>
          <input
            ref={input}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setQ("")
              if (e.key === "Enter" && results[0]) {
                location.hash = href(results[0].leaf.route)
                setQ("")
                onNavigate?.()
              }
            }}
            placeholder="Search  /"
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
          />
          {q && (
            <button type="button" aria-label="Clear search" onClick={() => setQ("")} className="text-muted-foreground hover:text-foreground">
              <XIcon className="size-4" />
            </button>
          )}
        </label>
      </div>
      <nav aria-label="Docs" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-10 [scrollbar-width:thin]">
        {query ? (
          <div aria-live="polite">
            <p className="px-3 pb-2 font-mono text-[11px] text-muted-foreground uppercase">
              {results.length} result{results.length === 1 ? "" : "s"}
            </p>
            <ul>
              {results.map(({ leaf, trail }) => (
                <li key={href(leaf.route)}>
                  <a
                    href={href(leaf.route)}
                    onClick={() => {
                      setQ("")
                      onNavigate?.()
                    }}
                    className="flex flex-col rounded-[calc(var(--radius)*0.6)] px-3 py-1.5 outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <span className="text-[14px]">{leaf.ja ? <T ja={leaf.ja} en={leaf.label} /> : leaf.label}</span>
                    <span className="font-mono text-[10px] text-muted-foreground uppercase">{trail.join(" / ")}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          TREE.map((g) => {
            const shut = collapsed[g.id]
            return (
              <div key={g.id} className="pt-3">
                <button
                  type="button"
                  aria-expanded={!shut}
                  aria-controls={`grp-${g.id}`}
                  onClick={() => setCollapsed((c) => ({ ...c, [g.id]: !c[g.id] }))}
                  className="flex w-full items-center justify-between rounded-full px-3 py-1 font-mono text-[11px] tracking-[0.04em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <T ja={g.ja} en={g.label} />
                  <ChevronRightIcon
                    className={cn("size-3.5 transition-transform duration-[var(--cie-t-cell)] ease-cie-expo", !shut && "rotate-90")}
                  />
                </button>
                <div
                  id={`grp-${g.id}`}
                  className={cn(
                    "grid transition-[grid-template-rows] duration-[var(--cie-t-cell)] ease-cie-expo motion-reduce:transition-none",
                    shut ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
                  )}
                  inert={shut}
                >
                  <ul className="overflow-hidden pt-1">
                    {g.children.map((n) =>
                      isBranch(n) ? (
                        <BranchNode key={n.id} branch={n} route={route} onNavigate={onNavigate} />
                      ) : (
                        <li key={href(n.route)}>
                          <NavLink leaf={n} depth={0} active={sameRoute(n.route, route)} onNavigate={onNavigate} />
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            )
          })
        )}
      </nav>
    </div>
  )
}

/** < 768px: the sidebar becomes a drawer behind a menu button. */
function Drawer({ open, onClose, route }: { open: boolean; onClose: () => void; route: Route }) {
  const panel = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    panel.current?.querySelector<HTMLElement>("button")?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input")
        const vis = [...f].filter((el) => el.offsetParent !== null)
        const first = vis[0]
        const last = vis[vis.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
    const mq = window.matchMedia("(min-width: 768px)")
    const onMq = () => mq.matches && onClose()
    document.addEventListener("keydown", onKey)
    mq.addEventListener("change", onMq)
    const overflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      mq.removeEventListener("change", onMq)
      document.documentElement.style.overflow = overflow
      prev?.focus?.()
    }
  }, [open, onClose])

  return (
    <div className={cn("fixed inset-0 z-50 md:hidden", !open && "pointer-events-none")} inert={!open} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-background/70 backdrop-blur-sm transition-opacity duration-[var(--cie-t-sheet)] ease-cie-expo motion-reduce:transition-none",
          open ? "opacity-100" : "opacity-0"
        )}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        id="docs-drawer"
        className={cn(
          "absolute inset-y-0 left-0 flex w-[min(20rem,86vw)] flex-col border-r border-border bg-background",
          "transition-transform duration-[var(--cie-t-sheet)] ease-cie-expo motion-reduce:transition-none",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Button size="icon-sm" variant="ghost" aria-label="Close navigation" onClick={onClose} className="absolute top-3 right-3 z-10">
          <XIcon />
        </Button>
        <Sidebar route={route} onNavigate={onClose} />
      </div>
    </div>
  )
}

function Crumbs({ route }: { route: Route }) {
  const hit = FLAT.find((f) => sameRoute(f.leaf.route, route))
  if (!hit) return <span className="truncate text-sm">cie-ds</span>
  return (
    <span className="flex min-w-0 items-center gap-1.5 truncate font-mono text-xs text-muted-foreground uppercase">
      {hit.trail.map((t) => (
        <React.Fragment key={t}>
          <span className="hidden truncate sm:inline">{t}</span>
          <ChevronRightIcon className="hidden size-3 shrink-0 sm:inline" />
        </React.Fragment>
      ))}
      <span className="truncate text-foreground normal-case">{hit.leaf.label}</span>
    </span>
  )
}

export function App() {
  const route = useRoute()
  const [drawer, setDrawer] = React.useState(false)
  const close = React.useCallback(() => setDrawer(false), [])
  const main = React.useRef<HTMLElement>(null)
  const key = href(route)

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })
    const hit = FLAT.find((f) => sameRoute(f.leaf.route, route))
    document.title = hit ? `${hit.leaf.label} — cie-ds docs` : "cie-ds — Design System Docs"
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-svh md:grid md:grid-cols-[16.5rem_minmax(0,1fr)]">
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault()
          main.current?.focus()
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <aside className="sticky top-0 hidden h-svh border-r border-border md:block">
        <Sidebar route={route} />
      </aside>
      <Drawer open={drawer} onClose={close} route={route} />

      <div className="min-w-0">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-[var(--cie-edge,clamp(16px,2.2vw,28px))] backdrop-blur-md">
          <Button
            size="icon-sm"
            variant="outline"
            className="md:hidden"
            aria-label="Open navigation"
            aria-expanded={drawer}
            aria-controls="docs-drawer"
            onClick={() => setDrawer(true)}
          >
            <MenuIcon />
          </Button>
          <a href="#/" className="text-lg font-[400] tracking-[-0.03em] md:hidden">
            cie-ds
          </a>
          <div className="hidden min-w-0 flex-1 md:block">
            <Crumbs route={route} />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild size="sm" variant="ghost" className="hidden lg:inline-flex">
              <a href="/registry/">Registry</a>
            </Button>
            <Button asChild size="sm" variant="ghost" className="hidden lg:inline-flex">
              <a href="/demo">CSS demo</a>
            </Button>
            <LangToggle />
            <ThemeToggle />
          </div>
        </header>

        <main id="main" ref={main} tabIndex={-1} className="mx-auto w-full max-w-5xl px-[var(--cie-edge,clamp(16px,2.2vw,28px))] pt-10 pb-24 outline-none">
          <Page key={key} route={route} />
        </main>

        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-5xl flex-wrap justify-between gap-4 px-[var(--cie-edge,clamp(16px,2.2vw,28px))] py-8 font-mono text-xs text-muted-foreground uppercase">
            <span>cie-ds v0.5.1 · Creativity Is Everywhere</span>
            <span className="flex flex-wrap gap-4">
              <a href="/classic.html" className="hover:text-foreground">
                Classic catalog
              </a>
              <a href="/registry/" className="hover:text-foreground">
                Registry
              </a>
              <a href="/DESIGN.md" className="hover:text-foreground">
                Design brief
              </a>
              <a href="/LICENSE" className="hover:text-foreground">
                Proprietary License
              </a>
            </span>
          </div>
        </footer>
      </div>
    </div>
  )
}
