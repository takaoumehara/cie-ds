import * as React from "react"
import { CheckIcon, CopyIcon, MoonIcon, SunIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Bilingual text — both render; CSS hides the inactive language (see index.css). */
export function T({ ja, en }: { ja: React.ReactNode; en: React.ReactNode }) {
  return (
    <>
      <span lang="ja">{ja}</span>
      <span lang="en">{en}</span>
    </>
  )
}

export function useCopy() {
  const [copied, setCopied] = React.useState<string | null>(null)
  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(text)
      setTimeout(() => setCopied((c) => (c === text ? null : c)), 1400)
    })
  }
  return { copied, copy }
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const { copied, copy } = useCopy()
  const done = copied === text
  return (
    <Button size="icon-sm" variant="ghost" aria-label={done ? "Copied" : label} onClick={() => copy(text)}>
      {done ? <CheckIcon /> : <CopyIcon />}
    </Button>
  )
}

export function Command({ cmd, className }: { cmd: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2 rounded-full border border-border py-1.5 pr-1.5 pl-5 font-mono text-[13px]",
        className
      )}
    >
      <span className="text-muted-foreground select-none">$</span>
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap [scrollbar-width:none]">{cmd}</code>
      <CopyButton text={cmd} label="Copy command" />
    </div>
  )
}

export function CodeBlock({ code, title, className }: { code: string; title?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0 overflow-hidden rounded-[var(--radius)] border border-border", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border py-1 pr-1 pl-4">
        <span className="truncate font-mono text-xs text-muted-foreground">{title ?? "code"}</span>
        <CopyButton text={code} label="Copy code" />
      </div>
      <pre className="max-h-[32rem] overflow-auto p-4 font-mono text-[13px] leading-relaxed text-muted-foreground">
        <code>{code || "…"}</code>
      </pre>
    </div>
  )
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("font-mono text-xs tracking-[0.04em] text-muted-foreground uppercase", className)}>
      {children}
    </span>
  )
}

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: React.ReactNode
  title: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <header className="flex flex-col gap-3 pb-8">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="text-5xl leading-[0.95] font-[300] tracking-[-0.045em] sm:text-6xl">{title}</h1>
      {children && <div className="max-w-2xl text-lg text-muted-foreground">{children}</div>}
    </header>
  )
}

export function Section({
  id,
  title,
  children,
  aside,
}: {
  id?: string
  title: React.ReactNode
  children: React.ReactNode
  aside?: React.ReactNode
}) {
  return (
    <section id={id} className="flex scroll-mt-20 flex-col gap-5 border-t border-border py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-3xl font-[300] tracking-[-0.035em]">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

/** Simple, horizontally scrollable table. `rows` are arrays of cells. */
export function Table({ head, rows, minWidth = "36rem" }: { head: string[]; rows: React.ReactNode[][]; minWidth?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[15px]" style={{ minWidth }}>
        <thead className="font-mono text-xs text-muted-foreground uppercase">
          <tr>
            {head.map((h) => (
              <th key={h} className="py-2 pr-4 font-normal">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-border align-top">
              {r.map((c, j) => (
                <td key={j} className="py-3 pr-4 [&_code]:font-mono [&_code]:text-[13px]">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function LangToggle() {
  const [lang, setLang] = React.useState(() => document.documentElement.getAttribute("data-ui") ?? "ja")
  React.useEffect(() => {
    document.documentElement.setAttribute("data-ui", lang)
    try {
      localStorage.setItem("cie-ui-lang", lang)
    } catch {}
  }, [lang])
  return (
    <Button size="sm" variant="outline" className="font-mono" onClick={() => setLang((l) => (l === "ja" ? "en" : "ja"))}>
      {lang === "ja" ? "EN" : "日本語"}
    </Button>
  )
}

export function ThemeToggle() {
  const [dark, setDark] = React.useState(() => document.documentElement.classList.contains("dark"))
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    try {
      localStorage.setItem("cie-registry-theme", dark ? "dark" : "light")
    } catch {}
  }, [dark])
  return (
    <Button size="icon-sm" variant="outline" aria-label={dark ? "Paper ground" : "Ink ground"} onClick={() => setDark((d) => !d)}>
      {dark ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}

export const ORIGIN = "https://cie-ds.vercel.app"
export const addCmd = (name: string) => `npx shadcn@latest add ${ORIGIN}/r/${name}.json`
export const nsCmd = (name: string) => `npx shadcn@latest add @cie/${name}`
