# cie-ds

**Personal / internal use only.** Not an open design system for strangers to adopt.

Portable CSS tokens + snappy motion extracted from
[creativityiseverywhere.com](https://creativityiseverywhere.com)
(`takaoumehara/creativityiseverywhere.com` · `main`).

> **JA** — 社内・個人用のトークン一式です。公開リポジトリは自分（と許可した人／エージェント）が取りに来るためのもの。第三者のプロダクト採用・再配布は想定していません。`LICENSE` 参照。

## Demo

https://cie-design-system.vercel.app/demo.html

(GitHub Pages could not be enabled with current token scopes; Vercel static is the permanent preview.)

## One-line include

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400&family=Outfit:wght@100..900&display=swap">
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="base.css">   <!-- optional -->
<link rel="stylesheet" href="motion.css">
```

Or from the published Pages URL (after deploy):

```html
<link rel="stylesheet" href="https://cie-design-system.vercel.app/tokens.css">
<link rel="stylesheet" href="https://cie-design-system.vercel.app/motion.css">
```

Plain CSS. No npm package. No build step.

## What’s in the box

| File | Role |
|---|---|
| `tokens.css` | Colour, type, space, radius, motion vars (`--cie-*` + site aliases) |
| `motion.css` | Loader + fade/rise/slide/press/breath/stagger utilities |
| `base.css` | Light reset + typography helpers |
| `tokens.json` | Same tokens for tooling / AIs |
| `DESIGN.md` | Compact system summary for agents |
| `demo.html` | Standalone preview |
| `LICENSE` / `NOTICE` | Restrictive — view OK; no redistrib / commercial reuse |

## Key tokens (mirror of site `main`)

| Token | Value |
|---|---|
| `--cie-ink` | `#0b0b0b` |
| `--cie-paper` | `#f3f2ee` |
| `--cie-ink-mute` | `#9c9c98` |
| `--cie-paper-mute` | `#66665f` |
| Sans | **Outfit** variable 100–900 (Google Fonts) |
| Mono | **DM Mono** 400 |
| JA face | **Zen Kaku Gothic New** (+ Hiragino / Noto) via `:lang(ja)` |
| Radius | `--cie-r` block / `--cie-r-page` card |
| Motion | `--cie-ease-expo` `cubic-bezier(0.76, 0, 0.18, 1)` · `--cie-ease-out` `cubic-bezier(0.16, 1, 0.3, 1)` · cell `520ms` · move `720ms` |

**Rules:** two colours only; hierarchy via size + weight motion; no shadow / gradient / accent on the board language.

## Micro-interactions (シュパシュパ)

```html
<div class="cie-loader" aria-hidden="true"></div>
<span class="cie-loader-dots">Loading</span>

<button class="cie-breath cie-press">Work</button>
<a class="cie-arrow cie-uline" href="#">Open</a>

<ul class="cie-stagger">
  <li class="cie-rise" style="--i:0">One</li>
  <li class="cie-rise" style="--i:1">Two</li>
</ul>
```

Loader is **complementary** — the live site has no spinner; this one uses the same two-ink block + expo pulse.

## Vite / Astro

```js
import './cie-ds/tokens.css'
import './cie-ds/base.css'
import './cie-ds/motion.css'
```

Copy the folder, or pin a git submodule / sparse checkout of this repo.

## Fonts

Free Google Fonts on the company site:

```
Outfit:wght@100..900
DM+Mono:wght@400
# Japanese pages also load:
Zen+Kaku+Gothic+New:wght@300;400;500;700
```

Document the family names; do not self-host commercial cuts you do not own.

## License

Proprietary — see `LICENSE`. Viewing the public repo is fine. Redistribution, commercial reuse, and republishing as a product are not, without written permission from Takao Umehara.

## Source of truth

- Live: https://creativityiseverywhere.com  
- Design notes in company repo: `docs/design.md`  
- Tokens extracted from: `assets/tokens.css` on branch `main`  
- Demo: https://cie-design-system.vercel.app/demo.html
- Repo: https://github.com/takaoumehara/cie-ds
