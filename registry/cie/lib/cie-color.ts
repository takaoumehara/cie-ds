// Resolve any CSS colour (hex, rgb, oklab, color-mix(), var(--token)…) to RGBA 0–1,
// so Canvas / WebGL effects can follow the cie theme instead of hard-coded hex.
"use client"

let probe: CanvasRenderingContext2D | null = null

export type RGBA = [number, number, number, number]

export function resolveCssColor(color: string, fallback: RGBA = [0.5, 0.5, 0.5, 1]): RGBA {
  if (typeof document === "undefined") return fallback
  probe ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true })
  if (!probe) return fallback
  probe.clearRect(0, 0, 1, 1)
  probe.fillStyle = "transparent"
  probe.fillStyle = color // invalid strings are ignored by the canvas
  probe.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data
  return [r / 255, g / 255, b / 255, a / 255]
}

/** Read an element's computed `color` (set it with `text-foreground`, `text-primary`…). */
export function readTextColor(el: Element) {
  return resolveCssColor(getComputedStyle(el).color)
}

/** Read an element's computed background colour, walking up until it is not transparent. */
export function readGroundColor(el: Element | null): RGBA {
  let node: Element | null = el
  while (node) {
    const c = resolveCssColor(getComputedStyle(node).backgroundColor, [0, 0, 0, 0])
    if (c[3] > 0) return c
    node = node.parentElement
  }
  return resolveCssColor(getComputedStyle(document.body).backgroundColor)
}

/** Call `fn` whenever the theme might have changed (class / style / data-theme on <html>, or OS scheme). */
export function onThemeChange(fn: () => void) {
  const mo = new MutationObserver(fn)
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] })
  const mq = window.matchMedia("(prefers-color-scheme: dark)")
  mq.addEventListener("change", fn)
  return () => {
    mo.disconnect()
    mq.removeEventListener("change", fn)
  }
}

export const toCss = ([r, g, b]: RGBA, alpha = 1) =>
  `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`
