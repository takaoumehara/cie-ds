# CIE design system (cie-ds) — agent brief

Personal/internal tokens for Creativity Is Everywhere. **Not** a public product.
Fetch this file + `tokens.css` / `tokens.json` / `interaction.js` when styling Takao’s small tools.

- Demo: https://cie-ds.vercel.app/demo
- Parallax: https://cie-ds.vercel.app/parallax
- Catalog: https://cie-ds.vercel.app/
- Tokens CSS: https://cie-ds.vercel.app/tokens.css
- JS: https://cie-ds.vercel.app/interaction.js
- This brief: https://cie-ds.vercel.app/DESIGN.md
- Registry (React / shadcn): https://cie-ds.vercel.app/registry · items at `/r/<name>.json`
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
| `--cie-t-scene` | 420ms | View / scene transition (wipe, whip) |
| `--cie-blur-in` | 8px | Blur-in reveal, rack focus |
| `--cie-whip-blur` | 12px | Peak blur in a whip pan |

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
| `data-cie-reveal="blur"` | `filter: blur(var(--cie-blur-in))` → 0, no travel (`--cie-t-rise`, ease-out) |
| `data-cie-reveal="clip"` | `clip-path: inset(100% 0 0 0)` → `inset(0)` — wipes up (`--cie-t-move`, expo) |
| `.cie-reveal-stagger` | Sets `--i` on children for delay |
| `data-cie-parallax="0.35"` | Scroll-linked `--cie-py` (capped by `--cie-parallax-max`) |
| `.cie-parallax-stage` | Overflow clip for layered stages |
| `data-cie-progress` / `="#id"` | Writes `--cie-progress` (0–1): page progress, or `#id`'s own inner scroll (if it scrolls) / its passage through the viewport |
| `.cie-progress-bar` (+ `--fixed`) | 2px `currentColor` bar, `transform: scaleX(var(--cie-progress))`, origin left; `--fixed` pins it to the viewport top |
| `data-cie-hide-header` / `="#box"` | Toggles `.is-hidden` (translateY(-100%), `--cie-t-move` expo) after 8px down; removed on 8px up, near the top (<64px) or on focus. Reduced motion: fades instead |
| `data-cie-scrollspy` / `="#box"` | On a nav: `a[href^="#"]` gets `.is-active` + `aria-current="location"` when its section is in view; clicks scroll smoothly (instant under reduced motion). `data-cie-scrollspy-offset="64"` reserves a sticky header |

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

## Registry (v0.5.0) — React / shadcn

For React + Tailwind v4 projects, prefer the registry over hand-copying CSS:

```bash
npx shadcn@latest add https://cie-ds.vercel.app/r/cie-theme.json   # once, explicitly
npx shadcn@latest add https://cie-ds.vercel.app/r/<name>.json
```

**Token mapping** (generated from `tokens.json → semantic`; `class="dark"` = ink ground, default for CIE):

| shadcn var | ink ground (`.dark`) | paper ground (`:root`) |
|---|---|---|
| `--background` / `--foreground` | ink / paper | paper / ink |
| `--card` / `--card-foreground` | paper / ink (a block on the board) | ink / paper |
| `--primary` / `--primary-foreground` | paper / ink | ink / paper |
| `--secondary` | `--cie-btn` (round panel button grey) | same |
| `--muted-foreground` | ink-mute | paper-mute |
| `--border` / `--input` | paper @16% / 24% | ink @14% / 22% |
| `--radius` / `rounded-page` | `--cie-r` / `--cie-r-page` | same |
| `--destructive` | the **only** extra hue — errors / destructive actions only | |

Tailwind utilities from the theme: `font-sans` (Outfit) · `font-mono` (DM Mono) · `ease-cie-expo|out|snap` ·
`rounded-page` · `border-stroke` · `animate-cie-shimmer|grain` · `cie-ring-mask`.
In motion code import `cieEase`, `cieDuration`, `cieTransition`, `cieScene`, `cieBlur`, `cieScroll` from
`@/lib/cie-motion` (never type bezier numbers by hand). In GSAP code import from `@/lib/cie-gsap`.

### Expression rules for the registry (v0.5 update)

The board language above still wins. These are allowed **because they stay inside two inks**:

- **Alpha of an ink** — `from-foreground to-transparent`, `color-mix(in oklab, var(--foreground) 12%, transparent)`.
  A gradient *between hues* is still out.
- **Backdrop blur** on overlays (dialog / sheet / sticky header).
- **Springs** for physical follow-through (layout pills, cursor follow) when they settle in ≈ 300–420ms
  (`cieTransition.spring`). Long wobbly springs are still out — snappy にゅるっと.
- **Parallax beyond 48px** when asked for: `<Parallax speed={2.5}>` scales the token range. 48px stays the default.
- **Atmospheres** (shader fields, particles, grain) as backgrounds behind content, never on UI chrome.
- No drop shadows, no Tailwind palette colours, no hex in components — `npm run check` fails the build otherwise.

### Motion libraries (policy)

Libraries are chosen **by fit, not by rule**. Any animation / interaction library may be used if the result
passes the fit test below. What stays strict is **install cost**: a library is only installed by the items
that need it.

| Layer | Library | Use for | Installed by |
|---|---|---|---|
| Core | `motion` | All UI parts, reveals, hover / press, view transitions | `cie-all` and every core item |
| Pro (opt-in) | `gsap` + ScrollTrigger via `cie-gsap` | Pinned / scrubbed scroll scenes: pin + scrub, scrollytelling, horizontal scroll, image sequence, scroll-driven camera | `cie-scroll-pro` and its items only |
| Others | e.g. Lenis, Rive, Lottie | When a component genuinely needs them | That item only, decided case by case |

`npm run check` enforces it: every npm import in a registry file must be in that item's `dependencies`, and
nothing reachable from `cie-all` may depend on a non-core package. Still banned: `framer-motion` (old name of
`motion`, would install twice) and `react-transition-group` (use `AnimatePresence`).

**Fit test** — a motion belongs in cie when:

1. It uses two inks (+ alpha) only. No hue gradients.
2. Time and easing come from tokens: `cieTransition` / `cieScene` in motion, `cieGsapEase` / `cieGsapDuration`
   (from `@/lib/cie-gsap`) in GSAP. Never hand-typed beziers.
3. UI responses land in 280–420ms. Scroll-scrubbed motion follows scroll distance instead (`ease: "none"`).
4. Reduced motion shows the end state or an instant cut (the "freeze frame"). `useCieGsap` passes `reduced`.
5. It isn't off-brand: no dutch angles, FPV dives or strong handheld shake.

### Motion vocabulary (72 names → cie)

Names from three reference cheat sheets (UI parts · scroll · camera work). Ask for motion by these names;
each maps to a cie implementation. ✅ exists · 🆕 planned · ✕ not in cie. *Pro* = needs `cie-scroll-pro`.

**UI parts — open / layer**: 01 Modal ✅ `dialog` · 02 Drawer ✅ `sheet` · 03 Bottom sheet ✅ `bottom-sheet` · 04 Accordion ✅ `smooth-accordion` · 05 Dropdown ✅ `dropdown-menu` · 06 Tooltip ✅ `tooltip` · 07 Popover ✅ `popover` · 08 Toast ✅ `toast`

**UI parts — choose / switch**: 09 Tabs ✅ `animated-tabs` · 10 Carousel ✅ `carousel` · 11 Toggle switch ✅ `switch` ·
12 Segmented control ✅ `segmented-control` · 13 Filter chips ✅ `chips` · 14 Range slider ✅ `slider` ·
15 Stepper ✅ `stepper` · 16 Pagination ✅ `pagination`

**UI parts — guide / status**: 17 Hamburger ✅ `menu-toggle` (vanilla `data-cie-hamburger`) · 18 Breadcrumbs ✅ `breadcrumb` ·
19 Mega menu ✅ `mega-menu` · 20 Step indicator ✅ `step-indicator` · 21 Skeleton ✅ `skeleton` ·
22 Spinner ✅ `spinner` (spin → check / ×) · 23 Badge ✅ `badge` (`CountBadge`) · 24 Empty state ✅ `empty-state`

**Scroll — entrances**: 01 Fade-in ✅ `Reveal` · 02 Slide-in ✅ `Reveal` · 03 Stagger ✅ `RevealGroup` ·
04 Text reveal ✅ `split-text` · 05 Mask (clip-path) reveal 🆕 `Reveal` variant · 06 Blur-in 🆕 `Reveal` variant
(`--cie-blur-in`) · 07 Typewriter 🆕 · 08 Count-up ✅ `number-ticker`

**Scroll — linked**: 09 Scroll progress 🆕 · 10 Parallax ✅ `parallax` · 11 Scroll zoom ✅ `ScrollExpand` ·
12 Image sequence 🆕 *Pro* · 13 SVG line draw 🆕 · 14 Text fill 🆕 · 15 Background transition ✅ vanilla
`data-cie-theme-morph` (ink ↔ paper only) · 16 Marquee (scroll velocity) 🆕

**Scroll — pin / nav**: 17 Sticky — CSS `position: sticky` · 18 Pin + scrub 🆕 *Pro* · 19 Scrollytelling 🆕 *Pro* ·
20 Card stack 🆕 · 21 Scroll snap — CSS `scroll-snap` · 22 Horizontal scroll 🆕 *Pro* · 23 Hide-on-scroll
header 🆕 · 24 Scrollspy 🆕

**Camera moves** → `camera-stage` 🆕 (pointer / hover) and `camera-scroll` 🆕 *Pro* (scroll):
01 Pan · 02 Tilt · 03 Dolly in · 04 Zoom in · 05 Tracking · 06 Orbit · 07 Crane up · 08 Dolly zoom (vertigo:
foreground and background scale in opposite directions)

**Shooting / time**: 09 Rack focus 🆕 `focus-shift` (blur moves between layers) · 10 Handheld — only as
faint organic drift · 11 FPV ✕ · 12 Dutch angle ✕ · 13 Slow motion / 15 Time-lapse — duration choice, not a
component · 14 Speed ramp = `cieEase.expo` · 16 Freeze frame = the reduced-motion end state

**Transitions** → `cieScene` presets + `scene-transition` 🆕: 17 Jump cut `cut` · 18 Match cut — shared
`layoutId` (as in `expand-card`) · 19 Whip pan `whip` (+ `--cie-whip-blur`) · 20 Cross dissolve `dissolve` ·
21 Wipe `wipe` · 22 Smash cut `smash` · 23 J-cut / 24 L-cut — section sound leads / trails the picture 🆕

### Choosing a renderer (agents: decide per site)

| Need | Use | Registry item |
|---|---|---|
| Static / slow texture, many per page, crisp at any DPR | CSS / SVG | `grid-pattern`, `noise`, `spotlight`, `border-beam` |
| Hundreds–thousands of independent marks with per-frame logic | Canvas 2D | `particles` |
| Per-pixel fields (noise, flow, dither, distortion), full-bleed hero | WebGL | `shader-field` |
| True 3D scenes / models | three.js / R3F (not in registry yet) | — |

Modern phones run one full-screen fragment shader comfortably; the cost is battery and heat, not frames.
So: **one WebGL surface per viewport**, render scale `quality` ≈ 0.5–0.75 for soft fields, and pause off-screen
(all cie atmospheres already do this and honour reduced motion). Stack SVG/CSS layers on top freely.

### Where the patterns come from

Rewritten from scratch on cie tokens + `motion`, after patterns popularised by Aceternity UI (backgrounds,
spotlight, expandable card), Magic UI (border beam, shimmer, particles, number ticker, word rotate),
SmoothUI (reveal, parallax, text effects) and transitions.dev (tab / accordion transitions). No upstream code is vendored.

## Include order (recommended)

```
tokens.css → base.css → scrollbar.css → motion.css → scroll.css → interactions.css
interaction.js (defer)
```

## Do / don’t

- Do: ink/paper only; Outfit + DM Mono; block radius; snappy expo/out; thin scrollbar;
  per-section sound opt-in; honour reduced-motion in CSS **and** JS.
- Don’t: coral/orange accents from older deploys; Inter as primary; drop shadows;
  rainbow loaders; long wobbly springs (short settling springs are fine, see Registry); global site-mute UX for sound;
  chunky scrollbars; heavy parallax; royalty audio files.

## New in 0.4.0

### Animation Replay / Loop (v0.4.2)

**Replay Controls**:
- `data-cie-replay="target-id"` on button triggers replay of animations in target
- `data-cie-replay-target="id"` on container marks replay scope
- Button click removes `.is-in` / `.is-loaded`, forces reflow, re-triggers animations

**Viewport-triggered Animations**:
- `data-cie-viewport-trigger` on section auto-plays animations when scrolled into view
- IntersectionObserver watches entry (10% threshold, -10% bottom margin)
- Doesn't unobserve—allows re-trigger if scrolled away and back
- Combine with replay buttons for manual control

**Pattern**:
```html
<button data-cie-replay="demo-1">↻ Replay</button>
<div id="demo-1" data-cie-replay-target="demo-1" data-cie-viewport-trigger>
  <div data-cie-reveal="rise">Animates on scroll, replay on button</div>
</div>
```

Use for:
- Animation galleries where user might miss first play
- Looping ambient samples (organic motion already loops via CSS)
- Teaching/demo sections where replay helps comprehension

### Sound Modes (v0.4.2)

**Two Section Types**:

1. **Hover + Click** (original):
   - Add `data-cie-hover-sfx` to section
   - Plays on hover AND click/activate
   - Good for rich interaction feedback

2. **Click Only** (new):
   - Omit `data-cie-hover-sfx`
   - Sound ONLY on click/activate, never on hover
   - Reduces noise for users who find hover SFX distracting
   - Same preset system, toggle, test button
   - Gain 0.4 (clearly audible)

Both modes:
- Per-section toggle (not global mute)
- Immediate test beep on toggle ON
- Preset picker (5 options, localStorage-persisted)
- Robust unlock with retry (v0.4.1 fix)
- Click/confirm/cycle always play when armed (not gated by `prefers-reduced-motion`)
- Only hover SFX respects reduced-motion preference

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
- **v0.4.2**: Multi-stop interpolation with plateau effect
- JS sets concrete hex colors via smooth lerp
- **Color stops**: ink → grey → **white** → grey → ink (5 stops, 0/0.25/0.5/0.75/1)
- Smooth gradient between each stop (ease in-out cubic for plateau feel)
- Text/controls invert automatically via `--cie-theme-fg` / `--cie-theme-bg`
- Contrast-safe at every scroll position
- Optional subtle layer parallax (`data-cie-parallax`) inside theme sections
- See `parallax.html` for extended 1100vh journey with UI-rich sections

**v0.4.2 enhancements**:
- Multi-stop color sequence (not just ink → paper)
- White middle plateau sandwiched by greys
- Easing between stops for gradual zone transitions
- Much longer scroll (~1100vh vs. ~400vh)
- Real UI components throughout (cards, buttons, chips, text samples)

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
- `registry.json` + `registry/cie/` — shadcn registry source → `/r/*.json`  
- `preview/` — React registry preview → `/registry`  

License: proprietary (see `LICENSE`). Internal use only.
