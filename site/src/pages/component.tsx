import * as React from "react"
import { ArrowRightIcon, ExternalLinkIcon, RotateCcwIcon } from "lucide-react"

import demosSrc from "@/preview/demos.tsx?raw"
import { RENDERERS } from "@/preview/app"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CATEGORIES, componentsIn, demos, itemByName, type Item } from "../data"
import { href } from "../nav"
import { demoHelpers, demoSource, exportedNames, exportedTypes, headerComment, parseApi, parseCva, tokenRefs, type TokenRef } from "../parse"
import { describeMotion, lookupVar, tokens } from "../tokens"
import { CodeBlock, Command, Eyebrow, PageHeader, Section, T, Table, addCmd, nsCmd } from "../ui"

const sources = import.meta.glob("../../../registry/cie/{ui,lib}/*.{ts,tsx}", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>

function useSource(path?: string) {
  const [code, setCode] = React.useState("")
  React.useEffect(() => {
    if (!path) return
    const key = Object.keys(sources).find((k) => k.endsWith(path.replace(/^registry\/cie/, "")))
    if (key) sources[key]().then(setCode)
  }, [path])
  return code
}

const categoryOf = (i: Item) => CATEGORIES.find((c) => i.categories?.includes(c.id))
const desc = (i: Item) => <T ja={i.meta?.descriptionJa ?? i.description} en={i.description} />

// ── Playground: components whose source declares cva variants get live variant controls ──
const PLAYGROUNDS: Record<string, (v: Record<string, string>, label: string) => React.ReactNode> = {
  button: (v, label) => (
    <Button variant={v.variant as never} size={v.size as never} aria-label={v.size?.startsWith("icon") ? label : undefined}>
      {v.size?.startsWith("icon") ? <ArrowRightIcon /> : label}
    </Button>
  ),
  badge: (v, label) => <Badge variant={v.variant as never}>{label}</Badge>,
}

function Playground({ name, src }: { name: string; src: string }) {
  const cva = parseCva(src)[0]
  const groups = cva?.groups ?? []
  const [values, setValues] = React.useState<Record<string, string>>({})
  const [label, setLabel] = React.useState(name === "badge" ? "New" : "Start a project")
  React.useEffect(() => {
    setValues(Object.fromEntries(groups.map((g) => [g.name, g.def ?? g.options[0]])))
  }, [src]) // eslint-disable-line react-hooks/exhaustive-deps
  const render = PLAYGROUNDS[name]
  if (!cva || !render || !Object.keys(values).length) return null
  const jsxProps = Object.entries(values)
    .filter(([k, v]) => groups.find((g) => g.name === k)?.def !== v)
    .map(([k, v]) => ` ${k}="${v}"`)
    .join("")
  const tag = name === "badge" ? "Badge" : "Button"
  const snippet = values.size?.startsWith("icon")
    ? `<${tag}${jsxProps} aria-label="${label}">\n  <ArrowRightIcon />\n</${tag}>`
    : `<${tag}${jsxProps}>${label}</${tag}>`
  return (
    <Section id="playground" title={<T ja="バリエーション（操作できます）" en="Variants & controls" />}>
      <p className="text-muted-foreground">
        <T
          ja={<>ソースの <code className="font-mono">{cva.name}</code>（cva）から読み取った選択肢です。</>}
          en={<>Options read from <code className="font-mono">{cva.name}</code> (cva) in the source.</>}
        />
      </p>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="flex min-h-48 items-center justify-center rounded-page border border-border p-8">{render(values, label)}</div>
        <div className="flex flex-col gap-4">
          {groups.map((g) => (
            <fieldset key={g.name} className="flex flex-col gap-2">
              <legend className="mb-2 font-mono text-xs text-muted-foreground uppercase">{g.name}</legend>
              <div className="flex flex-wrap gap-1.5">
                {g.options.map((o) => (
                  <Button
                    key={o}
                    size="sm"
                    variant={values[g.name] === o ? "default" : "outline"}
                    aria-pressed={values[g.name] === o}
                    onClick={() => setValues((v) => ({ ...v, [g.name]: o }))}
                    className="font-mono"
                  >
                    {o}
                  </Button>
                ))}
              </div>
            </fieldset>
          ))}
          <label className="flex flex-col gap-2">
            <span className="font-mono text-xs text-muted-foreground uppercase">label</span>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="h-9 rounded-full border border-input bg-transparent px-4 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </label>
        </div>
      </div>
      <CodeBlock code={snippet} title="jsx" />
      <Table
        head={["Prop", "Options", "Default"]}
        minWidth="28rem"
        rows={groups.map((g) => [
          <code>{g.name}</code>,
          <span className="font-mono text-[13px] text-muted-foreground">{g.options.map((o) => `"${o}"`).join(" | ")}</span>,
          <code>{g.def ? `"${g.def}"` : "—"}</code>,
        ])}
      />
    </Section>
  )
}

function Preview({ name }: { name: string }) {
  const demo = demos[name]
  const [run, setRun] = React.useState(0)
  if (!demo) return null
  const layout = demo.layout ?? "plain"
  return (
    <Section
      id="preview"
      title={<T ja="プレビュー" en="Preview" />}
      aside={
        <div className="flex flex-wrap items-center gap-1.5">
          {demo.replay && (
            <Button size="sm" variant="outline" onClick={() => setRun((n) => n + 1)}>
              <RotateCcwIcon /> Replay
            </Button>
          )}
        </div>
      }
    >
      <div
          className={cn(
            "relative overflow-clip rounded-page border border-border",
            layout === "stage" && "h-80 sm:h-96",
            layout === "plain" && "flex min-h-64 items-center justify-center p-6 sm:p-10",
            layout === "flush" && "border-0"
          )}
        >
          <React.Fragment key={run}>{demo.render()}</React.Fragment>
      </div>
      {demo.note && <p className="font-mono text-xs text-muted-foreground uppercase">{demo.note}</p>}
    </Section>
  )
}

function tokenValue(r: TokenRef): React.ReactNode {
  if (r.kind === "motion") return <code className="text-muted-foreground">{describeMotion(r.token) || "—"}</code>
  if (r.token.startsWith("--")) {
    const v = lookupVar(r.token)
    if (v.dark)
      return (
        <span className="flex flex-col gap-0.5 font-mono text-[13px] text-muted-foreground">
          <span>
            <Swatch value={v.dark} /> ink: {v.dark}
          </span>
          <span>
            <Swatch value={v.light!} /> paper: {v.light}
          </span>
        </span>
      )
    if (v.value) return <code className="text-muted-foreground">{v.value}</code>
    return <span className="text-muted-foreground">—</span>
  }
  if (r.token.startsWith("editorial.type.")) {
    const t = tokens.editorial.type[r.token.split(".")[2] as "display" | "heading" | "lead"]
    return <code className="text-muted-foreground">{`${t.size} · ${t.weight} · ${t.leading} · ${t.tracking}`}</code>
  }
  return <span className="text-muted-foreground">cie-theme.css</span>
}

function Swatch({ value }: { value: string }) {
  if (!/^(#|rgba?\()/.test(value)) return null
  return <span aria-hidden className="inline-block size-3 rounded-full border border-border align-[-1px]" style={{ background: value }} />
}

function RelatedTokens({ src }: { src: string }) {
  const refs = tokenRefs(src)
  if (!refs.length) return null
  const foundationFor = (r: TokenRef) =>
    r.kind === "motion" || /--cie-(t|ease|blur|whip)/.test(r.token)
      ? "motion"
      : r.kind === "semantic"
        ? "theme"
        : /--cie-(r|section|gutter|container|card-pad|gap|measure|edge)/.test(r.token)
          ? "spacing"
          : /--cie-(sans|mono)|text-/.test(r.token + r.ref)
            ? "typography"
            : /--cie-(press|hover|parallax|reveal)/.test(r.token)
              ? "interaction"
              : /surface|hairline/.test(r.token)
                ? "editorial"
                : "tokens"
  return (
    <Section id="tokens" title={<T ja="関連トークン" en="Related tokens" />}>
      <p className="text-muted-foreground">
        <T ja="このコンポーネントのソースが参照しているトークン（自動抽出）。" en="Tokens this component's source references (extracted automatically)." />
      </p>
      <Table
        head={["In source", "Token", "Value", ""]}
        rows={refs.map((r) => [
          <code>{r.ref}</code>,
          <code>{r.token}</code>,
          tokenValue(r),
          <a className="font-mono text-xs text-muted-foreground uppercase hover:text-foreground" href={href({ page: "foundation", id: foundationFor(r) })}>
            {foundationFor(r)} →
          </a>,
        ])}
      />
    </Section>
  )
}

function ApiTables({ src }: { src: string }) {
  const api = parseApi(src).filter((a) => a.kind === "component")
  if (!api.length) return null
  return (
    <Section id="props" title={<T ja="Props（API）" en="Props" />}>
      <p className="text-muted-foreground">
        <T
          ja="エクスポートされた各コンポーネントの props（ソースの型定義とデフォルト値から抽出）。"
          en="Props of each exported component, read from the source's type definitions and destructured defaults."
        />
      </p>
      {api.map((a) => (
        <div key={a.name} className="flex flex-col gap-2">
          <h3 className="font-mono text-base">&lt;{a.name}&gt;</h3>
          {a.extends.length > 0 && (
            <p className="text-sm text-muted-foreground">
              <T ja="継承:" en="Extends:" />{" "}
              {a.extends.map((e) => (
                <code key={e} className="mr-2 rounded-full bg-muted px-2 py-0.5 font-mono text-[12px] break-all">
                  {e}
                </code>
              ))}
            </p>
          )}
          {a.props.length > 0 ? (
            <Table
              head={["Prop", "Type", "Default", "Description"]}
              rows={a.props.map((p) => [
                <code>
                  {p.name}
                  {p.optional ? "?" : ""}
                </code>,
                <code className="break-words text-muted-foreground">{p.type || "—"}</code>,
                <code>{p.def ?? "—"}</code>,
                <span className="text-muted-foreground">{p.doc ?? ""}</span>,
              ])}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              <T ja="追加の props はありません（継承元の props をそのまま受け取ります）。" en="No extra props — passes the extended props through." />
            </p>
          )}
        </div>
      ))}
    </Section>
  )
}

function Usage({ item, src }: { item: Item; src: string }) {
  const names = exportedNames(src).filter((n) => /^[A-Z]|^use|^[a-z]\w*Variants$|^toast$/.test(n))
  const types = exportedTypes(src)
  const file = item.files?.[0]?.path.replace(/^registry\/cie\/ui\//, "").replace(/\.tsx?$/, "")
  const importLine = `import { ${names.join(", ")} } from "@/components/ui/${file}"`
  const code = demoSource(demosSrc, item.name)
  const helpers = code ? demoHelpers(demosSrc, code) : []
  const note = headerComment(src)
  return (
    <Section id="usage" title={<T ja="使い方" en="Usage" />}>
      <div className="flex flex-col gap-2">
        <Eyebrow>
          <T ja="インストール" en="Install" />
        </Eyebrow>
        <Command cmd={addCmd(item.name)} />
        <Command cmd={nsCmd(item.name)} />
      </div>
      {note && (
        <div className="flex flex-col gap-2">
          <Eyebrow>
            <T ja="ソースのメモ（英語）" en="Notes from the source" />
          </Eyebrow>
          <p className="max-w-3xl border-l-2 border-border pl-4 text-[15px] leading-relaxed whitespace-pre-line text-muted-foreground">{note}</p>
        </div>
      )}
      <CodeBlock code={importLine + (types.length ? `\nimport type { ${types.join(", ")} } from "@/components/ui/${file}"` : "")} title="import" />
      {code && <CodeBlock code={[...helpers, code].join("\n\n")} title={<T ja="プレビューのコード" en="Preview source" />} />}
    </Section>
  )
}

function Dependencies({ item }: { item: Item }) {
  const deps = item.dependencies ?? []
  const reg = (item.registryDependencies ?? []).map((d) => d.replace(/^.*\/r\//, "").replace(/\.json$/, ""))
  if (!deps.length && !reg.length) return null
  return (
    <Section id="dependencies" title={<T ja="依存関係" en="Dependencies" />}>
      <Table
        head={["Kind", "Packages / items"]}
        minWidth="24rem"
        rows={[
          ...(deps.length ? [[<span>npm</span>, <span className="flex flex-wrap gap-1.5">{deps.map((d) => <code key={d} className="rounded-full bg-muted px-2 py-0.5">{d}</code>)}</span>]] : []),
          ...(reg.length
            ? [
                [
                  <span>registry</span>,
                  <span className="flex flex-wrap gap-1.5">
                    {reg.map((d) => {
                      const target = itemByName.get(d)
                      const to = target ? href(target.type === "registry:ui" ? { page: "component", name: d } : { page: "library", name: d }) : undefined
                      return to ? (
                        <a key={d} href={to} className="rounded-full border border-border px-2 py-0.5 font-mono text-[13px] hover:bg-accent">
                          {d}
                        </a>
                      ) : (
                        <code key={d} className="rounded-full bg-muted px-2 py-0.5">
                          {d}
                        </code>
                      )
                    })}
                  </span>,
                ],
              ]
            : []),
        ]}
      />
    </Section>
  )
}

function SourceFiles({ item }: { item: Item }) {
  return (
    <Section id="source" title={<T ja="ソース" en="Source" />}>
      {item.files?.map((f) => <SourceFile key={f.path} path={f.path} />)}
    </Section>
  )
}

function SourceFile({ path }: { path: string }) {
  const code = useSource(path)
  return (
    <details className="group rounded-[var(--radius)] border border-border">
      <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 font-mono text-sm outline-none select-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
        {path}
        <span className="text-xs text-muted-foreground uppercase group-open:hidden">
          <T ja="開く" en="Show" />
        </span>
      </summary>
      <CodeBlock code={code} title={path} className="m-3 mt-0" />
    </details>
  )
}

const TOC = [
  ["preview", "Preview", "プレビュー"],
  ["playground", "Variants", "バリエーション"],
  ["usage", "Usage", "使い方"],
  ["props", "Props", "Props"],
  ["tokens", "Tokens", "トークン"],
  ["dependencies", "Dependencies", "依存関係"],
  ["source", "Source", "ソース"],
] as const

export function ComponentPage({ name }: { name: string }) {
  const item = itemByName.get(name)
  const path = item?.files?.[0]?.path
  const src = useSource(path)
  if (!item || item.type !== "registry:ui") return <Missing what={name} />
  const cat = categoryOf(item)
  return (
    <div>
      <PageHeader
        eyebrow={
          <span className="flex flex-wrap items-center gap-2">
            {cat && <a href={href({ page: "category", id: cat.id })} className="hover:text-foreground">{cat.title}</a>}
            <span>·</span>
            <span>{item.name}</span>
            {item.meta?.tech && <span className="rounded-full border border-border px-2 py-0.5">{item.meta.tech}</span>}
          </span>
        }
        title={item.title}
      >
        {desc(item)}
      </PageHeader>
      <nav aria-label="On this page" className="-mt-2 mb-6 flex flex-wrap gap-1.5">
        {TOC.filter(([id]) => (id !== "playground" || PLAYGROUNDS[name]) && (id !== "dependencies" || item.dependencies?.length || item.registryDependencies?.length)).map(([id, en, ja]) => (
          <Button key={id} asChild size="sm" variant="ghost" className="font-mono text-xs uppercase">
            <a
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(id)?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })
              }}
            >
              <T ja={ja} en={en} />
            </a>
          </Button>
        ))}
        <Button asChild size="sm" variant="ghost" className="font-mono text-xs uppercase">
          <a href={`/registry/#${name}`}>
            /registry <ExternalLinkIcon />
          </a>
        </Button>
      </nav>
      <Preview name={name} />
      {src && PLAYGROUNDS[name] && <Playground name={name} src={src} />}
      {src && <Usage item={item} src={src} />}
      {src && <ApiTables src={src} />}
      {src && <RelatedTokens src={src} />}
      <Dependencies item={item} />
      <SourceFiles item={item} />
    </div>
  )
}

export function CategoryPage({ id }: { id: string }) {
  const c = CATEGORIES.find((x) => x.id === id)
  if (!c) return <Missing what={id} />
  const list = componentsIn(c.id)
  return (
    <div>
      <PageHeader eyebrow={`Components · ${c.id} · ${list.length}`} title={c.title}>
        <T ja={c.ja} en={c.blurb} />
      </PageHeader>
      {c.id === "atmosphere" && (
        <Section title={<T ja="レンダラーの選び方" en="Choosing a renderer" />}>
          <Table head={["Renderer", "Here", "Reach for it when"]} rows={RENDERERS.map(([r, here, when]) => [r, <code className="text-muted-foreground">{here}</code>, <span className="text-muted-foreground">{when}</span>])} />
        </Section>
      )}
      <div className="grid gap-3 border-t border-border pt-10 sm:grid-cols-2">
        {list.map((i) => (
          <a
            key={i.name}
            href={href({ page: "component", name: i.name })}
            className="group flex flex-col gap-2 rounded-page border border-border p-6 transition-[border-color,background-color] duration-[var(--cie-t-cell)] ease-cie-expo hover:border-foreground/40 hover:bg-accent"
          >
            <span className="flex items-center justify-between gap-2 font-mono text-xs text-muted-foreground uppercase">
              {i.name}
              {i.meta?.tech && <span className="rounded-full border border-border px-2 py-0.5">{i.meta.tech}</span>}
            </span>
            <span className="flex items-center gap-2 text-2xl font-[300] tracking-[-0.03em]">
              {i.title}
              <ArrowRightIcon className="size-5 transition-transform duration-[var(--cie-t-fast)] ease-cie-out group-hover:translate-x-[3px]" />
            </span>
            <span className="text-[15px] text-muted-foreground">{desc(i)}</span>
          </a>
        ))}
      </div>
    </div>
  )
}

export function LibraryPage({ name }: { name: string }) {
  const item = itemByName.get(name)
  if (!item || item.type === "registry:ui") return <Missing what={name} />
  const reg = (item.registryDependencies ?? []).map((d) => d.replace(/^.*\/r\//, "").replace(/\.json$/, ""))
  return (
    <div>
      <PageHeader eyebrow={`${item.type.replace("registry:", "")} · ${item.name}`} title={item.title}>
        {desc(item)}
      </PageHeader>
      <Section title={<T ja="インストール" en="Install" />}>
        <Command cmd={addCmd(item.name)} />
      </Section>
      {item.name === "cie-theme" && (
        <Section title={<T ja="中身" en="What it sets" />}>
          <p className="text-muted-foreground">
            <T
              ja={<>tokens.json から生成されるテーマ。値は <a className="underline" href={href({ page: "foundation", id: "theme" })}>セマンティックテーマ</a> と <a className="underline" href={href({ page: "foundation", id: "tokens" })}>全トークン</a> を参照。</>}
              en={<>Generated from tokens.json. See <a className="underline" href={href({ page: "foundation", id: "theme" })}>Semantic theme</a> and <a className="underline" href={href({ page: "foundation", id: "tokens" })}>All tokens</a> for the values.</>}
            />
          </p>
        </Section>
      )}
      {reg.length > 0 && (
        <Section title={<T ja={`含まれるもの（${reg.length}）`} en={`Includes (${reg.length})`} />}>
          <div className="flex flex-wrap gap-1.5">
            {reg.map((d) => {
              const t = itemByName.get(d)
              return (
                <Button key={d} asChild size="sm" variant="outline" className="font-mono">
                  <a href={t ? href(t.type === "registry:ui" ? { page: "component", name: d } : { page: "library", name: d }) : `/r/${d}.json`}>{d}</a>
                </Button>
              )
            })}
          </div>
        </Section>
      )}
      <Dependencies item={item} />
      {item.files?.length ? <SourceFiles item={item} /> : null}
    </div>
  )
}

export function Missing({ what }: { what: string }) {
  return (
    <PageHeader eyebrow="404" title={<T ja="ページが見つかりません" en="Not found" />}>
      <code className="font-mono">{what}</code> —{" "}
      <a href="#/" className="underline">
        <T ja="概要へ戻る" en="Back to the overview" />
      </a>
    </PageHeader>
  )
}
