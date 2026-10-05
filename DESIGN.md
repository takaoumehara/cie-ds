# CIE design system (cie-ds) — agent brief

Personal/internal tokens for Creativity Is Everywhere. **Not** a public product.
Fetch this file + `tokens.css` / `tokens.json` / `interaction.js` when styling Takao’s small tools.

- Demo: https://cie-ds.vercel.app/demo
- Parallax: https://cie-ds.vercel.app/parallax
- Catalog: https://cie-ds.vercel.app/
- Tokens CSS: https://cie-ds.vercel.app/tokens.css
- JS: https://cie-ds.vercel.app/interaction.js
- This brief: https://cie-ds.vercel.app/DESIGN.md
- Repo: https://github.com/takaoumehara/cie-ds

## Surface

Black ground (`#0b0b0b`), paper blocks (`#f3f2ee`). Two inks. No accent colour,
no shadow, no gradient. Hierarchy = size + Outfit weight motion.

## Colour

| Role | Hex | CSS |
|---|---|---|
| Ink (ground) | `#0b0b0b` | `--cie-ink` |
| Paper (blocks / text on ink) | `#f3f2ee` | `--cie-paper` |
| Mute on ink | `#9c9c98` | `--cie-ink-mute` |
| Mute on paper | `#66665f` | `--cie-paper-mute` |
| Stroke on ink cells | `rgba(243,242,238,0.42)` | `--cie-stroke` |
| Round btn fill | `rgba(128,128,128,0.32)` | `--cie-btn` |

Selection inverts: paper fill / ink text (and reverse on paper panels).

## Type

- **Latin display/body:** Outfit variable 100–900 — Google Fonts  
  `family=Outfit:wght@100..900`
- **Registers / indices:** DM Mono 400 — `family=DM+Mono:wght@400`
- **Japanese:** Zen Kaku Gothic New 300–700; tracking **0**; body leading **1.8**;
  `font-feature-settings: 'palt' 1`; scope with `:lang(ja)`.
- Body 16px / 1.5 / measure 62ch. Mono labels 12px uppercase +0.02em tracking.
- Display letter-spacing about −0.03 to −0.045em (Latin only).

## Space / radius

4px base: 4, 8, 12, 16, (20), 24, 28, 40, 64.  
Edge `clamp(16px, 2.2vw, 28px)`.  
Radius: block `--cie-r` = `clamp(12px, 1.7vmin, 24px)`; page `--cie-r-page`;
pill only for round panel buttons.

## Motion language

Snappy 「にゅるっと but fast」 — expands land in **280–420ms**, not 700ms+.

| Name | Value | Use |
|---|---|---|
| `--cie-ease-expo` | `cubic-bezier(0.76, 0, 0.18, 1)` | Decisive settle / expand |
| `--cie-ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Rise, soft land |
| `--cie-ease-snap` | `cubic-bezier(0.34, 1.22, 0.64, 1)` | Subtle overshoot (optional) |
| `--cie-t-snap` | 120ms | Weight tick, press |
| `--cie-t-fast` | 180ms | Arrow nudge |
| `--cie-t-cell` | 320ms | Block colour change |
| `--cie-t-move` | 360ms | Signature block→page expand |
| `--cie-t-rise` | 400ms | Reveal after open |
| `--cie-t-sheet` | 300ms | Modal / sheet |
| `--cie-t-stagger` | 24ms | Per-item delay |

Site behaviours to echo:

1. **Expand / morph** — cell → panel FLIP on `--cie-t-move` expo (`data-cie-expand`).
2. **Weight breath** — hover/focus bumps `font-variation-settings: 'wght' 300→640`.
3. **Rise** — `translateY(22px)` → 0 over `--cie-t-rise` ease-out, staggered.
4. **Press** — `translateX(3px)` on active/hover for nav labels.
5. **Arrow** — `→` / `↗` slides 3–5px.
6. **Away cell** — opacity 0 + scale 0.8 on expo.
7. **Tap** — scale to `--cie-press-scale` (0.97) on `:active`.
8. **Lift** — `translateY(-2px)` on hover for cards.
9. **Invert** — paper↔ink swap on `--cie-t-cell` expo.
10. **Sheet** — bottom sheet / center modal on `--cie-t-sheet`.

**Loader (package addition):** site has none. `.cie-loader` is a paper block that
pulses scale/radius on `--cie-t-cell` / expo, with an ink tick rotating 90° —
same two-ink vocabulary, snappy not floaty.

Always honour `prefers-reduced-motion: reduce` (zero meaningful animation; no UI sfx).

## Scroll & parallax

| Hook | Behaviour |
|---|---|
| `data-cie-reveal` | Hidden until IntersectionObserver adds `.is-in` |
| `data-cie-reveal="rise\|fade\|slide\|slide-right\|pop"` | Variant transforms |
| `.cie-reveal-stagger` | Sets `--i` on children for delay |
| `data-cie-parallax="0.35"` | Scroll-linked `--cie-py` (capped by `--cie-parallax-max`) |
| `.cie-parallax-stage` | Overflow clip for layered stages |

## Scrollbar

`scrollbar.css`: 5px pill thumb, transparent track, `scrollbar-width: thin`.
Not chunky. Thumb uses `--cie-ink-mute` on ink; `--cie-paper-mute` on paper panels.

## Click-cycle

`data-cie-cycle="A|B|C"` — click advances label. Optional `.cie-cycle-label` child
holds the text when the control has richer markup.

## Section sound (not global)

```html
<section data-cie-sound data-cie-hover-sfx>
  <button data-cie-sound-toggle aria-pressed="false">Sound</button>
  <button data-cie-sfx="click">…</button>
</section>
```

- Toggle arms **only that section** (`.is-sound-on`).
- Web Audio oscillators + short noise; no external files.
- Unlock after user gesture. Mute under reduced-motion.
- Kinds: `hover` · `click` · `confirm` · `cycle` · `toggle`.
- API: `window.Cie` → `init()`, `play(kind)`, `unlock()`, `reducedMotion`.

## Include order (recommended)

```
tokens.css → base.css → scrollbar.css → motion.css → scroll.css → interactions.css
interaction.js (defer)
```

## Do / don’t

- Do: ink/paper only; Outfit + DM Mono; block radius; snappy expo/out; thin scrollbar;
  per-section sound opt-in; honour reduced-motion in CSS **and** JS.
- Don’t: coral/orange accents from older deploys; Inter as primary; drop shadows;
  rainbow loaders; springy bouncy easings; global site-mute UX for sound;
  chunky scrollbars; heavy parallax; royalty audio files.

## New in 0.4.0

### Text Loading Family (CIE company site, NOT portfolio)

Portfolio (takaoumehara.com) has flashy modes: scramble-typewriter, katakana, pixelate.  
**CIE / company site: quieter family**, several related variants:

- `data-cie-text="fade-up"` — opacity + slight Y (default)
- `data-cie-text="soft-wipe"` — clip-path wipe, restrained
- `data-cie-text="letter-fade"` — stagger letters gently, no scramble
- `data-cie-text="line-rise"` — block lines rise with short stagger
- `data-cie-text="pulse-dot"` — minimal loading indicator with quiet pulse

No motion-lab settings UI — just preset switcher in demo that re-runs effect.  
JS: `initTextLoad()` auto-wraps characters/lines, adds `.is-loaded` class.

### Hamburger Nav

Hamburger → X morph + sliding panel:

- `data-cie-hamburger="panel-id"` on button
- `.cie-hamburger__line` × 3 for bars
- `.cie-nav-panel` with `id="panel-id"`
- Panel slides on `--cie-t-move` expo, synced with icon morph
- `aria-expanded`, Escape, backdrop click, light focus trap
- Variants: `.cie-nav-panel--left`, `.cie-nav-panel--ink`

### Organic / Slow Motion Family

Complement to snappy UI chrome. CSS-driven loops, reduced-motion safe:

- `.cie-drift` / `data-cie-organic="drift"` — gentle horizontal float (8s)
- `.cie-organic-breath` / `data-cie-organic="breath"` — soft scale pulse (6s)
- `.cie-float` / `data-cie-organic="float"` — vertical drift + opacity (10s)
- `.cie-morph` / `data-cie-organic="morph"` — border-radius + scale loop (12s)
- `.cie-ambient-blob` — soft moving shapes for backgrounds
- For ambient elements, backgrounds, hero stages — **not** primary UI

### Sound System Enhancements

- **Fixed**: master gain 0.0001 → 0.18 (now clearly audible)
- **Presets**: 5 tasteful options, no audio files needed:
  - `soft-tick` — high gentle taps
  - `paper-snap` — default, balanced (420–560Hz)
  - `glass-pip` — bright, crystalline (1760–2400Hz)
  - `low-thud` — deep, subdued (90–220Hz)
  - `bright-confirm` — clear, affirmative (660–1540Hz)
- `localStorage.getItem('cie-sfx-preset')` persists choice
- `data-cie-sfx-preset` on section overrides global
- `data-cie-sfx-picker` auto-wires preset cycle button
- API: `Cie.presets`, `Cie.getPreset()`, `Cie.setPreset(name)`

### Theme Morph (scroll-linked)

Replaces weak parallax with convincing scroll color shift:

- `data-cie-theme-morph` on container
- JS sets `--cie-theme-progress` (0..1) based on scroll position
- CSS: background shifts `hsl(0, 0%, 4% → 95%)` ink → grey → paper
- Text/controls invert automatically via `--cie-theme-fg` / `--cie-theme-bg`
- Contrast-safe at every scroll position
- Optional subtle layer parallax (`data-cie-parallax`) inside theme sections
- See `parallax.html` for full-page demo

## Files

- `tokens.css` / `tokens.json` — variables  
- `base.css` — optional reset  
- `scrollbar.css` — thin scrollbar  
- `motion.css` — loader + utilities  
- `scroll.css` — reveal + parallax CSS  
- `interactions.css` — tap / lift / invert / cycle / expand / sheet / sound cues  
- `nav.css` — hamburger → X morph + sliding panel  
- `text-load.css` — quiet text loading variants (fade-up, soft-wipe, letter-fade, line-rise, pulse-dot)  
- `organic.css` — slow motion family (drift, breath, float, morph, ambient blobs)  
- `theme-morph.css` — scroll-linked theme morph system  
- `interaction.js` — observers + expand/morph + sheet + audio + nav + text-load + theme-morph  
- `demo.html` — comprehensive catalog with all patterns  
- `parallax.html` — dedicated scroll-linked theme morph + parallax demo  
- `index.html` — catalog navigation hub  

License: proprietary (see `LICENSE`). Internal use only.
