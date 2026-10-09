#!/usr/bin/env node
// Guard: registry components must speak cie tokens only. Fails on raw colour values
// (hex, rgb/hsl/oklch literals) and Tailwind palette colours (bg-slate-900, text-white…).
// Allowed: semantic utilities (bg-background, text-foreground, border-border, …), var(--token),
// currentColor, transparent. The theme / generated files are exempt.
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
  [/from ["'](framer-motion|react-spring|@react-spring\/[\w-]+|gsap|animejs|react-transition-group)["']/, "competing animation library (use motion/react)"],
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
if (fails) {
  console.error(`\n✗ ${fails} token violation(s). Use semantic tokens (bg-background, text-foreground, var(--border)…).`)
  process.exit(1)
}
console.log("✓ registry uses cie tokens only")
