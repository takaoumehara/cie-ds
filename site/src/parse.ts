// Lightweight, regex + bracket-matching reader for the registry sources. It only reports what the
// source literally says (exported names, prop members + JSDoc, destructured defaults, cva variants,
// token references) — no type inference, so anything it can't read is shown as written.

export type PropRow = { name: string; type: string; optional: boolean; def?: string; doc?: string }
export type ExportApi = { name: string; kind: "component" | "hook" | "other"; extends: string[]; props: PropRow[] }
export type VariantGroup = { name: string; options: string[]; def?: string }
export type CvaInfo = { name: string; groups: VariantGroup[] }

const OPEN: Record<string, string> = { "{": "}", "(": ")", "[": "]", "<": ">" }

/** Index of the bracket closing the one at `start`, skipping strings, templates and comments. */
export function matchBracket(src: string, start: number): number {
  const open = src[start]
  const close = OPEN[open]
  const angle = open === "<"
  let depth = 0
  for (let i = start; i < src.length; i++) {
    const c = src[i]
    if (c === '"' || c === "'" || c === "`") {
      i = skipString(src, i)
      continue
    }
    if (c === "/" && src[i + 1] === "/") {
      i = src.indexOf("\n", i)
      if (i < 0) return -1
      continue
    }
    if (c === "/" && src[i + 1] === "*") {
      i = src.indexOf("*/", i) + 1
      continue
    }
    if (angle && c === "=" && src[i + 1] === ">") {
      i++
      continue
    }
    if (c === open) depth++
    else if (c === close) {
      depth--
      if (depth === 0) return i
    }
  }
  return -1
}

function skipString(src: string, i: number): number {
  const q = src[i]
  for (let j = i + 1; j < src.length; j++) {
    if (src[j] === "\\") j++
    else if (src[j] === q) return j
  }
  return src.length
}

/** Split `text` at `sep` characters that sit at bracket depth 0 (outside strings / comments). */
export function splitTop(text: string, seps: string): string[] {
  const out: string[] = []
  let depth = 0
  let last = 0
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (c === '"' || c === "'" || c === "`") {
      i = skipString(text, i)
      continue
    }
    if (c === "/" && text[i + 1] === "/") {
      const nl = text.indexOf("\n", i)
      i = nl < 0 ? text.length : nl - 1
      continue
    }
    if (c === "/" && text[i + 1] === "*") {
      i = text.indexOf("*/", i) + 1
      continue
    }
    if (c === "=" && text[i + 1] === ">") {
      i++
      continue
    }
    if ("{([<".includes(c)) depth++
    else if ("})]>".includes(c)) depth--
    else if (depth === 0 && seps.includes(c)) {
      out.push(text.slice(last, i))
      last = i + 1
    }
  }
  out.push(text.slice(last))
  return out.map((s) => s.trim()).filter(Boolean)
}

const squash = (s: string) => s.replace(/\s+/g, " ").trim()
const docText = (s: string) =>
  squash(
    s
      .replace(/^\/\*\*?|\*\/$/g, "")
      .split("\n")
      .map((l) => l.replace(/^\s*\*\s?/, ""))
      .join(" ")
  )

/** Members of a `{ … }` type literal body. */
function parseMembers(body: string): PropRow[] {
  const rows: PropRow[] = []
  // Members are separated by ; , or newlines at depth 0; a line that starts with | or & continues the previous type.
  const lines: string[] = []
  let depth = 0
  let cur = ""
  for (let i = 0; i < body.length; i++) {
    const c = body[i]
    if (c === '"' || c === "'" || c === "`") {
      const j = skipString(body, i)
      cur += body.slice(i, j + 1)
      i = j
      continue
    }
    if (c === "/" && body[i + 1] === "*") {
      const j = body.indexOf("*/", i) + 2
      cur += body.slice(i, j)
      i = j - 1
      continue
    }
    if (c === "/" && body[i + 1] === "/") {
      const j = body.indexOf("\n", i)
      i = (j < 0 ? body.length : j) - 1
      continue
    }
    if (c === "=" && body[i + 1] === ">") {
      cur += "=>"
      i++
      continue
    }
    if ("{([<".includes(c)) depth++
    else if ("})]>".includes(c)) depth--
    if (depth === 0 && (c === ";" || c === "," || c === "\n")) {
      const rest = body.slice(i + 1).trimStart()
      if (c === "\n" && (rest.startsWith("|") || rest.startsWith("&") || /[|&:]\s*$/.test(cur))) {
        cur += " "
        continue
      }
      lines.push(cur)
      cur = ""
      continue
    }
    cur += c
  }
  lines.push(cur)
  let pendingDoc: string | undefined
  for (let line of lines) {
    line = line.trim()
    if (!line) continue
    const docs = line.match(/\/\*[\s\S]*?\*\//g)
    if (docs) {
      pendingDoc = docs.map(docText).join(" ")
      line = line.replace(/\/\*[\s\S]*?\*\//g, "").trim()
      if (!line) continue
    }
    const m = /^(readonly\s+)?(["\w$-]+)(\?)?\s*:\s*([\s\S]+)$/.exec(line) ?? /^(readonly\s+)?(["\w$-]+)(\?)?\s*(\([\s\S]*)$/.exec(line)
    if (m) rows.push({ name: m[2].replace(/"/g, ""), optional: !!m[3], type: squash(m[4]), doc: pendingDoc })
    pendingDoc = undefined
  }
  return rows
}

/** Find `type Name = …` or `interface Name … { … }` and return its text pieces. */
function findNamedType(src: string, name: string): { parts: string[]; extends: string[] } | null {
  const t = new RegExp(`(?:^|\\n)\\s*(?:export\\s+)?type\\s+${name}\\b[^=]*=\\s*`).exec(src)
  if (t) {
    const start = t.index + t[0].length
    // The type runs until a blank line / next top-level statement at depth 0.
    let end = start
    let depth = 0
    for (; end < src.length; end++) {
      const c = src[end]
      if (c === '"' || c === "'" || c === "`") {
        end = skipString(src, end)
        continue
      }
      if (c === "=" && src[end + 1] === ">") {
        end++
        continue
      }
      if ("{([<".includes(c)) depth++
      else if ("})]>".includes(c)) depth--
      else if (depth === 0 && c === "\n" && !/^\s*[|&]/.test(src.slice(end + 1, end + 40)) && !/[|&=]\s*$/.test(src.slice(start, end)))
        break
    }
    return { parts: splitTop(src.slice(start, end), "&"), extends: [] }
  }
  const it = new RegExp(`(?:^|\\n)\\s*(?:export\\s+)?interface\\s+${name}\\b([^{]*)\\{`).exec(src)
  if (it) {
    const open = it.index + it[0].length - 1
    const close = matchBracket(src, open)
    const ext = it[1].replace(/^\s*extends\s*/, "").trim()
    return { parts: [src.slice(open, close + 1)], extends: ext ? splitTop(ext, ",") : [] }
  }
  return null
}

function resolveType(src: string, text: string, api: ExportApi, depth = 0) {
  for (const part of splitTop(text, "&")) {
    const p = part.trim()
    if (p.startsWith("{")) {
      const close = matchBracket(p, 0)
      api.props.push(...parseMembers(p.slice(1, close)))
    } else if (/^[A-Z]\w*$/.test(p) && depth < 4) {
      const named = findNamedType(src, p)
      if (!named) api.extends.push(p)
      else {
        api.extends.push(...named.extends)
        for (const np of named.parts) resolveType(src, np, api, depth + 1)
      }
    } else api.extends.push(squash(p))
  }
}

/** Destructured parameter defaults: `{ a = 1, b: c = "x", ...props }`. */
function parseDefaults(destructure: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const entry of splitTop(destructure.slice(1, -1), ",")) {
    const m = /^([\w$]+)\s*(?::\s*[\w$]+\s*)?=\s*([\s\S]+)$/.exec(entry)
    if (m) out[m[1]] = squash(m[2])
  }
  return out
}

/** Names in `export { A, B, type C }` and `export function / const A`. */
export function exportedNames(src: string): string[] {
  const names = new Set<string>()
  for (const m of src.matchAll(/export\s*\{([^}]*)\}/g))
    for (const n of m[1].split(",")) {
      const name = n.trim()
      if (name && !name.startsWith("type ")) names.add(name.split(/\s+as\s+/).pop()!.trim())
    }
  for (const m of src.matchAll(/export\s+(?:function|const)\s+([\w$]+)/g)) names.add(m[1])
  return [...names]
}

export function exportedTypes(src: string): string[] {
  const out = new Set<string>()
  for (const m of src.matchAll(/export\s*\{([^}]*)\}/g))
    for (const n of m[1].split(",")) if (n.trim().startsWith("type ")) out.add(n.trim().slice(5).trim())
  for (const m of src.matchAll(/export\s+(?:type|interface)\s+([\w$]+)/g)) out.add(m[1])
  return [...out]
}

export function parseApi(src: string): ExportApi[] {
  return exportedNames(src).map((name) => {
    const kind: ExportApi["kind"] = /^use[A-Z]/.test(name) ? "hook" : /^[A-Z]/.test(name) && !/Variants$/.test(name) ? "component" : "other"
    const api: ExportApi = { name, kind, extends: [], props: [] }
    if (kind !== "component") return api
    const fn =
      new RegExp(`function\\s+${name}\\s*(<[^(]*>)?\\(`).exec(src) ??
      new RegExp(`const\\s+${name}\\s*=\\s*(?:React\\.)?(?:forwardRef|memo)?[^(=]*\\(\\s*(?:function\\s*\\w*\\s*)?\\(`).exec(src) ??
      new RegExp(`const\\s+${name}\\s*=\\s*\\(`).exec(src)
    if (!fn) return api
    const open = fn.index + fn[0].length - 1
    const close = matchBracket(src, open)
    if (close < 0) return api
    const params = src.slice(open + 1, close).trim()
    if (!params) return api
    const [first] = splitTop(params, ",")
    let defaults: Record<string, string> = {}
    let typeText = ""
    if (first.startsWith("{")) {
      const end = matchBracket(first, 0)
      defaults = parseDefaults(first.slice(0, end + 1))
      typeText = first.slice(end + 1).replace(/^\s*:\s*/, "")
    } else {
      typeText = first.replace(/^[\w$]+\s*:\s*/, "")
    }
    if (typeText) resolveType(src, typeText, api)
    // de-dupe (a member can appear in several intersected literals) and attach defaults
    const seen = new Map<string, PropRow>()
    for (const p of api.props) seen.set(p.name, { ...seen.get(p.name), ...p })
    api.props = [...seen.values()].map((p) => ({ ...p, def: defaults[p.name] }))
    for (const [k, v] of Object.entries(defaults))
      if (!seen.has(k)) api.props.push({ name: k, type: "", optional: true, def: v })
    return api
  })
}

/** cva(…) variant groups — `const buttonVariants = cva(base, { variants: { … }, defaultVariants: { … } })`. */
export function parseCva(src: string): CvaInfo[] {
  const out: CvaInfo[] = []
  for (const m of src.matchAll(/const\s+([\w$]+)\s*=\s*cva\(/g)) {
    const open = m.index! + m[0].length - 1
    const call = src.slice(open, matchBracket(src, open) + 1)
    const block = (key: string) => {
      const k = new RegExp(`\\b${key}\\s*:\\s*\\{`).exec(call)
      if (!k) return ""
      const o = k.index + k[0].length - 1
      return call.slice(o + 1, matchBracket(call, o))
    }
    const key = (e: string) => {
      const parts = splitTop(e, ":")
      return parts[0]?.replace(/["']/g, "").trim()
    }
    const defaults: Record<string, string> = {}
    for (const e of splitTop(block("defaultVariants"), ",\n")) {
      const [k, ...v] = e.split(":")
      if (k && v.length) defaults[k.replace(/["']/g, "").trim()] = v.join(":").replace(/["']/g, "").trim()
    }
    const groups: VariantGroup[] = []
    const vb = block("variants")
    for (const e of splitTop(vb, ",\n")) {
      const name = key(e)
      const o = e.indexOf("{")
      if (!name || o < 0) continue
      const options = splitTop(e.slice(o + 1, matchBracket(e, o)), ",\n").map(key).filter(Boolean)
      groups.push({ name, options, def: defaults[name] })
    }
    out.push({ name: m[1], groups })
  }
  return out
}

/** Header comment block(s) right after the imports — the file's own description. */
export function headerComment(src: string): string {
  const lines = src.split("\n")
  const out: string[] = []
  let started = false
  for (const l of lines) {
    const t = l.trim()
    if (t.startsWith("//")) {
      started = true
      out.push(t.replace(/^\/\/\s?/, ""))
    } else if (started) break
  }
  return out.join("\n")
}

/** Top-of-file block comment (`/* … *\/` or `/*! … *\/`) used by the CSS / JS kit files. */
export function fileBanner(src: string): string {
  const m = /^\s*\/\*!?([\s\S]*?)\*\//.exec(src)
  if (!m) return ""
  return m[1]
    .split("\n")
    .map((l) => l.replace(/^\s*\*?\s?/, "").replace(/─+/g, "").trimEnd())
    .join("\n")
    .trim()
}

/** Class + attribute hooks a CSS / JS kit file defines (e.g. .cie-tap, [data-cie-reveal]). */
export function kitHooks(src: string): { classes: string[]; attrs: string[]; vars: string[] } {
  const body = src.replace(/\/\*[\s\S]*?\*\//g, "")
  const uniq = (re: RegExp) => [...new Set([...body.matchAll(re)].map((m) => m[1]))].sort()
  return {
    classes: uniq(/\.(cie-[\w-]+)/g).filter((c) => !/^cie-[\w-]+\.(css|js)$/.test(c)),
    attrs: uniq(/\[?(data-cie-[\w-]+)/g),
    vars: uniq(/(--cie-[\w-]+)/g),
  }
}

// ── token references in a component source ──────────────────────────────────

export type TokenRef = { kind: "css" | "utility" | "motion" | "semantic"; ref: string; token: string }

const UTILITY_TOKENS: Record<string, string> = {
  "ease-cie-expo": "--cie-ease-expo",
  "ease-cie-out": "--cie-ease-out",
  "ease-cie-snap": "--cie-ease-snap",
  "rounded-page": "--cie-r-page",
  "rounded-card": "--cie-r-card",
  "rounded-media": "--cie-r-media",
  "border-stroke": "--stroke",
  "py-section": "--cie-section",
  "px-gutter": "--cie-gutter",
  "p-card": "--cie-card-pad",
  "max-w-page": "--cie-container",
  "bg-band": "--cie-surface-band",
  "bg-plate": "--cie-surface-plate",
  "border-hairline": "--cie-hairline",
  "bg-hairline": "--cie-hairline",
  "text-display": "editorial.type.display",
  "text-heading": "editorial.type.heading",
  "text-lead": "editorial.type.lead",
  "font-mono": "--cie-mono",
  "font-sans": "--cie-sans",
  "animate-cie-shimmer": "@keyframes cie-shimmer",
  "animate-cie-grain": "@keyframes cie-grain",
  "cie-ring-mask": "@utility cie-ring-mask",
}

export const SEMANTIC = [
  "background",
  "foreground",
  "card-foreground",
  "card",
  "popover-foreground",
  "popover",
  "primary-foreground",
  "primary",
  "secondary-foreground",
  "secondary",
  "muted-foreground",
  "muted",
  "accent-foreground",
  "accent",
  "destructive",
  "border",
  "input",
  "ring",
  "stroke",
]

export function tokenRefs(src: string): TokenRef[] {
  const refs = new Map<string, TokenRef>()
  const add = (r: TokenRef) => refs.set(`${r.kind}:${r.token}`, r)
  for (const m of src.matchAll(/var\((--[\w-]+)/g)) {
    const name = m[1]
    add({ kind: SEMANTIC.includes(name.slice(2)) || name === "--radius" ? "semantic" : "css", ref: `var(${name})`, token: name })
  }
  for (const [u, token] of Object.entries(UTILITY_TOKENS))
    if (new RegExp(`(^|[\\s"'\`:])${u.replace(/-/g, "\\-")}(?=[\\s"'\`/]|$)`, "m").test(src)) add({ kind: "utility", ref: u, token })
  for (const m of src.matchAll(/\b(cieTransition|cieDuration|cieEase|cieScene|cieBlur)\.(\w+)/g))
    add({ kind: "motion", ref: `${m[1]}.${m[2]}`, token: `${m[1]}.${m[2]}` })
  const sem = new RegExp(`\\b(?:bg|text|border|ring|fill|stroke|from|via|to|outline|divide|caret|decoration)-(${SEMANTIC.join("|")})(?![\\w-])`, "g")
  for (const m of src.matchAll(sem)) add({ kind: "semantic", ref: m[0], token: `--${m[1]}` })
  if (/\brounded-\[var\(--radius\)\]|\brounded-(?:md|lg|xl)\b/.test(src)) add({ kind: "semantic", ref: "--radius", token: "--radius" })
  const order = { css: 0, motion: 1, utility: 2, semantic: 3 }
  return [...refs.values()].sort((a, b) => order[a.kind] - order[b.kind] || a.token.localeCompare(b.token))
}

/** The `"<key>": { … }` entry of the demos object in preview/src/demos.tsx — the live preview's own source. */
export function demoSource(demosSrc: string, key: string): string {
  const start = demosSrc.indexOf("export const demos")
  if (start < 0) return ""
  const re = new RegExp(`\\n  (?:"${key}"|${/^[\w$]+$/.test(key) ? key : "(?!)"}):\\s*\\{`)
  const m = re.exec(demosSrc.slice(start))
  if (!m) return ""
  const open = start + m.index + m[0].length - 1
  const close = matchBracket(demosSrc, open)
  const body = demosSrc.slice(open, close + 1)
  const r = /render:\s*\(\)\s*=>\s*/.exec(body)
  if (!r) return ""
  let code = body.slice(r.index + r[0].length).replace(/,?\s*\}$/, "")
  if (code.startsWith("(")) code = code.slice(1, matchBracket(code, 0))
  // dedent
  const lines = code.replace(/^\n+|\s+$/g, "").split("\n")
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length))
  return lines.map((l) => l.slice(indent)).join("\n")
}

/** Helper components (e.g. `function ShaderModes()`) defined in demos.tsx that a demo calls. */
export function demoHelpers(demosSrc: string, code: string): string[] {
  const out: string[] = []
  for (const m of code.matchAll(/<([A-Z]\w*)/g)) {
    const name = m[1]
    const fn = new RegExp(`\\n(function ${name}\\b[^{]*\\{)`).exec(demosSrc)
    if (!fn || out.some((o) => o.startsWith(`function ${name}`))) continue
    const open = fn.index + fn[0].length - 1
    out.push(demosSrc.slice(fn.index + 1, matchBracket(demosSrc, open) + 1))
  }
  return out
}
