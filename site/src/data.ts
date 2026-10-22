// Everything the docs list comes from files that already exist in the repo:
// registry.json (React items), preview/src (categories + live demos), classic.html (CSS kit index + pages),
// and the root CSS / JS kit files. Nothing here is a new component.
import registry from "../../registry.json"
import { CATEGORIES } from "@/preview/app"
import { demos } from "@/preview/demos"

export type Item = (typeof registry.items)[number] & {
  meta?: { tech?: string; descriptionJa?: string }
  dependencies?: string[]
  registryDependencies?: string[]
  files?: { path: string; type: string }[]
}
export const items = registry.items as Item[]
export const itemByName = new Map(items.map((i) => [i.name, i]))
export { CATEGORIES, demos }

/** Components shown in the docs: every registry:ui item that has a live demo, grouped like /registry. */
export const componentsIn = (cat: string) =>
  items.filter((i) => i.type === "registry:ui" && i.categories?.includes(cat) && demos[i.name])

/** Theme, libs and bundles (cie-theme, cie-motion, cie-color, cie-gsap, cie-all, cie-scroll-pro). */
export const libraries = items.filter((i) => i.type !== "registry:ui")

// ── HTML + CSS kit — the pattern index from the original catalog (classic.html), verbatim ──
export type Pattern = { id: string; href: string; ja: string; en: string; dja: string; den: string }
export const PATTERNS: Pattern[] = [
  { id: "colour", href: "demo.html#colour", ja: "色", en: "Colour", dja: "ink / paper の2色とミュート色", den: "Ink / paper and their mutes" },
  { id: "type", href: "demo.html#type", ja: "文字", en: "Type", dja: "Outfit・DM Mono・日本語の組み方", den: "Outfit, DM Mono, Japanese setting" },
  { id: "motion", href: "demo.html#motion", ja: "マイクロインタラクション", en: "Micro-interactions", dja: "タップ・浮く・反転・矢印など", den: "Tap, lift, invert, arrow…" },
  { id: "loader", href: "demo.html#loader", ja: "ローダー", en: "Loader", dja: "2色のシュパシュパ読み込み表示", den: "Two-ink snappy loader" },
  { id: "hamburger", href: "demo.html#hamburger", ja: "ハンバーガーメニュー", en: "Hamburger nav", dja: "≡ が × に変わってパネルが出る", den: "≡ morphs to × with a sliding panel" },
  { id: "text-load", href: "demo.html#text-load", ja: "文字の読み込み演出", en: "Text loading", dja: "静かに文字が現れる5種", den: "Five quiet text entrances" },
  { id: "expand", href: "demo.html#expand", ja: "展開（にゅるっと）", en: "Expand", dja: "ブロックがページに広がる", den: "Block morphs into a page" },
  { id: "sheet", href: "demo.html#sheet", ja: "シート / モーダル", en: "Sheet / modal", dja: "下から出るパネル・中央のダイアログ", den: "Bottom sheet and centred modal" },
  { id: "scroll", href: "demo.html#scroll", ja: "スクロール表示", en: "Scroll reveal", dja: "スクロールで要素が現れる", den: "Elements appear as you scroll" },
  { id: "parallax", href: "demo.html#parallax", ja: "パララックス", en: "Parallax", dja: "奥行きのあるスクロール", den: "Depth on scroll" },
  { id: "theme-morph", href: "parallax.html", ja: "テーマモーフ", en: "Theme morph", dja: "スクロールで黒→白に色が変わる", den: "Ink → paper as you scroll" },
  { id: "cycle", href: "demo.html#cycle", ja: "クリックで切り替え", en: "Click-to-cycle", dja: "押すたびに表示が変わる", den: "Each click advances the label" },
  { id: "sound", href: "demo.html#sound", ja: "効果音", en: "Section sound", dja: "セクションごとに ON にできる UI 音", den: "Opt-in UI sound per section" },
  { id: "organic", href: "demo.html#organic", ja: "ゆっくりした動き", en: "Organic motion", dja: "背景向けの漂う・呼吸する動き", den: "Drift, breath, float for backgrounds" },
  { id: "scrollbar", href: "demo.html#scrollbar", ja: "スクロールバー", en: "Scrollbar", dja: "細くて上品なスクロールバー", den: "Thin, quiet scrollbar" },
]

// ── Root CSS / JS kit files (served verbatim at /<file>) ──
const raw = import.meta.glob("../../*.{css,js}", { query: "?raw", import: "default" }) as Record<
  string,
  () => Promise<string>
>
export const kitFiles = Object.entries(raw)
  .map(([p, load]) => ({ file: p.replace(/^.*\//, ""), load }))
  .sort((a, b) => a.file.localeCompare(b.file))
export const kitFile = (f: string) => kitFiles.find((k) => k.file === f)

// ── Pages / docs cards from the original catalog (classic.html → "Examples & docs") ──
export type PageCard = { href: string; tag: string; ja: string; en: string; dja: string; den: string; external?: boolean }
export const PAGES: PageCard[] = [
  { href: "/registry/", tag: "React · shadcn registry", ja: "React 部品の見本", en: "React components", dja: "部品を実際に動かせます。それぞれのインストール用コマンド付き。", den: "Every component, live, each with its install command." },
  { href: "/demo", tag: "HTML + CSS", ja: "CSS 版の見本", en: "CSS kit demo", dja: "色・文字・動き・スクロール・効果音など、全パターン。", den: "Every pattern: tokens, motion, expand, sheets, scroll, sound." },
  { href: "/parallax", tag: "Scroll-linked", ja: "パララックス + テーマモーフ", en: "Parallax + Theme Morph", dja: "長いスクロールで黒 → グレー → 白へ。", den: "A long scroll from ink → grey → paper." },
  { href: "/editorial", tag: "Editorial mode", ja: "エディトリアル", en: "Editorial", dja: "紙の地・細い罫線・ゆったりした間で、読むためのページを組むモード。", den: "Paper ground, hairlines and generous rhythm for reading pages." },
  { href: "/guide.md", tag: "Documentation", ja: "使い方ガイド", en: "Usage guide", dja: "読み込み方・クラス名・API の詳細（英語）。", den: "Includes, class names, attribute hooks, JS API." },
  { href: "/DESIGN.md", tag: "Reference · for AI", ja: "デザインの決まりごと", en: "Design brief", dja: "AI が読むためのルール集。色・動きの数値、やっていいこと・ダメなこと。", den: "The agent-readable rules: values, motion, do / don't." },
  { href: "/classic.html", tag: "Original catalog", ja: "以前のカタログ", en: "Classic catalog", dja: "1ページにまとめた元のカタログ（そのまま残しています）。", den: "The original one-page catalog, kept as it was." },
  { href: "https://github.com/takaoumehara/cie-ds", tag: "Repository", ja: "GitHub", en: "GitHub", dja: "ソースコード。閲覧OK、再配布・商用利用は不可。", den: "Source. View OK; no redistribution or commercial reuse.", external: true },
]
