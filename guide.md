# cie-ds

**Personal / internal use only.** Not an open design system for strangers to adopt.

Portable CSS tokens + snappy motion + scroll/parallax + per-section UI sound,
extracted from [creativityiseverywhere.com](https://creativityiseverywhere.com)
(`takaoumehara/creativityiseverywhere.com` · `main`).

**Version 0.5.0** — New: **shadcn registry** (`/r/*.json`) + React preview at `/registry`. 0.4.x vanilla files are unchanged.

> **JA** — 社内・個人用のトークン一式です。公開リポジトリは自分（と許可した人／エージェント）が取りに来るためのもの。第三者のプロダクト採用・再配布は想定していません。`LICENSE` 参照。

## Demo

- Catalog: https://cie-ds.vercel.app/
- Comprehensive: https://cie-ds.vercel.app/demo
- Parallax + Theme: https://cie-ds.vercel.app/parallax
- **Registry preview (React / shadcn):** https://cie-ds.vercel.app/registry

## shadcn registry (React projects)

The same tokens, as installable shadcn source. `tokens.json` stays the single source of truth —
`scripts/sync-tokens.mjs` generates the theme item, the motion constants and the preview CSS from it.

```bash
# 1. Theme first (overwrites the project's shadcn colour/radius/font variables with cie ones)
npx shadcn@latest add https://cie-ds.vercel.app/r/cie-theme.json
# …or everything at once (theme + libs + all components)
npx shadcn@latest add https://cie-ds.vercel.app/r/cie-all.json

# 2. Any component
npx shadcn@latest add https://cie-ds.vercel.app/r/shader-field.json
```

Optional namespace in `components.json` → `npx shadcn@latest add @cie/border-beam`:

```json
{ "registries": { "@cie": "https://cie-ds.vercel.app/r/{name}.json" } }
```

- Requires a shadcn-initialised project (Tailwind v4, `tw-animate-css`). Load Outfit 100–900 + DM Mono 400.
- `class="dark"` on `<html>` = CIE ink ground; without it = paper ground.
- Install `cie-theme` (or `cie-all`) **explicitly** once: shadcn only overwrites existing theme variables
  for theme/style items you add directly, not for ones pulled in as dependencies.

| Category | Items |
|---|---|
| Foundation | `button` · `input` · `dialog` · `sheet` (shadcn API, cie styling) |
| Atmosphere | `grid-pattern` (SVG) · `noise` (SVG) · `particles` (Canvas 2D) · `shader-field` (WebGL) · `spotlight` |
| Micro | `border-beam` · `shimmer-button` · `text-shimmer` · `animated-tabs` · `smooth-accordion` |
| Showcase | `parallax` (+ `ScrollExpand`) · `reveal` · `split-text` · `word-rotate` · `number-ticker` · `expand-card` |
| Libs | `cie-theme` · `cie-motion` (easings/durations for motion) · `cie-color` (theme colours for Canvas/WebGL) |

Rules enforced by `npm run check` (`scripts/check-tokens.mjs`): no hex / colour literals, no Tailwind palette
colours, no drop shadows, no animation library other than `motion`.

### Develop

```bash
npm install
npm run dev      # preview at http://localhost:5173/registry/
npm run check    # tokens in sync + token guard + typecheck
npm run build    # dist/ = vanilla catalog + dist/r/*.json + dist/registry/
```

Edit tokens in `tokens.json` (semantic mapping under `semantic`), then `npm run tokens`.
Add a component: write `registry/cie/ui/<name>.tsx`, add an item to `registry.json`, add a demo in
`preview/src/demos.tsx`.

## One-line include

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400&family=Outfit:wght@100..900&display=swap">
<link rel="stylesheet" href="https://cie-ds.vercel.app/tokens.css">
<link rel="stylesheet" href="https://cie-ds.vercel.app/base.css">
<link rel="stylesheet" href="https://cie-ds.vercel.app/scrollbar.css">
<link rel="stylesheet" href="https://cie-ds.vercel.app/motion.css">
<link rel="stylesheet" href="https://cie-ds.vercel.app/scroll.css">
<link rel="stylesheet" href="https://cie-ds.vercel.app/interactions.css">
<!-- Optional: hamburger nav -->
<link rel="stylesheet" href="https://cie-ds.vercel.app/nav.css">
<!-- Optional: text loading variants -->
<link rel="stylesheet" href="https://cie-ds.vercel.app/text-load.css">
<!-- Optional: organic/slow motion -->
<link rel="stylesheet" href="https://cie-ds.vercel.app/organic.css">
<!-- Optional: theme morph -->
<link rel="stylesheet" href="https://cie-ds.vercel.app/theme-morph.css">
<script src="https://cie-ds.vercel.app/interaction.js" defer></script>
```

Or copy the files into your project and link locally. Plain CSS + one vanilla JS file — these files still need no build step
(the repo's build only adds the React registry next to them).

Minimal (tokens + motion only):

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="motion.css">
```

## What’s in the box

| File | Role |
|---|---|
| `tokens.css` | Colour, type, space, radius, motion, scroll vars (`--cie-*` + site aliases) |
| `base.css` | Light reset + typography helpers |
| `scrollbar.css` | Thin elegant scrollbar (5px, not chunky) |
| `motion.css` | Loader + fade/rise/slide/press/breath/stagger |
| `scroll.css` | Reveal-on-scroll variants + parallax hooks |
| `interactions.css` | Tap, lift, invert, chip, cycle, expand/morph, sheet, sound cues |
| `nav.css` | Hamburger → X morph + sliding panel |
| `text-load.css` | Quiet text loading variants (fade-up, soft-wipe, letter-fade, line-rise, pulse-dot) |
| `organic.css` | Slow motion family (drift, breath, float, morph, ambient blobs) |
| `theme-morph.css` | Scroll-linked theme morph (ink ↔ paper) |
| `interaction.js` | Observers, parallax, cycle, expand, sheet, nav, text-load, theme-morph, Web Audio |
| `tokens.json` | Same tokens for tooling / AIs |
| `DESIGN.md` | Compact system summary for agents |
| `registry.json` · `registry/cie/` | shadcn registry source (React + Tailwind v4 + motion) |
| `preview/` | React preview app → `/registry` |
| `scripts/` | `sync-tokens` (tokens.json → registry), `check-tokens` (guard), `build` |
| `guide.md` | Same as README (Vercel serves this; `README.md` is blocked at the edge) |
| `demo.html` | Comprehensive pattern showcase |
| `parallax.html` | Dedicated scroll-linked theme morph demo |
| `index.html` | Catalog navigation hub |
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
| Motion | `--cie-ease-expo` · `--cie-ease-out` · `--cie-ease-snap` · cell `320ms` · move `360ms` · snap `120ms` |

**Rules:** two colours only; hierarchy via size + weight motion; no shadow / gradient / accent on the board language.

## Patterns

### Micro-interactions

```html
<button class="cie-breath cie-press">Work</button>
<button class="cie-tap cie-lift">Card</button>
<button class="cie-invert cie-tap">Swap inks</button>
<a class="cie-arrow cie-uline" href="#">Open</a>
<button class="cie-pbtn" type="button" aria-label="Next">→</button>
```

### Scroll reveal

```html
<div class="cie-reveal-stagger">
  <article data-cie-reveal="rise">One</article>
  <article data-cie-reveal="fade">Two</article>
  <article data-cie-reveal="slide">Three</article>
  <article data-cie-reveal="pop">Four</article>
</div>
```

Requires `scroll.css` + `interaction.js`. Variants: `rise` (default), `fade`, `slide`, `slide-right`, `pop`.

### Parallax

```html
<div class="cie-parallax-stage">
  <p data-cie-parallax="0.25">Foreground</p>
  <div data-cie-parallax="0.6" aria-hidden="true"></div>
</div>
```

Speed is a unitless factor. Displacement capped by `--cie-parallax-max` (default 48px).


### Click-to-expand (cell → panel)

```html
<div class="cie-expand-board cie-expand--snap" data-cie-expand-board>
  <button type="button" class="cie-expand-cell" data-cie-expand="panel-work">Work</button>
</div>
<div id="panel-work" class="cie-expand-panel cie-expand--snap" data-cie-expand-panel hidden>
  <div class="cie-expand-panel__bar">
    <button type="button" class="cie-pbtn" data-cie-expand-close aria-label="Close">×</button>
  </div>
  <div class="cie-expand-panel__in">…</div>
</div>
```

FLIP morph on `--cie-t-move` (360ms) / `--cie-ease-expo`. Add `.cie-expand--snap` for subtle overshoot. Demo: `/demo#expand`.

### Sheet / modal

```html
<button type="button" data-cie-sheet-open="sheet-1">Open</button>
<div id="sheet-1" class="cie-sheet" data-cie-sheet role="dialog" aria-modal="true" aria-hidden="true" tabindex="-1">
  <button type="button" data-cie-sheet-close aria-label="Close">×</button>
  …
</div>
```

Use `.cie-sheet--center` for a centered modal with `--cie-ease-snap`. Demo: `/demo#sheet`.

### Click-to-cycle

```html
<button type="button" class="cie-chip" data-cie-cycle="Idle|Working|Done">Idle</button>
```

### Per-section sound (not global mute)

```html
<section data-cie-sound data-cie-hover-sfx>
  <button type="button" class="cie-chip" data-cie-sound-toggle aria-pressed="false">
    <span class="cie-sound-icon" aria-hidden="true"></span> Sound
  </button>
  <button type="button" data-cie-sfx="click">Click</button>
  <button type="button" data-cie-sfx="confirm">Confirm</button>
</section>
```

- Sound is **off** until the section toggle is pressed (`aria-pressed="true"` → `.is-sound-on`).
- Tones are synthesized with the Web Audio API (oscillators + short noise) — **no audio files**, no royalty issues.
- AudioContext unlocks only after a user gesture (browser policy).
- `data-cie-hover-sfx` on the section enables optional hover ticks for interactive children.
- Kinds: `hover` · `click` · `confirm` · `cycle` · `toggle`.
- Under `prefers-reduced-motion: reduce`, motion collapses and UI sounds stay silent.

**Sound Presets (v0.4.0):**  
5 tasteful presets, localStorage-persisted, no audio files:

- `soft-tick` — high gentle taps
- `paper-snap` — default, balanced
- `glass-pip` — bright, crystalline
- `low-thud` — deep, subdued
- `bright-confirm` — clear, affirmative

```html
<!-- Preset picker (cycle button) -->
<div data-cie-sfx-picker>
  <button class="cie-chip cie-tap" 
          data-cie-cycle="soft-tick|paper-snap|glass-pip|low-thud|bright-confirm">
    <span class="cie-cycle-label">paper-snap</span>
  </button>
</div>
```

Per-section override: `<section data-cie-sound data-cie-sfx-preset="glass-pip">`.

### Hamburger Nav (v0.4.0)

```html
<button type="button" class="cie-hamburger" 
        data-cie-hamburger="main-nav" 
        aria-expanded="false" aria-controls="main-nav">
  <span class="cie-hamburger__line"></span>
  <span class="cie-hamburger__line"></span>
  <span class="cie-hamburger__line"></span>
</button>

<nav id="main-nav" class="cie-nav-panel cie-nav-panel--ink">
  <div class="cie-nav-panel__head">
    <h3 class="cie-nav-panel__title">Navigation</h3>
    <button type="button" class="cie-pbtn" data-cie-nav-close>×</button>
  </div>
  <div class="cie-nav-panel__nav">
    <a href="#">Work</a>
    <a href="#">About</a>
  </div>
</nav>
```

- Icon morphs hamburger → X on `--cie-t-move` expo
- Panel slides in (right by default, or `.cie-nav-panel--left`)
- Synced `aria-expanded`, Escape, backdrop click, light focus trap

### Text Loading (v0.4.0)

Quiet variants for CIE company site (NOT portfolio scramble/pixelate):

```html
<h1 data-cie-text="fade-up">Creativity is everywhere</h1>
<h2 data-cie-text="soft-wipe">Block becomes page</h2>
<h3 data-cie-text="letter-fade">Snappy settle</h3>
<p data-cie-text="pulse-dot">Loading</p>
```

Variants: `fade-up` (default), `soft-wipe`, `letter-fade`, `line-rise`, `pulse-dot`.  
JS auto-wraps characters/lines, adds `.is-loaded` class after frame delay.

### Organic / Slow Motion (v0.4.0)

Complement to snappy UI chrome. For ambient elements, backgrounds, hero stages:

```html
<div class="cie-drift">Gentle float</div>
<div class="cie-organic-breath">Soft pulse</div>
<div class="cie-float">Vertical drift</div>
<div class="cie-morph">Border-radius loop</div>

<!-- Ambient stage with soft blobs -->
<div class="cie-ambient-stage">
  <div class="cie-ambient-blob" style="--blob-i: 0;"></div>
  <div class="cie-ambient-blob" style="--blob-i: 1;"></div>
</div>
```

CSS-driven loops (6s–14s), reduced-motion safe. NOT for primary UI interactions.

### Theme Morph (v0.4.0)

Scroll-linked color shift: ink → grey → paper. Contrast-safe at every position.

```html
<main data-cie-theme-morph>
  <section class="cie-theme-stage">
    <h1 class="cie-theme-text">Shift</h1>
    <p class="cie-theme-mute">Scroll-linked · subtle</p>
  </section>
</main>
```

JS sets `--cie-theme-progress` (0..1); CSS shifts background/foreground via HSL.  
See `parallax.html` for full-page demo with optional layer parallax.

#### JS API

```js
// Auto-inits on DOMContentLoaded as window.Cie
Cie.init();           // re-scan (e.g. after injecting DOM)
Cie.play('click');    // manual tone (still needs unlocked ctx)
Cie.unlock();         // resume AudioContext after gesture
Cie.reducedMotion;    // boolean
Cie.version;          // "0.4.0"

// Sound presets (v0.4.0)
Cie.presets;          // ['soft-tick', 'paper-snap', 'glass-pip', 'low-thud', 'bright-confirm']
Cie.getPreset();      // current preset name
Cie.setPreset('glass-pip'); // set + persist to localStorage
```

## Reduced motion

CSS and JS both honour `prefers-reduced-motion: reduce`:

- Animations / transitions cut
- Reveals appear immediately (`.is-in`)
- Parallax disabled
- Section UI sounds suppressed

## Vite / Astro

```js
import './cie-ds/tokens.css'
import './cie-ds/base.css'
import './cie-ds/scrollbar.css'
import './cie-ds/motion.css'
import './cie-ds/scroll.css'
import './cie-ds/interactions.css'
// Optional:
import './cie-ds/nav.css'
import './cie-ds/text-load.css'
import './cie-ds/organic.css'
import './cie-ds/theme-morph.css'
import './cie-ds/interaction.js' // side-effect: Cie.init()
```

Copy the folder, or pin a git submodule / sparse checkout of this repo.

## Fonts

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
- Catalog: https://cie-ds.vercel.app/
- Demo: https://cie-ds.vercel.app/demo
- Parallax: https://cie-ds.vercel.app/parallax
- Registry: https://cie-ds.vercel.app/registry
- Repo: https://github.com/takaoumehara/cie-ds
