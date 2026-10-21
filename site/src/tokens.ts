// Token index for the docs, read straight from the source files (never re-typed):
//   tokens.json           — the single source of truth (structure, notes, semantic theme, rules)
//   tokens.css            — the vanilla kit's custom properties, grouped by its own section comments
//   cie-theme.css         — the generated shadcn theme (adds --cie-surface-*, semantic aliases)
//   cie-motion.ts         — the generated motion constants for motion/react
import tokens from "../../tokens.json"
import tokensCss from "../../tokens.css?raw"
import themeCss from "../../registry/cie/styles/cie-theme.css?raw"
import motionTs from "../../registry/cie/lib/cie-motion.ts?raw"

export { tokens, tokensCss, motionTs }

export type CssVar = { name: string; value: string; comment?: string }
export type CssGroup = { title: string; vars: CssVar[] }

/** tokens.css `:root { … }` split into the groups its comments declare ("Colour — paper and ink only", …). */
function parseTokensCss(src: string) {
  const body = src.slice(src.indexOf(":root {") + 7)
  const groups: CssGroup[] = []
  const re = /\/\*\s*([\s\S]+?)\s*\*\/|(--[\w-]+):\s*([^;]+);[ \t]*(?:\/\*\s*(.+?)\s*\*\/)?/g
  for (const m of body.matchAll(re)) {
    if (m[1] !== undefined) groups.push({ title: m[1], vars: [] })
    else groups[groups.length - 1]?.vars.push({ name: m[2], value: m[3].replace(/\s+/g, " ").trim(), comment: m[4] })
  }
  return groups.filter((g) => g.vars.length)
}

function parseMultiLine(src: string): Map<string, string> {
  const out = new Map<string, string>()
  const body = src.replace(/\/\*[\s\S]*?\*\//g, "")
  for (const m of body.matchAll(/(--[\w-]+):\s*([^;{}]+);/g)) if (!out.has(m[1])) out.set(m[1], m[2].replace(/\s+/g, " ").trim())
  return out
}

const tokensCssRoot = tokensCss.slice(0, tokensCss.indexOf("@media"))
export const cssGroups: CssGroup[] = parseTokensCss(tokensCssRoot)

/** The `@media (max-width: 760px), (orientation: portrait)` overrides in tokens.css. */
export const cssMobile = (() => {
  const i = tokensCss.indexOf("@media")
  const head = tokensCss.slice(i, tokensCss.indexOf("{", i)).trim()
  const block = tokensCss.slice(i, tokensCss.indexOf("\n}", i))
  return { query: head, vars: [...parseMultiLine(block)].map(([name, value]) => ({ name, value })) }
})()

// `.dark {` at the start of a line — not the `(&:is(.dark *))` custom-variant above it
const darkAt = themeCss.indexOf("\n.dark")
const themeLight = parseMultiLine(themeCss.slice(0, darkAt))
const themeDark = parseMultiLine(themeCss.slice(darkAt, themeCss.indexOf("}", darkAt)))
const tokensCssVars = parseMultiLine(tokensCssRoot)

/** Resolved value(s) of a custom property, plus which file defines it. */
export function lookupVar(name: string): { value?: string; dark?: string; light?: string; file?: string } {
  if (themeDark.has(name) && themeLight.has(name) && themeDark.get(name) !== themeLight.get(name))
    return { dark: themeDark.get(name), light: themeLight.get(name), file: "cie-theme.css (from tokens.json › semantic)" }
  if (tokensCssVars.has(name)) return { value: tokensCssVars.get(name), file: "tokens.css" }
  if (themeLight.has(name)) return { value: themeLight.get(name), file: "cie-theme.css" }
  return {}
}

/** Value text for a cie-motion.ts reference (cieTransition.move → "{ duration: cieDuration.move, ease: cieEase.expo }"). */
export function lookupMotion(ref: string): string | undefined {
  const [obj, key] = ref.split(".")
  const s = motionTs.indexOf(`export const ${obj}`)
  if (s < 0) return
  const e = motionTs.indexOf("\n}", s)
  const m = new RegExp(`\\n\\s*${key}:\\s*([^\\n]+?),?\\n`).exec(motionTs.slice(s, e + 1))
  return m?.[1]
}

/** Durations + easings as named in tokens.json › motion, resolved for display. */
export const motion = tokens.motion as Record<string, string>
export const DURATIONS = Object.entries(motion).filter(([, v]) => /^\d+ms$/.test(v))
export const EASINGS = Object.entries(motion).filter(([, v]) => v.startsWith("cubic-bezier"))

/** Resolve "{color.ink}" style refs used by tokens.json › semantic. */
export function resolveRef(v: string): string {
  const m = /^\{([\w.]+)\}$/.exec(v)
  if (!m) return v
  const hit = m[1].split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], tokens)
  return typeof hit === "object" && hit ? (hit as { value: string }).value : String(hit)
}

/** Explain cieTransition.x as plain values, using the generated cie-motion.ts text. */
export function describeMotion(ref: string): string {
  const text = lookupMotion(ref)
  if (!text) return ""
  return text.replace(/cieDuration\.(\w+)/g, (_, k) => `${motion[k] ?? k}`).replace(/cieEase\.(\w+)/g, (_, k) => {
    const key = `ease${k[0].toUpperCase()}${k.slice(1)}`
    return motion[key] ? `${k} ${motion[key]}` : k
  })
}
