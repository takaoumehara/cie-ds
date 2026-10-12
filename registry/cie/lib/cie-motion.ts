// Generated from tokens.json by scripts/sync-tokens.mjs — do not edit by hand.
// cie-ds motion language for `motion/react`: snappy にゅるっと (expands land in 280–420ms).
import type { Transition } from "motion/react"

type Bezier = [number, number, number, number]

export const cieEase = {
  /** Decisive settle / expand */
  expo: [0.76,0,0.18,1] as Bezier,
  /** Rise, soft land */
  out: [0.16,1,0.3,1] as Bezier,
  /** Subtle overshoot */
  snap: [0.34,1.22,0.64,1] as Bezier,
}

/** Seconds (motion uses seconds, CSS tokens use ms). */
export const cieDuration = {
  snap: 0.12,
  fast: 0.18,
  cell: 0.32,
  move: 0.36,
  rise: 0.4,
  sheet: 0.3,
  stagger: 0.024,
  scene: 0.42,
}

export const cieTransition = {
  snap: { duration: cieDuration.snap, ease: cieEase.out },
  fast: { duration: cieDuration.fast, ease: cieEase.out },
  cell: { duration: cieDuration.cell, ease: cieEase.expo },
  move: { duration: cieDuration.move, ease: cieEase.expo },
  rise: { duration: cieDuration.rise, ease: cieEase.out },
  sheet: { duration: cieDuration.sheet, ease: cieEase.expo },
  /** Physical follow-through for drags, magnets and layout pills. Settles ≈ 350ms. */
  spring: { type: "spring", stiffness: 520, damping: 40, mass: 0.8 },
  /** Gentle spring for cursor-follow / parallax smoothing. */
  follow: { type: "spring", stiffness: 160, damping: 28, mass: 0.6 },
} satisfies Record<string, Transition>

/**
 * Scene transitions, named after film cuts (DESIGN.md → Motion vocabulary).
 * Pair with AnimatePresence; blur amounts are in cieBlur.
 */
export const cieScene = {
  /** Jump cut — swap instantly. Also the reduced-motion fallback for every scene transition. */
  cut: { duration: 0 },
  /** Cross dissolve — overlap and fade. */
  dissolve: { duration: cieDuration.cell, ease: cieEase.out },
  /** Whip pan — fast slide with horizontal blur (cieBlur.whip). */
  whip: { duration: cieDuration.move, ease: cieEase.expo },
  /** Wipe — a clip-path edge sweeps across. */
  wipe: { duration: cieDuration.scene, ease: cieEase.expo },
  /** Smash cut — still, then a sudden scaled hit. */
  smash: { duration: cieDuration.snap, ease: cieEase.snap },
} satisfies Record<string, Transition>

/** px */
export const cieBlur = {
  /** Blur-in reveal / rack focus start */
  in: 8,
  /** Peak horizontal blur during a whip pan */
  whip: 12,
}

export const cieScroll = {
  revealY: 22,
  revealX: 14,
  parallaxMax: 48,
  pressScale: 0.97,
  hoverNudge: 3,
}
