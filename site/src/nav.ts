import { CATEGORIES, PATTERNS, componentsIn, items, kitFiles, libraries } from "./data"

// ── Routes (hash-based so every page has a stable URL on a static host) ──────
//   #/                          overview
//   #/setup  #/pages            getting started
//   #/foundations/<id>          colour · typography · spacing · motion · interaction · editorial · theme · tokens · principles
//   #/category/<id>             a component category
//   #/components/<name>         one registry component
//   #/libraries/<name>          theme, libs and bundles
//   #/css-kit/<id>              HTML + CSS kit pattern (live demo.html section)
//   #/files/<file>              a root CSS / JS kit file
export type Route =
  | { page: "overview" }
  | { page: "setup" }
  | { page: "pages" }
  | { page: "foundation"; id: string }
  | { page: "category"; id: string }
  | { page: "component"; name: string }
  | { page: "library"; name: string }
  | { page: "pattern"; id: string }
  | { page: "file"; file: string }
  | { page: "missing"; path: string }

export const FOUNDATIONS = [
  { id: "colour", title: "Colour", ja: "色" },
  { id: "typography", title: "Typography", ja: "文字" },
  { id: "spacing", title: "Space & shape", ja: "余白と形" },
  { id: "motion", title: "Motion", ja: "動き" },
  { id: "interaction", title: "Scroll & interaction", ja: "スクロールと操作" },
  { id: "editorial", title: "Editorial mode", ja: "エディトリアル" },
  { id: "theme", title: "Semantic theme", ja: "セマンティックテーマ" },
  { id: "principles", title: "Principles", ja: "ルール" },
  { id: "tokens", title: "All tokens (tokens.css)", ja: "全トークン（tokens.css）" },
] as const

export function href(r: Route): string {
  switch (r.page) {
    case "overview":
      return "#/"
    case "setup":
      return "#/setup"
    case "pages":
      return "#/pages"
    case "foundation":
      return `#/foundations/${r.id}`
    case "category":
      return `#/category/${r.id}`
    case "component":
      return `#/components/${r.name}`
    case "library":
      return `#/libraries/${r.name}`
    case "pattern":
      return `#/css-kit/${r.id}`
    case "file":
      return `#/files/${r.file}`
    case "missing":
      return `#/${r.path}`
  }
}

const componentNames = new Set(items.filter((i) => i.type === "registry:ui").map((i) => i.name))

/** Parse a location hash. Returns null for plain in-page anchors (#section) so demos' own anchors keep working. */
export function parse(hash: string): Route | null {
  if (!hash || hash === "#" || hash === "#/") return { page: "overview" }
  if (!hash.startsWith("#/")) {
    // Old one-page catalog anchors (/#two-kinds, /#components, /#pages) and /registry-style #<component>
    const id = decodeURIComponent(hash.slice(1))
    if (componentNames.has(id)) return { page: "component", name: id }
    if (id === "pages") return { page: "pages" }
    if (id === "two-kinds" || id === "components") return { page: "overview" }
    return null
  }
  const [a, b] = hash.slice(2).split("/").map(decodeURIComponent)
  if (a === "setup") return { page: "setup" }
  if (a === "pages") return { page: "pages" }
  if (a === "foundations") return { page: "foundation", id: b || "colour" }
  if (a === "category" && b) return { page: "category", id: b }
  if (a === "components" && b) return { page: "component", name: b }
  if (a === "libraries" && b) return { page: "library", name: b }
  if (a === "css-kit" && b) return { page: "pattern", id: b }
  if (a === "files" && b) return { page: "file", file: b }
  return { page: "missing", path: hash.slice(2) }
}

// ── Sidebar tree ─────────────────────────────────────────────────────────────
export type Leaf = { label: string; ja?: string; route: Route; keywords: string; badge?: string }
export type Branch = { id: string; label: string; ja?: string; route?: Route; children: Leaf[] }
export type Group = { id: string; label: string; ja: string; children: (Leaf | Branch)[] }

export const isBranch = (n: Leaf | Branch): n is Branch => "children" in n

export const TREE: Group[] = [
  {
    id: "start",
    label: "Getting started",
    ja: "はじめに",
    children: [
      { label: "Overview", ja: "概要", route: { page: "overview" }, keywords: "quick start prompt ai two ways" },
      { label: "Setup (React)", ja: "セットアップ（React）", route: { page: "setup" }, keywords: "shadcn install theme namespace" },
      { label: "Pages & docs", ja: "見本と資料", route: { page: "pages" }, keywords: "demo editorial parallax guide design classic" },
    ],
  },
  {
    id: "foundations",
    label: "Foundations",
    ja: "基礎（トークン）",
    children: FOUNDATIONS.map((f) => ({
      label: f.title,
      ja: f.ja,
      route: { page: "foundation", id: f.id } as Route,
      keywords: `tokens ${f.id}`,
    })),
  },
  {
    id: "components",
    label: "Components",
    ja: "コンポーネント",
    children: CATEGORIES.map((c) => ({
      id: c.id,
      label: c.title,
      route: { page: "category", id: c.id } as Route,
      children: componentsIn(c.id).map((i) => ({
        label: i.title,
        route: { page: "component", name: i.name } as Route,
        keywords: `${i.name} ${i.description} ${(i as { meta?: { descriptionJa?: string } }).meta?.descriptionJa ?? ""}`,
        badge: (i as { meta?: { tech?: string } }).meta?.tech,
      })),
    })),
  },
  {
    id: "libraries",
    label: "Theme, libs & bundles",
    ja: "テーマ・ライブラリ・まとめ",
    children: libraries.map((i) => ({
      label: i.title,
      route: { page: "library", name: i.name } as Route,
      keywords: `${i.name} ${i.description}`,
    })),
  },
  {
    id: "css-kit",
    label: "HTML + CSS kit",
    ja: "HTML + CSS 版",
    children: [
      {
        id: "patterns",
        label: "Patterns",
        ja: "パターン",
        children: PATTERNS.map((p) => ({
          label: p.en,
          ja: p.ja,
          route: { page: "pattern", id: p.id } as Route,
          keywords: `${p.id} ${p.den} ${p.dja}`,
        })),
      },
      {
        id: "files",
        label: "Files",
        ja: "ファイル",
        children: kitFiles.map((f) => ({
          label: f.file,
          route: { page: "file", file: f.file } as Route,
          keywords: f.file,
        })),
      },
    ],
  },
]

/** Flat reading order — used for prev / next links and search. */
export const FLAT: { leaf: Leaf; trail: string[] }[] = TREE.flatMap((g) =>
  g.children.flatMap((n) =>
    isBranch(n)
      ? [
          ...(n.route ? [{ leaf: { label: n.label, ja: n.ja, route: n.route, keywords: n.id }, trail: [g.label] }] : []),
          ...n.children.map((leaf) => ({ leaf, trail: [g.label, n.label] })),
        ]
      : [{ leaf: n, trail: [g.label] }]
  )
)

export const sameRoute = (a: Route, b: Route) => href(a) === href(b)
