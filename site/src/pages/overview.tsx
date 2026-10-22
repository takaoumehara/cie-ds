import * as React from "react"
import { ArrowRightIcon, CheckIcon, CopyIcon } from "lucide-react"

import classicHtml from "../../../classic.html?raw"
import { Button } from "@/components/ui/button"
import { GridPattern } from "@/components/ui/grid-pattern"
import { SplitText } from "@/components/ui/split-text"
import { REGISTRIES_JSON } from "@/preview/app"
import { cn } from "@/lib/utils"
import { CATEGORIES, PAGES, PATTERNS, componentsIn, items, kitFiles, libraries } from "../data"
import { FOUNDATIONS, href } from "../nav"
import { CodeBlock, Command, Eyebrow, PageHeader, Section, T, addCmd, nsCmd, useCopy } from "../ui"

// The AI quick-start prompts are read from the original catalog so the two never drift.
const PROMPTS = (() => {
  const doc = new DOMParser().parseFromString(classicHtml, "text/html")
  const get = (l: string) => doc.querySelector(`[data-prompt][lang="${l}"]`)?.textContent ?? ""
  return { ja: get("ja"), en: get("en") }
})()

function PromptCopy() {
  const { copied, copy } = useCopy()
  const lang = () => (document.documentElement.getAttribute("data-ui") === "en" ? "en" : "ja")
  const done = copied !== null
  return (
    <Button size="lg" onClick={() => copy(PROMPTS[lang()])}>
      {done ? <CheckIcon /> : <CopyIcon />}
      {done ? <T ja="コピーしました ✓" en="Copied ✓" /> : <T ja="コピーする" en="Copy prompt" />}
    </Button>
  )
}

const uiCount = items.filter((i) => i.type === "registry:ui").length

export function Overview() {
  return (
    <div>
      <section className="relative isolate overflow-hidden pb-12">
        <GridPattern cells={5} size={48} className="-z-10 opacity-60" />
        <Eyebrow>Creativity Is Everywhere · Design System</Eyebrow>
        <SplitText as="h1" effect="mask" className="mt-4 block text-7xl leading-[0.9] font-[300] tracking-[-0.045em] sm:text-8xl">
          cie-ds
        </SplitText>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          <T
            ja={
              <>
                CIE のサイトと同じ<strong className="font-[500] text-foreground">色・文字・動き</strong>
                を、どのプロジェクトでもすぐ使えるようにした道具箱です。いちばん簡単な使い方は、
                <strong className="font-[500] text-foreground">下の文章をコピーして AI に貼るだけ</strong>。
              </>
            }
            en={
              <>
                The colours, type and motion of creativityiseverywhere.com, packaged so any project can use them. The
                fastest way in: <strong className="font-[500] text-foreground">copy the text below and paste it into your AI.</strong>
              </>
            }
          />
        </p>
      </section>

      <section className="grid gap-5 rounded-page bg-primary p-[clamp(22px,4vw,40px)] text-primary-foreground">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs tracking-[0.06em] uppercase opacity-70">
              <T ja="クイックスタート · 30秒" en="Quick start · 30 seconds" />
            </span>
            <h2 className="mt-1.5 text-[clamp(28px,4vw,44px)] leading-none font-[300] tracking-[-0.035em]">
              <T ja="これを AI にコピペ" en="Copy this into your AI" />
            </h2>
          </div>
          <div className="[&_[data-slot=button]]:bg-primary-foreground [&_[data-slot=button]]:text-primary">
            <PromptCopy />
          </div>
        </div>
        <ol lang="ja" className="list-decimal pl-5 leading-relaxed opacity-80 [&_b]:font-[500]">
                <li>
                  <b>コピーする</b> ボタンを押す
                </li>
                <li>
                  Claude Code・Cursor・ChatGPT などの AI に <b>貼り付けて送る</b>（作りたいものの説明を続けて書いてOK）
                </li>
                <li>
                  AI が cie-ds のルールを読み、
                  <b>React のプロジェクトならコンポーネントを入れ、ふつうの HTML なら CSS を読み込んで</b> 作ってくれます
                </li>
              </ol>
        <ol lang="en" className="list-decimal pl-5 leading-relaxed opacity-80 [&_b]:font-[500]">
                <li>
                  Press <b>Copy prompt</b>
                </li>
                <li>
                  <b>Paste it</b> into Claude Code, Cursor, ChatGPT… (add what you want to build after it)
                </li>
                <li>
                  The AI reads the cie-ds rules, then <b>installs the React components or links the CSS</b>, whichever
                  fits your project
                </li>
              </ol>
        <pre className="max-h-[300px] overflow-auto rounded-[var(--radius)] bg-primary-foreground p-5 font-mono text-[13px] leading-relaxed break-words whitespace-pre-wrap text-primary">
          <T ja={PROMPTS.ja} en={PROMPTS.en} />
        </pre>
      </section>

      <Section
        id="two-kinds"
        title={<T ja="使い方は2種類。中身は同じ。" en="Two ways in. Same design." />}
      >
        <p className="max-w-3xl leading-relaxed text-muted-foreground [&_strong]:font-[500] [&_strong]:text-foreground">
          <T
            ja={
              <>
                どちらも同じ設定ファイル（<code className="font-mono">tokens.json</code>
                ）から作られているので、色・文字・動きは完全に揃います。例えるなら、
                <strong>① は「スタイルシートを読み込むだけの軽い版」</strong>、
                <strong>② は「部品をプロジェクトにコピーして組み立てる版」</strong>
                です。迷ったら上の文章を AI に渡せば、AI がプロジェクトを見て選びます。
              </>
            }
            en={
              <>
                Both are generated from the same file (<code className="font-mono">tokens.json</code>), so colours, type and
                motion always match. Think of <strong>① as "just link a stylesheet — the light version"</strong> and{" "}
                <strong>② as "copy real components into your project and build with them"</strong>. Unsure? Hand the prompt
                above to your AI and it will pick from your project.
              </>
            }
          />
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <WayCard
            eyebrow="01 · HTML + CSS"
            title={<T ja="そのまま読み込む版" en="Link-in CSS kit" />}
            body={
              <T
                ja={
                  <>
                    ふつうの HTML サイトや小さなツール向け。<code className="font-mono">&lt;link&gt;</code>{" "}
                    を数行貼るだけで、色・文字・ボタンの動き・スクロール演出・効果音などが使えます。ビルド不要。
                  </>
                }
                en={
                  <>
                    For plain HTML pages and small tools. Paste a few <code className="font-mono">&lt;link&gt;</code> tags
                    and you get colours, type, button motion, scroll reveals, UI sound and more. No build step.
                  </>
                }
              />
            }
            when={{
              ja: ["HTML ファイル1枚のページや LP を作りたい", "社内ツール・小さなデモをサッと cie っぽくしたい", "Astro / WordPress など React 以外のサイト", "ビルドやインストールをしたくない"],
              en: ["A single HTML page or landing page", "Make an internal tool or quick demo look cie", "Non-React sites: Astro, WordPress…", "No build step, nothing to install"],
            }}
            code={`<link rel="stylesheet" href="https://cie-ds.vercel.app/tokens.css">`}
            links={[
              { href: href({ page: "pattern", id: PATTERNS[0].id }), ja: "CSS 版のパターン", en: "CSS kit patterns" },
              { href: "/demo", ja: "見本を見る →", en: "See the demo →" },
            ]}
          />
          <WayCard
            eyebrow="02 · React + shadcn"
            title={<T ja="部品をインストールする版" en="Installable React components" />}
            body={
              <T
                ja="React / Next.js で本格的なサイトを作るとき向け。コマンド1行で、ボタン・ダイアログから WebGL の背景・スクロール演出まで、cie 仕様の部品がプロジェクトにコピーされます。自由に書き換えOK。"
                en="For React / Next.js sites. One command copies cie-styled components into your project — from buttons and dialogs to WebGL backgrounds and scroll effects. The code is yours to edit."
              />
            }
            when={{
              ja: ["Next.js / React で本格的なサイトやアプリを作る", "WebGL の背景・スクロール演出・テキスト演出を使いたい", "ダイアログやタブなど、ちゃんと動く UI 部品が欲しい", "コードを自分のプロジェクトで自由に書き換えたい"],
              en: ["A real site or app in Next.js / React", "WebGL backgrounds, scroll and text effects", "Accessible UI parts: dialogs, tabs, sheets…", "Own the code and edit it in your project"],
            }}
            code="npx shadcn@latest add https://cie-ds.vercel.app/r/cie-all.json"
            links={[
              { href: href({ page: "setup" }), ja: "セットアップ", en: "Setup" },
              { href: "/registry/", ja: "部品を動かして見る →", en: "Play with the components →" },
            ]}
          />
        </div>
      </Section>

      <Section title={<T ja="ドキュメントの中身" en="Browse the docs" />}>
        <div className="grid gap-3 sm:grid-cols-2">
          <BrowseCard
            to={href({ page: "foundation", id: FOUNDATIONS[0].id })}
            tag="Foundations · tokens.json / tokens.css"
            title={<T ja="基礎（トークン）" en="Foundations" />}
            body={<T ja="色・文字・余白・動きのトークン。値はファイルからそのまま読み込んでいます。" en="Colour, type, spacing and motion tokens — read straight from the token files." />}
            count={FOUNDATIONS.length}
          />
          <BrowseCard
            to={href({ page: "category", id: CATEGORIES[0].id })}
            tag="React · shadcn registry"
            title={<T ja="コンポーネント" en="Components" />}
            body={<T ja="各部品のライブプレビュー・バリエーション・props・使い方・関連トークン。" en="Live preview, variants, props, usage and related tokens for every component." />}
            count={uiCount}
          />
          <BrowseCard
            to={href({ page: "library", name: libraries[0].name })}
            tag="registry:theme · registry:lib"
            title={<T ja="テーマ・ライブラリ" en="Theme, libs & bundles" />}
            body={<T ja="cie-theme・cie-motion などの共通部分と、まとめて入れるバンドル。" en="cie-theme, cie-motion and friends, plus the install-everything bundles." />}
            count={libraries.length}
          />
          <BrowseCard
            to={href({ page: "pattern", id: PATTERNS[0].id })}
            tag="HTML + CSS"
            title={<T ja="HTML + CSS 版" en="HTML + CSS kit" />}
            body={<T ja="読み込むだけで使えるパターンと、各 CSS / JS ファイルの中身。" en="Link-in patterns and what each CSS / JS file provides." />}
            count={PATTERNS.length + kitFiles.length}
          />
        </div>
        <div className="flex flex-col gap-3">
          {CATEGORIES.map((c) => (
            <div key={c.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-2 border-t border-border pt-3">
              <a href={href({ page: "category", id: c.id })} className="w-40 shrink-0 text-lg font-[300] tracking-[-0.02em] hover:underline">
                {c.title}
              </a>
              <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
                {componentsIn(c.id).map((i) => (
                  <Button key={i.name} asChild size="sm" variant="outline">
                    <a href={href({ page: "component", name: i.name })}>{i.title}</a>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title={<T ja="見本と資料" en="Examples & docs" />}>
        <PageCards />
      </Section>
    </div>
  )
}

function WayCard({
  eyebrow,
  title,
  body,
  when,
  code,
  links,
}: {
  eyebrow: string
  title: React.ReactNode
  body: React.ReactNode
  when: { ja: string[]; en: string[] }
  code: string
  links: { href: string; ja: string; en: string }[]
}) {
  return (
    <article className="flex min-w-0 flex-col gap-3 rounded-page border border-border p-7">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h3 className="text-3xl font-[300] tracking-[-0.03em]">{title}</h3>
      <p className="leading-relaxed text-muted-foreground">{body}</p>
      {(["ja", "en"] as const).map((l) => (
        <ul key={l} lang={l} className="list-disc pl-5 text-[15px] leading-loose">
          {when[l].map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      ))}
      <pre className="overflow-x-auto rounded-[var(--radius)] bg-muted p-4 font-mono text-[12.5px]">{code}</pre>
      <div className="mt-auto flex flex-wrap gap-2">
        {links.map((l) => (
          <Button key={l.href} asChild size="sm" variant="outline">
            <a href={l.href}>
              <T ja={l.ja} en={l.en} />
            </a>
          </Button>
        ))}
      </div>
    </article>
  )
}

function BrowseCard({ to, tag, title, body, count }: { to: string; tag: string; title: React.ReactNode; body: React.ReactNode; count: number }) {
  return (
    <a
      href={to}
      className="group flex flex-col gap-2 rounded-page bg-muted p-6 transition-[background-color] duration-[var(--cie-t-cell)] ease-cie-expo hover:bg-accent"
    >
      <span className="flex items-center justify-between gap-2">
        <Eyebrow>{tag}</Eyebrow>
        <span className="font-mono text-xs text-muted-foreground">{count}</span>
      </span>
      <span className="flex items-center gap-2 text-2xl font-[300] tracking-[-0.03em]">
        {title}
        <ArrowRightIcon className="size-5 transition-transform duration-[var(--cie-t-fast)] ease-cie-out group-hover:translate-x-[3px]" />
      </span>
      <span className="text-[15px] text-muted-foreground">{body}</span>
    </a>
  )
}

export function PageCards({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3", className)}>
      {PAGES.map((p) => (
        <a
          key={p.href}
          href={p.href}
          {...(p.external ? { target: "_blank", rel: "noopener" } : {})}
          className="flex flex-col gap-3 rounded-page bg-card p-7 text-card-foreground transition-transform duration-[var(--cie-t-fast)] ease-cie-out hover:-translate-y-[3px] active:scale-[0.98]"
        >
          <span className="font-mono text-[11px] tracking-[0.06em] uppercase opacity-70">{p.tag}</span>
          <span className="text-[clamp(17px,2.1vw,30px)] leading-[1.1] font-[300] tracking-[-0.03em]">
            <T ja={p.ja} en={p.en} />
          </span>
          <span className="text-[15px] leading-relaxed opacity-70">
            <T ja={p.dja} en={p.den} />
          </span>
        </a>
      ))}
    </div>
  )
}

export function Setup() {
  return (
    <div>
      <PageHeader eyebrow="Getting started · React + shadcn" title={<T ja="はじめかた" en="Setup" />}>
        <T
          ja={
            <>
              shadcn を導入済みの React / Next.js プロジェクトで使えます（Tailwind v4）。最初にテーマを1回だけ入れてください。
              <code className="font-mono">&lt;html&gt;</code> に <code className="font-mono">class="dark"</code>{" "}
              を付けると CIE の黒地、付けなければ白地（paper）になります。
            </>
          }
          en={
            <>
              Any project with shadcn initialised (Tailwind v4). Install the theme once, explicitly. Add{" "}
              <code className="font-mono">class="dark"</code> on <code className="font-mono">&lt;html&gt;</code> for the CIE
              ink ground; without it you get the paper ground.
            </>
          }
        />
      </PageHeader>
      <Section title={<T ja="全部まとめて" en="Everything at once" />}>
        <p className="text-muted-foreground">
          <T
            ja="cie-ds の部品を、コマンド1行で自分のプロジェクトに入れられます。どの部品も cie のテーマ（色・文字・動き）を使い、アニメーションは motion + Tailwind だけ。"
            en="cie-ds as installable source. Every component reads the cie theme variables — no stray hex, no competing animation libraries: motion + Tailwind."
          />
        </p>
        <Command cmd={addCmd("cie-all")} />
      </Section>
      <Section title={<T ja="01 · テーマとフォント" en="01 · Theme + fonts" />}>
        <Command cmd={addCmd("cie-theme")} />
        <p className="text-muted-foreground">
          <T
            ja="フォントは Outfit（100–900）と DM Mono（400）を Google Fonts か next/font で読み込んでください。指定はテーマに入っています。"
            en="Load Outfit 100–900 and DM Mono 400 (Google Fonts or next/font). Stacks are already in --font-sans / --font-mono."
          />
        </p>
      </Section>
      <Section title={<T ja="02 · 短い名前で入れる（任意）" en="02 · Optional namespace" />}>
        <p className="text-muted-foreground">
          <T
            ja={
              <>
                <code className="font-mono">components.json</code> に次を足すと、
                <code className="font-mono">@cie/部品名</code> で入れられます:
              </>
            }
            en={
              <>
                Add to <code className="font-mono">components.json</code>, then use{" "}
                <code className="font-mono">@cie/&lt;name&gt;</code>:
              </>
            }
          />
        </p>
        <CodeBlock code={REGISTRIES_JSON} title="components.json" />
        <Command cmd={nsCmd("shader-field")} />
      </Section>
    </div>
  )
}

export function PagesPage() {
  return (
    <div>
      <PageHeader eyebrow={<T ja="ページ" en="Pages" />} title={<T ja="見本と資料" en="Examples & docs" />}>
        <T
          ja="単体で動く見本ページと、AI・人向けの資料。URL は以前と同じです。"
          en="Stand-alone example pages and the reference docs for people and AI. URLs are unchanged."
        />
      </PageHeader>
      <PageCards />
      <Section title={<T ja="生ファイル" en="Raw files" />}>
        <p className="text-muted-foreground">
          <T ja="どこからでも直接読み込めます（CORS 許可済み）。" en="Linkable from anywhere (CORS-enabled)." />
        </p>
        <div className="flex flex-wrap gap-1.5">
          {[...kitFiles.map((f) => f.file), "tokens.json", "r/registry.json"].map((f) => (
            <Button key={f} asChild size="sm" variant="outline" className="font-mono">
              <a href={`/${f}`}>/{f}</a>
            </Button>
          ))}
        </div>
      </Section>
    </div>
  )
}
