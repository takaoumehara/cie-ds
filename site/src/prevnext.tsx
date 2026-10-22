import { cn } from "@/lib/utils"
import { FLAT, href, sameRoute, type Route } from "./nav"
import { T } from "./ui"

/** Previous / next in sidebar order. */
export function PrevNext({ route }: { route: Route }) {
  const i = FLAT.findIndex((f) => sameRoute(f.leaf.route, route))
  if (i < 0) return null
  const prev = FLAT[i - 1]
  const next = FLAT[i + 1]
  const card = (f: (typeof FLAT)[number], dir: "prev" | "next") => (
    <a
      href={href(f.leaf.route)}
      className={cn(
        "flex flex-1 flex-col gap-1 rounded-[var(--radius)] border border-border p-4 transition-[border-color,background-color] duration-[var(--cie-t-cell)] ease-cie-expo hover:border-foreground/40 hover:bg-accent",
        dir === "next" && "items-end text-right"
      )}
    >
      <span className="font-mono text-[11px] text-muted-foreground uppercase">{dir === "prev" ? "← Previous" : "Next →"}</span>
      <span className="text-lg font-[300] tracking-[-0.02em]">{f.leaf.ja ? <T ja={f.leaf.ja} en={f.leaf.label} /> : f.leaf.label}</span>
    </a>
  )
  return (
    <nav aria-label="Pagination" className="mt-16 flex flex-col gap-3 sm:flex-row">
      {prev ? card(prev, "prev") : <span className="flex-1" />}
      {next ? card(next, "next") : <span className="flex-1" />}
    </nav>
  )
}
