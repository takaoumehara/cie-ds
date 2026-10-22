import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url))

// Docs shell → served at / on cie-ds.vercel.app (hash routes: /#/components/button, /#/foundations/motion …).
// Renders the same registry/cie components and preview demos the /registry app uses; reads tokens.json /
// tokens.css and the root CSS kit files as raw text so the docs never drift from the source.
export default defineConfig({
  root: r("./site"),
  base: "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: "@/components/ui", replacement: r("./registry/cie/ui") },
      { find: "@/lib", replacement: r("./registry/cie/lib") },
      { find: "@/preview", replacement: r("./preview/src") },
      { find: "@/site", replacement: r("./site/src") },
    ],
  },
  // dist/ already holds r/ and registry/ from earlier build steps — don't wipe them.
  build: { outDir: r("./dist"), emptyOutDir: false, assetsDir: "docs-assets", chunkSizeWarningLimit: 1200 },
  server: { fs: { allow: [r(".")] } },
})
