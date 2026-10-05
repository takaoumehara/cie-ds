# cie-ds

**Personal / internal use only.** Not an open design system for strangers to adopt.

Portable CSS tokens + snappy motion + scroll/parallax + per-section UI sound,
extracted from [creativityiseverywhere.com](https://creativityiseverywhere.com)
(`takaoumehara/creativityiseverywhere.com` · `main`).

> **JA** — 社内・個人用のトークン一式です。公開リポジトリは自分（と許可した人／エージェント）が取りに来るためのもの。第三者のプロダクト採用・再配布は想定していません。`LICENSE` 参照。

## Demo

https://cie-ds.vercel.app/demo

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
<script src="https://cie-ds.vercel.app/interaction.js" defer></script>
```

Or copy the files into your project and link locally. Plain CSS + one vanilla JS file. No npm package. No build step.

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
| `interaction.js` | Observers, parallax, click-cycle, expand/morph, sheet, per-section Web Audio |
| `tokens.json` | Same tokens for tooling / AIs |
| `DESIGN.md` | Compact system summary for agents |
| `guide.md` | Same as README (Vercel serves this; `README.md` is blocked at the edge) |
| `demo.html` | Pattern showcase with copyable labels |
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

#### JS API

```js
// Auto-inits on DOMContentLoaded as window.Cie
Cie.init();           // re-scan (e.g. after injecting DOM)
Cie.play('click');    // manual tone (still needs unlocked ctx)
Cie.unlock();         // resume AudioContext after gesture
Cie.reducedMotion;    // boolean
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
- Demo: https://cie-ds.vercel.app/demo  
- Repo: https://github.com/takaoumehara/cie-ds
