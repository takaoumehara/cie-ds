# CIE design system (cie-ds) — agent brief

Personal/internal tokens for Creativity Is Everywhere. **Not** a public product.
Fetch this file + `tokens.css` / `tokens.json` / `interaction.js` when styling Takao’s small tools.

- Demo: https://cie-ds.vercel.app/demo
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

| Name | Value | Use |
|---|---|---|
| `--cie-ease-expo` | `cubic-bezier(0.76, 0, 0.18, 1)` | Decisive settle / cell wave |
| `--cie-ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Rise, soft land |
| `--cie-t-snap` | 160ms | Weight tick, press |
| `--cie-t-fast` | 240ms | Arrow nudge |
| `--cie-t-cell` | 520ms | Block colour change |
| `--cie-t-move` | 720ms | Signature block→page |
| `--cie-t-stagger` | 38ms | Per-item delay |

Site behaviours to echo:

1. **Weight breath** — hover/focus bumps `font-variation-settings: 'wght' 300→640`.
2. **Rise** — `translateY(22px)` → 0 over 720ms ease-out, staggered.
3. **Press** — `translateX(3px)` on active/hover for nav labels.
4. **Arrow** — `→` / `↗` slides 3–5px.
5. **Away cell** — opacity 0 + scale 0.8 on expo.
6. **Tap** — scale to `--cie-press-scale` (0.97) on `:active`.
7. **Lift** — `translateY(-2px)` on hover for cards.
8. **Invert** — paper↔ink swap on `--cie-t-cell` expo.

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

## Files

- `tokens.css` / `tokens.json` — variables  
- `base.css` — optional reset  
- `scrollbar.css` — thin scrollbar  
- `motion.css` — loader + utilities  
- `scroll.css` — reveal + parallax CSS  
- `interactions.css` — tap / lift / invert / cycle / sound cues  
- `interaction.js` — observers + audio  
- `demo.html` — visual checklist  

License: proprietary (see `LICENSE`). Internal use only.
