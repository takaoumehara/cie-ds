import * as React from "react"
import { CheckIcon, CopyIcon, MoonIcon, RotateCcwIcon, SunIcon } from "lucide-react"

import registry from "../../registry.json"
import { Button } from "@/components/ui/button"
import { GridPattern } from "@/components/ui/grid-pattern"
import { SplitText } from "@/components/ui/split-text"
import { AnimatedTabs, AnimatedTabsContent, AnimatedTabsList, AnimatedTabsTrigger } from "@/components/ui/animated-tabs"
import { cn } from "@/lib/utils"
import { demos } from "./demos"

const ORIGIN = "https://cie-ds.vercel.app"
const sources = import.meta.glob("../../registry/cie/{ui,lib}/*.{ts,tsx}", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>

type Item = (typeof registry.items)[number] & { meta?: { tech?: string } }
const items = registry.items as Item[]

const CATEGORIES = [
  {
    id: "foundation",
    title: "Foundation",
    blurb: "shadcn/ui primitives, fully re-skinned with cie tokens. Same API — drop-in replacements.",
  },
  {
    id: "atmosphere",
    title: "Atmosphere",
    blurb:
      "Backgrounds that set the air of a page: SVG, Canvas 2D and WebGL tiers. Colours always come from the theme.",
  },
  {
    id: "micro",
    title: "Micro Interactive",
    blurb: "Small, frequent motion: beams, shimmer, tabs, accordion. motion + Tailwind only.",
  },
  {
    id: "showcase",
    title: "Showcase & Hero",
    blurb: "Scroll-driven parallax, reveals, text effects and the cie block → page expand.",
  },
] as const

const addCmd = (name: string) => `npx shadcn@latest add ${ORIGIN}/r/${name}.json`
const nsCmd = (name: string) => `npx shadcn@latest add @cie/${name}`

function useCopy() {
  const [copied, setCopied] = React.useState<string | null>(null)
  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(text)
      setTimeout(() => setCopied((c) => (c === text ? null : c)), 1400)
    })
  }
  return { copied, copy }
}

function Command({ cmd, className }: { cmd: string; className?: string }) {
  const { copied, copy } = useCopy()
  const done = copied === cmd
  return (
    <div
      className={cn(
        "group/cmd flex min-w-0 items-center gap-2 rounded-full border border-border py-1 pr-1 pl-4 font-mono text-xs",
        className
      )}
    >
      <span className="text-muted-foreground select-none">$</span>
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap [scrollbar-width:none]">{cmd}</code>
      <Button size="icon-sm" variant="ghost" aria-label={done ? "Copied" : "Copy command"} onClick={() => copy(cmd)}>
        {done ? <CheckIcon /> : <CopyIcon />}
      </Button>
    </div>
  )
}

function Source({ path }: { path: string }) {
  const [code, setCode] = React.useState<string>("")
  React.useEffect(() => {
    const key = Object.keys(sources).find((k) => k.endsWith(path.replace(/^registry\/cie/, "")))
    if (key) sources[key]().then(setCode)
  }, [path])
  return (
    <pre className="max-h-[28rem] overflow-auto rounded-[var(--radius)] border border-border p-5 font-mono text-[12px] leading-relaxed text-muted-foreground">
      <code>{code || "…"}</code>
    </pre>
  )
}

function ThemeToggle() {
  const [dark, setDark] = React.useState(() => document.documentElement.classList.contains("dark"))
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    try {
      localStorage.setItem("cie-registry-theme", dark ? "dark" : "light")
    } catch {}
  }, [dark])
  return (
    <Button
      size="icon"
      variant="outline"
      aria-label={dark ? "Paper ground" : "Ink ground"}
      onClick={() => setDark((d) => !d)}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}

function ComponentCard({ item }: { item: Item }) {
  const demo = demos[item.name]
  const [run, setRun] = React.useState(0)
  if (!demo) return null
  const layout = demo.layout ?? "plain"
  return (
    <article id={item.name} className="scroll-mt-24 border-t border-border pt-8">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.04em] text-muted-foreground uppercase">
            <span>{item.name}</span>
            {item.meta?.tech && <span className="rounded-full border border-border px-2 py-0.5">{item.meta.tech}</span>}
          </div>
          <h3 className="text-3xl font-[300] tracking-[-0.035em]">{item.title}</h3>
          <p className="max-w-xl text-sm text-muted-foreground">{item.description}</p>
        </div>
      </header>

      <AnimatedTabs defaultValue="preview">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <AnimatedTabsList>
            <AnimatedTabsTrigger value="preview">Preview</AnimatedTabsTrigger>
            <AnimatedTabsTrigger value="code">Code</AnimatedTabsTrigger>
          </AnimatedTabsList>
          {demo.replay && (
            <Button size="sm" variant="ghost" onClick={() => setRun((n) => n + 1)}>
              <RotateCcwIcon /> Replay
            </Button>
          )}
        </div>
        <AnimatedTabsContent value="preview">
          <div
            className={cn(
              "relative overflow-hidden rounded-page border border-border",
              layout === "stage" && "h-80 sm:h-96",
              layout === "plain" && "flex min-h-64 items-center justify-center p-6 sm:p-10",
              layout === "flush" && "border-0"
            )}
          >
            <React.Fragment key={run}>{demo.render()}</React.Fragment>
          </div>
          {demo.note && <p className="mt-3 font-mono text-[11px] text-muted-foreground uppercase">{demo.note}</p>}
        </AnimatedTabsContent>
        <AnimatedTabsContent value="code">
          {item.files?.map((f) => (
            <Source key={f.path} path={f.path} />
          ))}
        </AnimatedTabsContent>
      </AnimatedTabs>

      <div className="mt-4 flex flex-col gap-2">
        <Command cmd={addCmd(item.name)} />
      </div>
    </article>
  )
}

const REGISTRIES_JSON = `{
  "registries": {
    "@cie": "${ORIGIN}/r/{name}.json"
  }
}`

const RENDERERS = [
  [
    "CSS / SVG",
    "grid-pattern · noise · spotlight · border-beam",
    "Static or slow ambient texture, many instances per page, crisp at any DPR. Cheapest; default choice.",
  ],
  [
    "Canvas 2D",
    "particles",
    "Hundreds–low-thousands of independent marks, per-frame logic in JS (cursor fields, physics).",
  ],
  [
    "WebGL",
    "shader-field",
    "Per-pixel fields (noise, flow, dither, distortion), full-bleed heroes. One per viewport; DPR-capped; pauses off-screen.",
  ],
] as const

export function App() {
  const byCat = (c: string) => items.filter((i) => i.categories?.includes(c) && demos[i.name])
  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-[var(--cie-edge,clamp(16px,2.2vw,28px))]">
          <a href="/" className="flex items-baseline gap-2">
            <span className="text-xl font-[400] tracking-[-0.03em]">cie-ds</span>
            <span className="font-mono text-xs text-muted-foreground uppercase">/ registry</span>
          </a>
          <nav className="hidden items-center gap-1 md:flex">
            {CATEGORIES.map((c) => (
              <Button key={c.id} asChild size="sm" variant="ghost">
                <a href={`#${c.id}`}>{c.title}</a>
              </Button>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-[var(--cie-edge,clamp(16px,2.2vw,28px))]">
        <section className="relative isolate overflow-hidden py-20 sm:py-28">
          <GridPattern cells={5} size={48} className="-z-10" />
          <p className="mb-6 font-mono text-xs tracking-[0.04em] text-muted-foreground uppercase">
            shadcn registry · {items.length} items · tokens from tokens.json
          </p>
          <SplitText
            as="h1"
            effect="mask"
            className="block text-6xl leading-[0.9] font-[300] tracking-[-0.045em] sm:text-8xl"
          >
            Snappy, two-ink, everywhere.
          </SplitText>
          <p className="mt-8 max-w-xl text-lg text-muted-foreground">
            cie-ds as installable source. Every component reads the cie theme variables — no stray hex, no competing
            animation libraries: <span className="text-foreground">motion</span> + Tailwind.
          </p>
          <div className="mt-10 flex max-w-2xl flex-col gap-2">
            <Command cmd={addCmd("cie-all")} />
          </div>
        </section>

        <section
          id="setup"
          className="grid grid-cols-1 gap-8 border-t border-border py-14 md:grid-cols-[1fr_1.4fr] [&>*]:min-w-0"
        >
          <div>
            <h2 className="text-4xl font-[300] tracking-[-0.04em]">Setup</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Any project with shadcn initialised (Tailwind v4). Install the theme once; components pull it in
              automatically too. Add <code className="font-mono">class="dark"</code> on{" "}
              <code className="font-mono">&lt;html&gt;</code> for the CIE ink ground; without it you get the paper
              ground.
            </p>
          </div>
          <ol className="flex flex-col gap-5 text-sm">
            <li className="flex flex-col gap-2">
              <span className="font-mono text-xs text-muted-foreground uppercase">01 · Theme + fonts</span>
              <Command cmd={addCmd("cie-theme")} />
              <span className="text-muted-foreground">
                Load Outfit 100–900 and DM Mono 400 (Google Fonts or next/font). Stacks are already in --font-sans /
                --font-mono.
              </span>
            </li>
            <li className="flex flex-col gap-2">
              <span className="font-mono text-xs text-muted-foreground uppercase">02 · Optional namespace</span>
              <span className="text-muted-foreground">
                Add to <code className="font-mono">components.json</code>, then use{" "}
                <code className="font-mono">@cie/&lt;name&gt;</code>:
              </span>
              <pre className="overflow-x-auto rounded-[var(--radius)] border border-border p-4 font-mono text-xs">
                {REGISTRIES_JSON}
              </pre>
              <Command cmd={nsCmd("shader-field")} />
            </li>
          </ol>
        </section>

        {CATEGORIES.map((c) => (
          <section key={c.id} id={c.id} className="scroll-mt-16 border-t border-border py-14">
            <div className="mb-10 flex flex-col gap-3">
              <span className="font-mono text-xs text-muted-foreground uppercase">{c.id}</span>
              <h2 className="text-5xl font-[300] tracking-[-0.045em] sm:text-6xl">{c.title}</h2>
              <p className="max-w-xl text-muted-foreground">{c.blurb}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {byCat(c.id).map((i) => (
                  <Button key={i.name} asChild size="sm" variant="outline">
                    <a href={`#${i.name}`}>{i.title}</a>
                  </Button>
                ))}
              </div>
            </div>
            {c.id === "atmosphere" && (
              <div className="mb-12 overflow-x-auto">
                <table className="w-full min-w-[36rem] text-left text-sm">
                  <thead className="font-mono text-xs text-muted-foreground uppercase">
                    <tr>
                      <th className="py-2 pr-4 font-normal">Renderer</th>
                      <th className="py-2 pr-4 font-normal">Here</th>
                      <th className="py-2 font-normal">Reach for it when</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RENDERERS.map(([r, here, when]) => (
                      <tr key={r} className="border-t border-border align-top">
                        <td className="py-3 pr-4">{r}</td>
                        <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{here}</td>
                        <td className="py-3 text-muted-foreground">{when}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex flex-col gap-14">
              {byCat(c.id).map((i) => (
                <ComponentCard key={i.name} item={i} />
              ))}
            </div>
          </section>
        ))}

        <section className="border-t border-border py-14">
          <h2 className="text-4xl font-[300] tracking-[-0.04em]">Libraries</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3 [&>*]:min-w-0">
            {items
              .filter((i) => i.type === "registry:lib" || i.type === "registry:theme")
              .map((i) => (
                <div key={i.name} className="flex flex-col gap-3">
                  <span className="font-mono text-xs text-muted-foreground uppercase">
                    {i.type.replace("registry:", "")}
                  </span>
                  <h3 className="text-2xl font-[300] tracking-[-0.03em]">{i.title}</h3>
                  <p className="text-sm text-muted-foreground">{i.description}</p>
                  <Command cmd={addCmd(i.name)} />
                </div>
              ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 px-[var(--cie-edge,clamp(16px,2.2vw,28px))] py-8 font-mono text-xs text-muted-foreground uppercase">
          <span>cie-ds · Creativity Is Everywhere</span>
          <span className="flex gap-4">
            <a href="/" className="hover:text-foreground">
              Catalog
            </a>
            <a href="/DESIGN.md" className="hover:text-foreground">
              Design brief
            </a>
            <a href={`${ORIGIN}/r/registry.json`} className="hover:text-foreground">
              registry.json
            </a>
          </span>
        </div>
      </footer>
    </div>
  )
}
