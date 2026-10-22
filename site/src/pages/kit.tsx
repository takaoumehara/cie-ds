import * as React from "react"
import { ExternalLinkIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PATTERNS, kitFile } from "../data"
import { href } from "../nav"
import { fileBanner, kitHooks } from "../parse"
import { CodeBlock, Eyebrow, PageHeader, Section, T } from "../ui"
import { Missing } from "./component"
import { ORIGIN } from "../ui"

const tagFor = (file: string) =>
  file.endsWith(".js")
    ? `<script src="${ORIGIN}/${file}" defer></script>`
    : `<link rel="stylesheet" href="${ORIGIN}/${file}">`

// The include block from the AI prompt in the original catalog (option B).
const INCLUDE = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400&family=Outfit:wght@100..900&display=swap">
<link rel="stylesheet" href="https://cie-ds.vercel.app/tokens.css">
<link rel="stylesheet" href="https://cie-ds.vercel.app/base.css">
<link rel="stylesheet" href="https://cie-ds.vercel.app/motion.css">
<link rel="stylesheet" href="https://cie-ds.vercel.app/scroll.css">
<link rel="stylesheet" href="https://cie-ds.vercel.app/interactions.css">
<script src="https://cie-ds.vercel.app/interaction.js" defer></script>`

export function PatternPage({ id }: { id: string }) {
  const p = PATTERNS.find((x) => x.id === id)
  if (!p) return <Missing what={id} />
  const src = `/${p.href.replace(/\.html/, "")}`
  return (
    <div>
      <PageHeader eyebrow="HTML + CSS kit · pattern" title={<T ja={p.ja} en={p.en} />}>
        <T ja={p.dja} en={p.den} />
      </PageHeader>
      <Section
        title={<T ja="ライブプレビュー" en="Live preview" />}
        aside={
          <Button asChild size="sm" variant="outline">
            <a href={src} target="_blank" rel="noopener">
              {src} <ExternalLinkIcon />
            </a>
          </Button>
        }
      >
        <iframe
          title={`${p.en} — ${p.href}`}
          src={src}
          loading="lazy"
          className="h-[min(640px,75svh)] w-full rounded-page border border-border bg-[var(--cie-ink,#0b0b0b)]"
        />
        <p className="font-mono text-xs text-muted-foreground uppercase">
          <T ja="見本ページ（demo.html / parallax.html）をそのまま埋め込んでいます。" en="The stand-alone example page, embedded as-is." />
        </p>
      </Section>
      <Section title={<T ja="読み込み" en="Include" />}>
        <p className="text-muted-foreground">
          <T
            ja={<>&lt;head&gt; に貼るだけ。クラス名と属性は <a className="underline" href="/guide.md">guide.md</a> に。</>}
            en={<>Paste into &lt;head&gt;. Class names and attribute hooks are in <a className="underline" href="/guide.md">guide.md</a>.</>}
          />
        </p>
        <CodeBlock code={INCLUDE} title="html" />
      </Section>
    </div>
  )
}

export function FilePage({ file }: { file: string }) {
  const f = kitFile(file)
  const [src, setSrc] = React.useState("")
  React.useEffect(() => {
    f?.load().then(setSrc)
  }, [f])
  if (!f) return <Missing what={file} />
  const banner = fileBanner(src)
  const hooks = kitHooks(src)
  const chips = (list: string[]) => (
    <div className="flex flex-wrap gap-1.5">
      {list.map((c) => (
        <code key={c} className="rounded-full bg-muted px-2.5 py-0.5 font-mono text-[12.5px]">
          {c}
        </code>
      ))}
    </div>
  )
  return (
    <div>
      <PageHeader eyebrow={`HTML + CSS kit · ${file.endsWith(".js") ? "script" : "stylesheet"}`} title={file}>
        <span className="font-mono text-sm">{src ? `${src.split("\n").length} lines` : "…"}</span>
      </PageHeader>
      {banner && (
        <Section title={<T ja="ファイルの説明（英語）" en="About this file" />}>
          <pre className="overflow-x-auto font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-muted-foreground">{banner}</pre>
        </Section>
      )}
      <Section
        title={<T ja="読み込み" en="Include" />}
        aside={
          <Button asChild size="sm" variant="outline" className="font-mono">
            <a href={`/${file}`}>/{file}</a>
          </Button>
        }
      >
        <CodeBlock code={tagFor(file)} title="html" />
      </Section>
      {(hooks.classes.length > 0 || hooks.attrs.length > 0) && (
        <Section title={<T ja="クラスと属性" en="Classes & hooks" />}>
          {hooks.classes.length > 0 && (
            <div className="flex flex-col gap-2">
              <Eyebrow>classes · {hooks.classes.length}</Eyebrow>
              {chips(hooks.classes.map((c) => `.${c}`))}
            </div>
          )}
          {hooks.attrs.length > 0 && (
            <div className="flex flex-col gap-2">
              <Eyebrow>attributes · {hooks.attrs.length}</Eyebrow>
              {chips(hooks.attrs.map((a) => `[${a}]`))}
            </div>
          )}
        </Section>
      )}
      {hooks.vars.length > 0 && (
        <Section title={<T ja="使っているトークン" en="Tokens used" />}>
          {chips(hooks.vars)}
          <a className="font-mono text-xs text-muted-foreground uppercase hover:text-foreground" href={href({ page: "foundation", id: "tokens" })}>
            <T ja="全トークン →" en="All tokens →" />
          </a>
        </Section>
      )}
      <Section title={<T ja="ソース" en="Source" />}>
        <CodeBlock code={src} title={file} />
      </Section>
    </div>
  )
}
