#!/usr/bin/env node
// tokens.json is the single source of truth. This script derives everything
// the shadcn registry and the React preview need from it:
//   1. registry.json  → `cie-theme` item (cssVars + css)
//   2. registry/cie/lib/cie-motion.ts  (motion easing / duration constants)
//   3. registry/cie/styles/cie-theme.css (same theme as plain Tailwind v4 CSS, for the preview)
// Run: node scripts/sync-tokens.mjs        (write)
//      node scripts/sync-tokens.mjs --check (exit 1 if anything is stale)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const read = (p) => readFileSync(join(root, p), "utf8")
const tokens = JSON.parse(read("tokens.json"))
const check = process.argv.includes("--check")

// ── helpers ──────────────────────────────────────────────────────────────
function resolveRef(value) {
  const m = /^\{([\w.]+)\}$/.exec(value)
  if (!m) return value
  const v = m[1].split(".").reduce((o, k) => o?.[k], tokens)
  if (v === undefined) throw new Error(`Unknown token ref ${value}`)
  return typeof v === "object" ? v.value : v
}
const bezier = (s) => {
  const m = /cubic-bezier\(([^)]+)\)/.exec(s)
  if (!m) throw new Error(`Not a cubic-bezier: ${s}`)
  return m[1].split(",").map((n) => Number(n.trim()))
}
const ms = (s) => Number.parseFloat(s) / 1000
const fontStack = (f, fallback) => `'${f.family}', ${fallback}`

const { color, motion, radius, scroll, semantic } = tokens
const sans = fontStack(
  tokens.font.sans,
  "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
)
const mono = fontStack(tokens.font.mono, "ui-monospace, 'SF Mono', Menlo, Consolas, monospace")
const sansJa = `'${tokens.font.sansJa.family}', ${tokens.font.sansJa.fallbacks.map((f) => `'${f}'`).join(", ")}, sans-serif`

const palette = (mode) => Object.fromEntries(Object.entries(semantic[mode]).map(([k, v]) => [k, resolveRef(v)]))
const light = { radius: resolveRef(semantic.radius), ...palette("light") }
const dark = palette("dark")

// Raw --cie-* primitives so hand-written CSS (and the vanilla cie-ds files) keep working.
const raw = {
  "--cie-ink": color.ink.value,
  "--cie-paper": color.paper.value,
  "--cie-ink-mute": color.inkMute.value,
  "--cie-paper-mute": color.paperMute.value,
  "--cie-sans": sans,
  "--cie-mono": mono,
  "--cie-sans-ja": sansJa,
  "--cie-r": radius.block,
  "--cie-r-page": radius.page,
  "--cie-t-snap": motion.snap,
  "--cie-t-fast": motion.fast,
  "--cie-t-cell": motion.cell,
  "--cie-t-move": motion.move,
  "--cie-t-rise": motion.rise,
  "--cie-t-sheet": motion.sheet,
  "--cie-t-stagger": motion.stagger,
  "--cie-ease-expo": motion.easeExpo,
  "--cie-ease-out": motion.easeOut,
  "--cie-ease-snap": motion.easeSnap,
  "--cie-parallax-max": scroll.parallaxMax,
  "--cie-press-scale": String(scroll.pressScale),
  "--cie-hover-nudge": scroll.hoverNudge,
}

// Goes into `@theme inline` — becomes Tailwind utilities (font-sans, ease-cie-expo, rounded-page, border-stroke…)
const theme = {
  "font-sans": sans,
  "font-mono": mono,
  "font-ja": sansJa,
  "ease-cie-expo": motion.easeExpo,
  "ease-cie-out": motion.easeOut,
  "ease-cie-snap": motion.easeSnap,
  "radius-page": radius.page,
  "color-stroke": "var(--stroke)",
  "animate-cie-shimmer": "cie-shimmer var(--cie-shimmer-duration, 2.4s) linear infinite",
  "animate-cie-grain": "cie-grain 0.9s steps(4) infinite",
}

const keyframes = {
  "@keyframes cie-shimmer": {
    "0%": { "background-position": "200% 0" },
    "100%": { "background-position": "-200% 0" },
  },
  "@keyframes cie-grain": {
    "0%, 100%": { transform: "translate(0, 0)" },
    "25%": { transform: "translate(-2%, 1%)" },
    "50%": { transform: "translate(1%, -2%)" },
    "75%": { transform: "translate(2%, 2%)" },
  },
}

// Shared utilities: a border-only ring mask (border beams, spotlight rims). The ring is the element's padding — set p-px etc.
const utilities = {
  "@utility cie-ring-mask": {
    "mask-image": "linear-gradient(var(--foreground) 0 0), linear-gradient(var(--foreground) 0 0)",
    "mask-clip": "content-box, border-box",
    "mask-composite": "exclude",
    "-webkit-mask-composite": "xor",
  },
}

const css = {
  ":root": raw,
  ...keyframes,
  ...utilities,
  "@layer base": {
    body: { "font-feature-settings": "'palt' 0", "-webkit-font-smoothing": "antialiased" },
    ":lang(ja)": {
      "--cie-sans": sansJa,
      "font-family": sansJa,
      "font-feature-settings": "'palt' 1",
      "letter-spacing": "0",
    },
    "::selection": { background: "var(--foreground)", color: "var(--background)" },
  },
}

// ── 1. registry.json ─────────────────────────────────────────────────────
const registryPath = "registry.json"
const registryBefore = read(registryPath)
const registry = JSON.parse(registryBefore)
const themeItem = registry.items.find((i) => i.name === "cie-theme")
if (!themeItem) throw new Error("registry.json has no cie-theme item")
themeItem.cssVars = { theme, light, dark }
themeItem.css = css
const registryAfter = JSON.stringify(registry, null, 2) + "\n"

// ── 2. motion constants ──────────────────────────────────────────────────
const motionTs = `// Generated from tokens.json by scripts/sync-tokens.mjs — do not edit by hand.
// cie-ds motion language for \`motion/react\`: snappy にゅるっと (expands land in 280–420ms).
import type { Transition } from "motion/react"

type Bezier = [number, number, number, number]

export const cieEase = {
  /** Decisive settle / expand */
  expo: ${JSON.stringify(bezier(motion.easeExpo))} as Bezier,
  /** Rise, soft land */
  out: ${JSON.stringify(bezier(motion.easeOut))} as Bezier,
  /** Subtle overshoot */
  snap: ${JSON.stringify(bezier(motion.easeSnap))} as Bezier,
}

/** Seconds (motion uses seconds, CSS tokens use ms). */
export const cieDuration = {
  snap: ${ms(motion.snap)},
  fast: ${ms(motion.fast)},
  cell: ${ms(motion.cell)},
  move: ${ms(motion.move)},
  rise: ${ms(motion.rise)},
  sheet: ${ms(motion.sheet)},
  stagger: ${ms(motion.stagger)},
}

export const cieTransition = {
  snap: { duration: cieDuration.snap, ease: cieEase.out },
  fast: { duration: cieDuration.fast, ease: cieEase.out },
  cell: { duration: cieDuration.cell, ease: cieEase.expo },
  move: { duration: cieDuration.move, ease: cieEase.expo },
  rise: { duration: cieDuration.rise, ease: cieEase.out },
  sheet: { duration: cieDuration.sheet, ease: cieEase.expo },
  /** Physical follow-through for drags, magnets and layout pills. Settles ≈ 350ms. */
  spring: { type: "spring", stiffness: 520, damping: 40, mass: 0.8 },
  /** Gentle spring for cursor-follow / parallax smoothing. */
  follow: { type: "spring", stiffness: 160, damping: 28, mass: 0.6 },
} satisfies Record<string, Transition>

export const cieScroll = {
  revealY: ${Number.parseFloat(scroll.revealY)},
  revealX: ${Number.parseFloat(scroll.revealX)},
  parallaxMax: ${Number.parseFloat(scroll.parallaxMax)},
  pressScale: ${scroll.pressScale},
  hoverNudge: ${Number.parseFloat(scroll.hoverNudge)},
}
`

// ── 3. plain CSS theme for the preview app ───────────────────────────────
const decl = (obj, indent = "  ") =>
  Object.entries(obj)
    .map(([k, v]) => `${indent}${k.startsWith("--") ? k : `--${k}`}: ${v};`)
    .join("\n")
const block = (sel, obj, indent = "") => {
  const body = Object.entries(obj)
    .map(([k, v]) => (typeof v === "object" ? block(k, v, indent + "  ") : `${indent}  ${k}: ${v};`))
    .join("\n")
  return `${indent}${sel} {\n${body}\n${indent}}`
}
const colorKeys = Object.keys(dark)
const themeCss = `/* Generated from tokens.json by scripts/sync-tokens.mjs — do not edit by hand.
   Same output as \`npx shadcn add …/r/cie-theme.json\`, as a standalone file. */
@custom-variant dark (&:is(.dark *));

${block(":root", raw)}

:root {
${decl(light)}
}

.dark {
${decl(dark)}
}

@theme inline {
${colorKeys.map((k) => `  --color-${k}: var(--${k});`).join("\n")}
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
${decl(theme)}
}

${Object.entries({ ...keyframes, ...utilities })
  .map(([k, v]) => block(k, v))
  .join("\n\n")}

@layer base {
  * { border-color: var(--border); outline-color: color-mix(in oklab, var(--ring) 50%, transparent); }
  body { background: var(--background); color: var(--foreground); font-family: var(--font-sans); }
${Object.entries(css["@layer base"])
  .map(([k, v]) => block(k, v, "  "))
  .join("\n")}
}
`

// ── write / check ────────────────────────────────────────────────────────
const outputs = [
  [registryPath, registryAfter],
  ["registry/cie/lib/cie-motion.ts", motionTs],
  ["registry/cie/styles/cie-theme.css", themeCss],
]
let stale = 0
for (const [p, content] of outputs) {
  let prev = ""
  try {
    prev = read(p)
  } catch {}
  if (prev === content) continue
  stale++
  if (check) console.error(`stale: ${p}`)
  else {
    mkdirSync(dirname(join(root, p)), { recursive: true })
    writeFileSync(join(root, p), content)
    console.log(`wrote ${p}`)
  }
}
if (check && stale) {
  console.error("Run `npm run tokens` to regenerate from tokens.json.")
  process.exit(1)
}
