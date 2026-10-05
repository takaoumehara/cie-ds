# CIE design system (cie-ds) — agent brief

Personal/internal tokens for Creativity Is Everywhere. **Not** a public product.
Fetch this file + `tokens.css` / `tokens.json` when styling Takao’s small tools.

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

**Loader (package addition):** site has none. `.cie-loader` is a paper block that
pulses scale/radius on `--cie-t-cell` / expo, with an ink tick rotating 90° —
same two-ink vocabulary, snappy not floaty.

Always honour `prefers-reduced-motion: reduce` (zero meaningful animation).

## Do / don’t

- Do: ink/paper only; Outfit + DM Mono; block radius; snappy expo/out.
- Don’t: coral/orange accents from older deploys; Inter as primary; drop shadows;
  rainbow loaders; springy bouncy easings that fight expo.

## Files

- `tokens.css` — variables  
- `motion.css` — loader + utilities  
- `base.css` — optional reset  
- `tokens.json` — machine-readable  
- `demo.html` — visual checklist  

License: proprietary (see `LICENSE`). Internal use only.
