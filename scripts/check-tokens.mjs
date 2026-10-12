#!/usr/bin/env node
// Guard: registry components must speak cie tokens only. Fails on raw colour values
// (hex, rgb/hsl/oklch literals) and Tailwind palette colours (bg-slate-900, text-white…).
// Allowed: semantic utilities (bg-background, text-foreground, border-border, …), var(--token),
// currentColor, transparent. The theme / generated files are exempt.
//
// Libraries: any animation / interaction library is welcome if the result fits cie (see DESIGN.md →
// "Motion libraries"). What the guard protects is install cost: every npm import in a registry file must be
// declared in that item's `dependencies`, and `cie-all` may only pull in the lightweight core set.
import { readdirSync, readFileSync } from "node:fs"
import { dirname, join, relative } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const dirs = ["registry/cie/ui", "registry/cie/lib"]
const exempt = new Set(["registry/cie/lib/cie-motion.ts"])
const palette =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose"
const rules = [
  [/#[0-9a-fA-F]{3,8}\b/, "hex colour"],
  [/\b(rgba?|hsla?|oklch|oklab|lab|lch)\(\s*\d/, "colour literal"],
  [new RegExp(`\\b(bg|text|border|ring|fill|stroke|from|via|to|outline|shadow|decoration|accent|caret)-(${palette})-\\d{2,3}\\b`), "Tailwind palette colour"],
  [/\b(bg|text|border|ring|fill|stroke|from|via|to)-(white|black)\b/, "Tailwind white/black"],
  [/\b(shadow-(sm|md|lg|xl|2xl))\b/, "drop shadow (cie: none)"],
  [/from ["'](framer-motion|react-transition-group)["']/, "duplicate of motion (framer-motion is motion's old name; use AnimatePresence)"],
]

let fails = 0
for (const d of dirs) {
  for (const f of readdirSync(join(root, d))) {
    const p = `${d}/${f}`
    if (exempt.has(p)) continue
    readFileSync(join(root, p), "utf8")
      .split("\n")
      .forEach((line, i) => {
        if (/^\s*(\/\/|\*)/.test(line)) return
        for (const [re, why] of rules)
          if (re.test(line)) {
            fails++
            console.error(`${relative(root, join(root, p))}:${i + 1}  ${why}: ${line.trim().slice(0, 100)}`)
          }
      })
  }
}

// ── dependencies: declared, and kept out of cie-all unless core ─────────────
const registry = JSON.parse(readFileSync(join(root, "registry.json"), "utf8"))
const items = new Map(registry.items.map((i) => [i.name, i]))
const implicit = new Set(["react", "react-dom"]) // peers every shadcn project already has
const pkgName = (spec) => (spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0])
const importRe = /^\s*(?:import|export)\s[^;"']*?\sfrom\s*["']([^"']+)["']|^\s*import\s*["']([^"']+)["']/gm
const registered = new Set(["registry/cie/lib/utils.ts"]) // shadcn's own `utils` item
for (const item of registry.items) {
  const declared = new Set(item.dependencies ?? [])
  for (const { path } of item.files ?? []) {
    registered.add(path)
    const reported = new Set()
    for (const [, a, b] of readFileSync(join(root, path), "utf8").matchAll(importRe)) {
      const spec = a ?? b
      if (spec.startsWith(".") || spec.startsWith("@/")) continue
      const pkg = pkgName(spec)
      if (implicit.has(pkg) || declared.has(pkg) || reported.has(pkg)) continue
      reported.add(pkg)
      fails++
      console.error(`${path}  imports "${pkg}" but registry.json → ${item.name}.dependencies does not declare it`)
    }
  }
}
for (const d of dirs)
  for (const f of readdirSync(join(root, d)))
    if (!registered.has(`${d}/${f}`)) {
      fails++
      console.error(`${d}/${f}  is not listed in any registry.json item`)
    }

// cie-all stays light: only the core set. Heavier libraries (gsap, …) live in opt-in bundles like cie-scroll-pro.
const core = new Set(["motion", "radix-ui", "class-variance-authority", "lucide-react", "clsx", "tailwind-merge"])
const itemName = (dep) => dep.replace(/^.*\//, "").replace(/\.json$/, "")
const seen = new Set()
const walk = (name) => {
  if (seen.has(name)) return
  seen.add(name)
  const item = items.get(name)
  if (!item) return
  for (const pkg of item.dependencies ?? [])
    if (!core.has(pkg)) {
      fails++
      console.error(`cie-all → ${name} pulls in "${pkg}" (not core). Move it to an opt-in bundle such as cie-scroll-pro.`)
    }
  for (const dep of item.registryDependencies ?? []) walk(itemName(dep))
}
walk("cie-all")

if (fails) {
  console.error(`\n✗ ${fails} violation(s). Use semantic tokens (bg-background, var(--border)…) and declare every dependency.`)
  process.exit(1)
}
console.log("✓ registry uses cie tokens only · dependencies declared · cie-all is core-only")
