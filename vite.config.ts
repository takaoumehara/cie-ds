import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url))

// Registry preview app → served at /registry on cie-ds.vercel.app.
// Components are imported straight from registry/cie (the same files `shadcn build` ships),
// via the aliases a consumer project would have.
export default defineConfig({
  root: r("./preview"),
  base: "/registry/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: "@/components/ui", replacement: r("./registry/cie/ui") },
      { find: "@/lib", replacement: r("./registry/cie/lib") },
      { find: "@/preview", replacement: r("./preview/src") },
    ],
  },
  build: { outDir: r("./dist/registry"), emptyOutDir: true, chunkSizeWarningLimit: 800 },
  server: { fs: { allow: [r(".")] } },
})
