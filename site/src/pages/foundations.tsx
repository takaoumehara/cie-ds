import * as React from "react"
import { PlayIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { FOUNDATIONS, href } from "../nav"
import { DURATIONS, EASINGS, cssGroups, cssMobile, motionTs, resolveRef, tokens, tokensCss } from "../tokens"
import { CodeBlock, CopyButton, Eyebrow, PageHeader, Section, T, Table } from "../ui"
import { Missing } from "./component"

// Every value on these pages is read from tokens.json / tokens.css / cie-motion.ts at build time.
const cssVar = new Map(cssGroups.flatMap((g) => g.vars.map((v) => [v.name, v] as const)))
const group = (prefix: string) => cssGroups.find((g) => g.title.startsWith(prefix))

function Var({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <code className="font-mono text-[13px]">{name}</code>
      <CopyButton text={`var(${name})`} label={`Copy var(${name})`} />
    </span>
  )
}

function CssGroupTable({ title }: { title: string }) {
  const g = group(title)
  if (!g) return null
  return (
    <Table
      head={["Custom property", "Value", "Note"]}
      rows={g.vars.map((v) => [<Var name={v.name} />, <code className="break-all text-muted-foreground">{v.value}</code>, <span className="text-muted-foreground">{v.comment ?? ""}</span>])}
    />
  )
}

const Source = ({ children }: { children: React.ReactNode }) => (
  <p className="font-mono text-xs text-muted-foreground uppercase">
    <T ja="出典" en="Source" />: {children}
  </p>
)

// ── Colour ───────────────────────────────────────────────────────────────────
function Colour() {
  const colors = Object.entries(tokens.color) as [string, { value: string; css: string; contrastOnInk?: string; contrastOnPaper?: string }][]
  return (
    <>
      <Section title={<T ja="2色: ink と paper" en="Two inks: ink and paper" />}>
        <p className="max-w-3xl text-muted-foreground">{tokens.rules[0]} {tokens.rules[1]}</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {colors.map(([k, c]) => (
            <div key={k} className="flex flex-col overflow-hidden rounded-[var(--radius)] border border-border">
              <div className="relative h-28" style={{ background: c.value }}>
                <span className="absolute inset-0 -z-10 bg-[repeating-conic-gradient(var(--muted)_0_25%,transparent_0_50%)] bg-[length:16px_16px]" />
              </div>
              <div className="flex flex-col gap-0.5 p-3">
                <span className="text-[15px]">{k}</span>
                <code className="font-mono text-[12px] text-muted-foreground">{c.css}</code>
                <code className="font-mono text-[12px] text-muted-foreground">{c.value}</code>
                {(c.contrastOnInk || c.contrastOnPaper) && (
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {c.contrastOnInk ? `on ink ${c.contrastOnInk}` : `on paper ${c.contrastOnPaper}`}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <Source>tokens.json › color</Source>
      </Section>
      <Section title={<T ja="組み合わせ" en="Pairings" />}>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["ink", "paper", "inkMute"],
            ["paper", "ink", "paperMute"],
          ].map(([bg, fg, mute]) => {
            const c = tokens.color as Record<string, { value: string }>
            return (
              <div key={bg} className="flex flex-col gap-2 rounded-page p-7" style={{ background: c[bg].value, color: c[fg].value }}>
                <span className="font-mono text-xs uppercase" style={{ color: c[mute].value }}>
                  {fg} on {bg} · {mute}
                </span>
                <span className="text-4xl font-[300] tracking-[-0.04em]">Creativity Is Everywhere</span>
                <span style={{ color: c[mute].value }}>
                  <T ja="階層は色ではなく、大きさと太さで。" en="Hierarchy is size and weight, not colour." />
                </span>
              </div>
            )
          })}
        </div>
      </Section>
      <Section title="tokens.css">
        <CssGroupTable title="Colour" />
      </Section>
    </>
  )
}

// ── Typography ───────────────────────────────────────────────────────────────
function Typography() {
  const fonts = Object.entries(tokens.font) as [string, { family: string; weights: string | number[]; load: string; css: string; notes?: string; fallbacks?: string[] }][]
  const stack = (name: string) => cssVar.get(name)?.value
  return (
    <>
      <Section title={<T ja="書体" en="Typefaces" />}>
        <div className="flex flex-col gap-3">
          {fonts.map(([k, f]) => (
            <div key={k} className="grid gap-4 rounded-[var(--radius)] border border-border p-6 md:grid-cols-[14rem_1fr]">
              <div className="flex flex-col gap-1">
                <span className="text-lg">{f.family}</span>
                <Var name={f.css} />
                <span className="font-mono text-xs text-muted-foreground">
                  {Array.isArray(f.weights) ? f.weights.join(" · ") : f.weights}
                </span>
                {f.notes && <span className="text-sm text-muted-foreground">{f.notes}</span>}
              </div>
              <div className="min-w-0" style={{ fontFamily: stack(f.css) }} lang={k === "sansJa" ? "ja" : undefined}>
                <p className="text-4xl leading-tight font-[300] tracking-[-0.03em]">
                  {k === "sansJa" ? "創造性はどこにでもある" : "Creativity Is Everywhere"}
                </p>
                {k !== "sansJa" && (
                  <p className="mt-2 flex flex-wrap gap-x-4 text-xl">
                    {(Array.isArray(f.weights) ? f.weights : [100, 300, 400, 560, 700, 900]).map((w) => (
                      <span key={w} style={{ fontWeight: w }}>
                        {w}
                      </span>
                    ))}
                  </p>
                )}
                <code className="mt-3 block truncate font-mono text-[12px] text-muted-foreground">{f.load}</code>
              </div>
            </div>
          ))}
        </div>
        <Source>tokens.json › font</Source>
      </Section>
      <Section title={<T ja="サイズ" en="Type scale" />}>
        <div className="flex flex-col">
          {Object.entries(tokens.typeSize).map(([k, v]) => (
            <div key={k} className="grid items-baseline gap-2 border-t border-border py-4 md:grid-cols-[12rem_minmax(0,1fr)]">
              <div className="flex flex-col">
                <span>{k}</span>
                <Var name={`--cie-text-${k}`} />
                <code className="font-mono text-[12px] text-muted-foreground">{v}</code>
              </div>
              <span className={cn("truncate leading-none font-[300] tracking-[-0.04em]", k === "mono" && "font-mono tracking-normal")} style={{ fontSize: v }}>
                {k === "mono" ? "DM MONO 12PX" : "Everywhere"}
              </span>
            </div>
          ))}
        </div>
        <Source>tokens.json › typeSize · tokens.css (--cie-text-*)</Source>
      </Section>
      <Section title={<T ja="小さい画面での上書き" en="Small-screen overrides" />}>
        <MobileOverrides filter={(n) => /text|r$/.test(n)} />
      </Section>
    </>
  )
}

function MobileOverrides({ filter }: { filter?: (name: string) => boolean }) {
  const vars = cssMobile.vars.filter((v) => !filter || filter(v.name))
  return (
    <>
      <p className="font-mono text-xs text-muted-foreground">{cssMobile.query}</p>
      <Table head={["Custom property", "Desktop", "Override"]} rows={vars.map((v) => [<code>{v.name}</code>, <code className="text-muted-foreground">{cssVar.get(v.name)?.value ?? "—"}</code>, <code>{v.value}</code>])} />
    </>
  )
}

// ── Space & shape ────────────────────────────────────────────────────────────
function Spacing() {
  const r = tokens.radius as Record<string, string>
  return (
    <>
      <Section title={<T ja="余白スケール（4px 基準）" en="Space scale (4px base)" />}>
        <div className="flex flex-col gap-2">
          {tokens.space.scale.map((n) => (
            <div key={n} className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-3">
              <code className="font-mono text-[13px]">--cie-s-{n}</code>
              <div className="flex items-center gap-3">
                <span className="h-4 rounded-[2px] bg-foreground" style={{ width: n * 4 }} />
                <span className="font-mono text-xs text-muted-foreground">{n}px</span>
              </div>
            </div>
          ))}
        </div>
        <Table
          head={["Token", "Value"]}
          minWidth="24rem"
          rows={[
            [<code>space.base</code>, <code>{tokens.space.base}</code>],
            [<Var name="--cie-edge" />, <code>{tokens.space.edge}</code>],
            [<Var name="--cie-cell-pad" />, <code>{tokens.space.cellPad}</code>],
            [<Var name="--cie-measure" />, <code>{tokens.space.measure}</code>],
          ]}
        />
        <Source>tokens.json › space</Source>
      </Section>
      <Section title={<T ja="角丸" en="Radius" />}>
        <p className="max-w-3xl text-muted-foreground">{tokens.rules[2]}</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            ["block", r.block, "--cie-r"],
            ["page", r.page, "--cie-r-page"],
            ["pill", r.pill, "--cie-r-pill"],
            ["editorial card", tokens.editorial.radius.card, "--cie-r-card"],
            ["editorial media", tokens.editorial.radius.media, "--cie-r-media"],
          ].map(([k, v, css]) => (
            <div key={k} className="flex flex-col gap-2">
              <div className="h-24 bg-primary" style={{ borderRadius: v }} />
              <span className="text-[15px]">{k}</span>
              <code className="font-mono text-[12px] text-muted-foreground">{css}</code>
              <code className="font-mono text-[12px] break-all text-muted-foreground">{v}</code>
            </div>
          ))}
        </div>
      </Section>
      <Section title={<T ja="影" en="Shadow" />}>
        <p className="text-muted-foreground">
          <code className="font-mono">shadow.default: {tokens.shadow.default}</code> — {tokens.rules[3]}
        </p>
      </Section>
      <Section title="tokens.css">
        <CssGroupTable title="Space" />
        <CssGroupTable title="Shape" />
        <MobileOverrides filter={(n) => /--cie-r$|cols|rows/.test(n)} />
      </Section>
    </>
  )
}

// ── Motion ───────────────────────────────────────────────────────────────────
const bez = (s: string) => (/cubic-bezier\(([^)]+)\)/.exec(s)?.[1] ?? "0,0,1,1").split(",").map(Number)

function Curve({ value }: { value: string }) {
  const [x1, y1, x2, y2] = bez(value)
  const W = 120
  const pad = 16
  const y = (v: number) => pad + (1 - v) * (W - 2 * pad)
  const x = (v: number) => pad + v * (W - 2 * pad)
  return (
    <svg viewBox={`0 0 ${W} ${W}`} className="size-28 text-foreground" aria-hidden>
      <rect x={pad} y={pad} width={W - 2 * pad} height={W - 2 * pad} fill="none" stroke="currentColor" strokeOpacity={0.15} />
      <line x1={x(0)} y1={y(0)} x2={x(x1)} y2={y(y1)} stroke="currentColor" strokeOpacity={0.35} />
      <line x1={x(1)} y1={y(1)} x2={x(x2)} y2={y(y2)} stroke="currentColor" strokeOpacity={0.35} />
      <path d={`M ${x(0)} ${y(0)} C ${x(x1)} ${y(y1)}, ${x(x2)} ${y(y2)}, ${x(1)} ${y(1)}`} fill="none" stroke="currentColor" strokeWidth={2} />
    </svg>
  )
}

function useReduced() {
  const [r, setR] = React.useState(() => matchMedia("(prefers-reduced-motion: reduce)").matches)
  React.useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)")
    const on = () => setR(mq.matches)
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])
  return r
}

/** A dot crossing a track with a given duration + easing. Click to play. */
function Track({ duration, ease, at }: { duration: string; ease: string; at: boolean }) {
  const reduce = useReduced()
  return (
    <div className="relative h-6 w-full rounded-full bg-muted">
      <span
        className="absolute top-1 left-1 size-4 rounded-full bg-foreground"
        style={{
          left: at ? "calc(100% - 1.25rem)" : "0.25rem",
          transition: reduce ? "none" : `left ${duration} ${ease}`,
        }}
      />
    </div>
  )
}

function Motion() {
  const [ease, setEase] = React.useState(EASINGS[0][0])
  const [at, setAt] = React.useState(false)
  const [easeAt, setEaseAt] = React.useState(false)
  const reduce = useReduced()
  const easeValue = tokens.motion[ease as keyof typeof tokens.motion] as string
  const cssName = (k: string) => `--cie-${k.startsWith("ease") ? "ease-" + k.slice(4).toLowerCase() : "t-" + k}`
  const playDuration = DURATIONS.find(([k]) => k === "move")?.[1] ?? "360ms"
  return (
    <>
      <Section title={<T ja="考え方" en="Language" />}>
        <p className="max-w-3xl leading-relaxed text-muted-foreground">{tokens.motion.notes}</p>
        <p className="max-w-3xl text-muted-foreground">{tokens.rules[4]}</p>
        {reduce && (
          <p className="font-mono text-xs uppercase">
            <T ja="prefers-reduced-motion が ON のため、デモは即座に切り替わります。" en="prefers-reduced-motion is on — demos jump instead of animating." />
          </p>
        )}
      </Section>

      <Section
        title={<T ja="時間" en="Durations" />}
        aside={
          <Button size="sm" onClick={() => setAt((a) => !a)}>
            <PlayIcon /> <T ja="再生" en="Play" />
          </Button>
        }
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 font-mono text-xs text-muted-foreground uppercase">easing</span>
          {EASINGS.map(([k]) => (
            <Button key={k} size="sm" variant={ease === k ? "default" : "outline"} aria-pressed={ease === k} onClick={() => setEase(k)} className="font-mono">
              {k}
            </Button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {DURATIONS.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[minmax(0,9rem)_4rem_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[11rem_4rem_minmax(0,1fr)]">
              <span className="flex flex-col">
                <span className="text-[15px]">{k}</span>
                <code className="truncate font-mono text-[11px] text-muted-foreground">{cssName(k)}</code>
              </span>
              <code className="font-mono text-[13px]">{v}</code>
              <Track duration={v} ease={easeValue} at={at} />
            </div>
          ))}
        </div>
        <Source>tokens.json › motion</Source>
      </Section>

      <Section
        title={<T ja="イージング" en="Easings" />}
        aside={
          <Button size="sm" onClick={() => setEaseAt((a) => !a)}>
            <PlayIcon /> <T ja={`再生（${playDuration}）`} en={`Play (${playDuration})`} />
          </Button>
        }
      >
        <div className="grid gap-3 md:grid-cols-3">
          {EASINGS.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-3 rounded-[var(--radius)] border border-border p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-lg">{k}</span>
                  <Var name={cssName(k)} />
                </div>
                <Curve value={v} />
              </div>
              <code className="font-mono text-[12px] text-muted-foreground">{v}</code>
              <span className="text-sm text-muted-foreground">{cssVar.get(cssName(k))?.comment}</span>
              <Track duration={playDuration} ease={v} at={easeAt} />
            </div>
          ))}
        </div>
      </Section>

      <Section title={<T ja="ブラー" en="Blur" />}>
        <Table
          head={["Token", "Custom property", "Value", "Note"]}
          rows={(["blurIn", "whipBlur"] as const).map((k) => {
            const css = k === "blurIn" ? "--cie-blur-in" : "--cie-whip-blur"
            return [<code>{k}</code>, <Var name={css} />, <code>{tokens.motion[k]}</code>, <span className="text-muted-foreground">{cssVar.get(css)?.comment}</span>]
          })}
        />
      </Section>

      <Section title="tokens.css">
        <CssGroupTable title="Motion" />
      </Section>

      <Section title={<T ja="motion/react 用（cie-motion.ts）" en="For motion/react (cie-motion.ts)" />}>
        <p className="text-muted-foreground">
          <T
            ja={<>tokens.json から生成。<a className="underline" href={href({ page: "library", name: "cie-motion" })}>cie-motion</a> で入ります。</>}
            en={<>Generated from tokens.json; install with <a className="underline" href={href({ page: "library", name: "cie-motion" })}>cie-motion</a>.</>}
          />
        </p>
        <CodeBlock code={motionTs} title="registry/cie/lib/cie-motion.ts" />
      </Section>
    </>
  )
}

// ── Scroll & interaction ─────────────────────────────────────────────────────
function Interaction() {
  const s = tokens.scroll as Record<string, string | number>
  const css: Record<string, string> = {
    revealY: "--cie-reveal-y",
    revealX: "--cie-reveal-x",
    parallaxMax: "--cie-parallax-max",
    pressScale: "--cie-press-scale",
    hoverNudge: "--cie-hover-nudge",
    scrollbarSize: "--cie-sb-size",
  }
  return (
    <>
      <Section title={<T ja="スクロール・操作のトークン" en="Scroll & micro-interaction tokens" />}>
        <Table
          head={["Token", "Custom property", "Value"]}
          rows={Object.entries(s).map(([k, v]) => [<code>{k}</code>, <Var name={css[k]} />, <code>{String(v)}</code>])}
        />
        <Source>tokens.json › scroll</Source>
      </Section>
      <Section title={<T ja="試す" en="Try it" />}>
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            className="rounded-full bg-primary px-6 py-3 text-primary-foreground transition-transform ease-cie-out motion-reduce:transition-none"
            style={{ transitionDuration: tokens.motion.snap }}
            onPointerDown={(e) => (e.currentTarget.style.transform = `scale(${s.pressScale})`)}
            onPointerUp={(e) => (e.currentTarget.style.transform = "")}
            onPointerLeave={(e) => (e.currentTarget.style.transform = "")}
          >
            pressScale {String(s.pressScale)}
          </button>
          <a href="#/foundations/interaction" onClick={(e) => e.preventDefault()} className="group inline-flex items-center gap-2 text-lg">
            hoverNudge {String(s.hoverNudge)}
            <span className="inline-block transition-transform ease-cie-out group-hover:translate-x-[var(--n)] motion-reduce:transition-none" style={{ ["--n" as string]: String(s.hoverNudge), transitionDuration: tokens.motion.fast }}>
              →
            </span>
          </a>
        </div>
        <p className="text-muted-foreground">{tokens.rules[7]}</p>
      </Section>
      <Section title="tokens.css">
        <CssGroupTable title="Scroll" />
      </Section>
      <Section title={<T ja="ルール" en="Rules" />}>
        <ul className="list-disc pl-5 leading-loose text-muted-foreground">
          {tokens.rules.slice(4, 7).map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </Section>
    </>
  )
}

// ── Editorial ────────────────────────────────────────────────────────────────
function Editorial() {
  const ed = tokens.editorial
  const css: Record<string, string> = { section: "--cie-section", gutter: "--cie-gutter", container: "--cie-container", cardPad: "--cie-card-pad", gap: "--cie-gap", gapLg: "--cie-gap-lg" }
  return (
    <>
      <Section title={<T ja="モード" en="Mode" />}>
        <p className="max-w-3xl leading-relaxed text-muted-foreground">{ed.notes}</p>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <a href="/editorial">/editorial</a>
          </Button>
          <Button asChild size="sm" variant="outline">
            <a href={href({ page: "file", file: "editorial.css" })}>editorial.css</a>
          </Button>
          <Button asChild size="sm" variant="outline">
            <a href={href({ page: "category", id: "editorial" })}>Layout components</a>
          </Button>
        </div>
      </Section>
      <Section title={<T ja="文字" en="Type" />}>
        <div className="flex flex-col">
          {Object.entries(ed.type).map(([k, t]) => (
            <div key={k} className="grid items-baseline gap-2 border-t border-border py-4 md:grid-cols-[14rem_minmax(0,1fr)]">
              <div className="flex flex-col font-mono text-[12px] text-muted-foreground">
                <span className="font-sans text-[15px] text-foreground">{k}</span>
                <span>{t.size}</span>
                <span>
                  {t.weight} · {t.leading} · {t.tracking}
                  {"family" in t ? ` · ${t.family}` : ""}
                  {"case" in t ? ` · ${t.case}` : ""}
                </span>
              </div>
              <span
                className={cn("block", "family" in t && "font-mono")}
                style={{ fontSize: t.size, fontWeight: t.weight, lineHeight: t.leading, letterSpacing: t.tracking, textTransform: "case" in t ? (t.case as "uppercase") : undefined }}
              >
                Creativity is everywhere
              </span>
            </div>
          ))}
        </div>
      </Section>
      <Section title={<T ja="余白" en="Space" />}>
        <Table head={["Token", "Custom property", "Value"]} rows={Object.entries(ed.space).map(([k, v]) => [<code>{k}</code>, <Var name={css[k]} />, <code>{v}</code>])} />
      </Section>
      <Section title={<T ja="面（2色の混色）" en="Surfaces (ink/paper mixes)" />}>
        <div className="grid gap-3 sm:grid-cols-3">
          {Object.entries(ed.surface).map(([k, v]) => (
            <div key={k} className="flex flex-col gap-2">
              <div className="h-24 rounded-card border border-border" style={{ background: `color-mix(in oklab, var(--foreground) ${v}, var(--background))` }} />
              <span>{k}</span>
              <code className="font-mono text-[12px] text-muted-foreground">
                {k === "hairline" ? "--cie-hairline" : `--cie-surface-${k}`} · {v}
              </code>
            </div>
          ))}
        </div>
        <Source>tokens.json › editorial</Source>
      </Section>
      <Section title="tokens.css">
        <CssGroupTable title="Editorial" />
      </Section>
    </>
  )
}

// ── Semantic theme ───────────────────────────────────────────────────────────
function Theme() {
  const sem = tokens.semantic as { notes: string; radius: string; dark: Record<string, string>; light: Record<string, string>; exceptions: string[] }
  const sw = (v: string) => (
    <span className="flex items-center gap-2">
      <span aria-hidden className="inline-block size-5 shrink-0 rounded-full border border-border" style={{ background: resolveRef(v) }} />
      <code className="text-[12px] text-muted-foreground">{v === resolveRef(v) ? v : `${v} → ${resolveRef(v)}`}</code>
    </span>
  )
  return (
    <>
      <Section title={<T ja="shadcn セマンティック変数" en="shadcn semantic aliases" />}>
        <p className="max-w-3xl leading-relaxed text-muted-foreground">{sem.notes}</p>
        <p className="text-muted-foreground">
          <code className="font-mono">--radius</code>: <code className="font-mono">{sem.radius} → {resolveRef(sem.radius)}</code>
        </p>
        <Table
          head={["Variable", "dark (ink ground)", "light (paper ground)"]}
          minWidth="44rem"
          rows={Object.keys(sem.dark).map((k) => [<Var name={`--${k}`} />, sw(sem.dark[k]), sw(sem.light[k])])}
        />
        <Source>tokens.json › semantic</Source>
      </Section>
      <Section title={<T ja="例外" en="Exceptions" />}>
        <ul className="list-disc pl-5 leading-loose text-muted-foreground">
          {sem.exceptions.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      </Section>
    </>
  )
}

// ── Principles ───────────────────────────────────────────────────────────────
function Principles() {
  return (
    <>
      <Section title={<T ja="ルール" en="Rules" />}>
        <ol className="flex flex-col">
          {tokens.rules.map((r, i) => (
            <li key={r} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-2 border-t border-border py-4 text-xl font-[300] tracking-[-0.02em]">
              <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              {r}
            </li>
          ))}
        </ol>
        <Source>tokens.json › rules</Source>
      </Section>
      <Section title={<T ja="詳しく" en="More" />}>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <a href="/DESIGN.md">DESIGN.md</a>
          </Button>
          <Button asChild size="sm" variant="outline">
            <a href="/guide.md">guide.md</a>
          </Button>
        </div>
      </Section>
    </>
  )
}

// ── All tokens ───────────────────────────────────────────────────────────────
function AllTokens() {
  return (
    <>
      <Section title={<T ja="ファイル" en="Files" />}>
        <p className="text-muted-foreground">
          <T
            ja="tokens.json が唯一の元データ。tokens.css（HTML 版）と cie-theme / cie-motion（React 版）はここから揃えられています。"
            en="tokens.json is the single source of truth; tokens.css (HTML kit) and cie-theme / cie-motion (React) are kept in step with it."
          />
        </p>
        <div className="flex flex-wrap gap-2">
          {["/tokens.json", "/tokens.css", "/r/cie-theme.json"].map((f) => (
            <Button key={f} asChild size="sm" variant="outline" className="font-mono">
              <a href={f}>{f}</a>
            </Button>
          ))}
        </div>
      </Section>
      {cssGroups.map((g) => (
        <Section key={g.title} title={<span className="text-2xl">{g.title}</span>}>
          <Table
            head={["Custom property", "Value", "Note"]}
            rows={g.vars.map((v) => [<Var name={v.name} />, <code className="break-all text-muted-foreground">{v.value}</code>, <span className="text-muted-foreground">{v.comment ?? ""}</span>])}
          />
        </Section>
      ))}
      <Section title={<span className="text-2xl">@media</span>}>
        <MobileOverrides />
      </Section>
      <Section title="tokens.css">
        <details className="rounded-[var(--radius)] border border-border">
          <summary className="cursor-pointer px-4 py-3 font-mono text-sm">tokens.css</summary>
          <CodeBlock code={tokensCss} title="tokens.css" className="m-3 mt-0" />
        </details>
      </Section>
    </>
  )
}

const PAGES: Record<string, () => React.ReactNode> = {
  colour: Colour,
  typography: Typography,
  spacing: Spacing,
  motion: Motion,
  interaction: Interaction,
  editorial: Editorial,
  theme: Theme,
  principles: Principles,
  tokens: AllTokens,
}

export function FoundationPage({ id }: { id: string }) {
  const meta = FOUNDATIONS.find((f) => f.id === id)
  const Body = PAGES[id]
  if (!meta || !Body) return <Missing what={id} />
  return (
    <div>
      <PageHeader eyebrow={<>Foundations · tokens.json / tokens.css</>} title={<T ja={meta.ja} en={meta.title} />} />
      <nav aria-label="Foundations" className="-mt-2 mb-4 flex flex-wrap gap-1.5">
        {FOUNDATIONS.map((f) => (
          <Button key={f.id} asChild size="sm" variant={f.id === id ? "default" : "ghost"}>
            <a href={href({ page: "foundation", id: f.id })} aria-current={f.id === id ? "page" : undefined}>
              <T ja={f.ja} en={f.title} />
            </a>
          </Button>
        ))}
      </nav>
      <Eyebrow className="sr-only">{meta.title}</Eyebrow>
      <Body />
    </div>
  )
}
