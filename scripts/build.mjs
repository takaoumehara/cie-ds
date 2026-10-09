#!/usr/bin/env node
// Full site build for Vercel → dist/
//   dist/            the original no-build catalog (html/css/js/md copied verbatim, URLs unchanged)
//   dist/r/*.json    shadcn registry items  (npx shadcn add https://cie-ds.vercel.app/r/<name>.json)
//   dist/registry/   React preview of every registry item
import { execSync } from "node:child_process"
import { cpSync, readdirSync, rmSync, statSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const dist = join(root, "dist")
const run = (cmd) => execSync(cmd, { cwd: root, stdio: "inherit" })

rmSync(dist, { recursive: true, force: true })
run("node scripts/sync-tokens.mjs")
run("node scripts/check-tokens.mjs")
run("npx shadcn build -o dist/r")
run("npx vite build")

const STATIC = /\.(html|css|js|json|md)$|^(LICENSE|NOTICE)$/
const SKIP = new Set([
  "README.md",
  "vercel.json",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "registry.json",
  "vite.config.ts",
  "components.json",
])
for (const f of readdirSync(root)) {
  const p = join(root, f)
  if (statSync(p).isFile() && STATIC.test(f) && !SKIP.has(f)) cpSync(p, join(dist, f))
}
console.log("✓ dist ready")
