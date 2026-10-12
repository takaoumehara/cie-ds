"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { cieGsapEase, gsap, useCieGsap } from "@/lib/cie-gsap"
import { onThemeChange, readGroundColor, readTextColor, toCss } from "@/lib/cie-color"

// Pro · Image sequence (Apple product-page lineage, GSAP ScrollTrigger via cie-gsap).
// A canvas frame sequence scrubbed by scroll: the stage pins for `distance` and progress 0 → 1 picks
// the frame. Frames come from `frames` (urls) or `frameCount` + `src(i)`; they are preloaded and drawn
// with object-fit: cover math on a DPR-aware canvas. Without assets, pass `render(ctx, progress, w, h, ink)`
// and draw procedurally — `ink.fg` / `ink.bg` are the theme's two inks (cie-color), re-read on theme change.
// Reduced motion: no pin, no scrub — the last frame is drawn once (freeze frame).

/** position: fixed breaks inside a transformed / filtered ancestor — fall back to transform pinning there. */
function pinTypeFor(el: HTMLElement): "fixed" | "transform" {
  for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
    const s = getComputedStyle(n)
    if (
      s.transform !== "none" ||
      s.filter !== "none" ||
      s.perspective !== "none" ||
      (s.getPropertyValue("backdrop-filter") || "none") !== "none" ||
      /paint|layout|strict|content/.test(s.contain) ||
      /transform|filter|perspective/.test(s.willChange)
    )
      return "transform"
  }
  return "fixed"
}

type ImageSequenceInk = { fg: string; bg: string }

type ImageSequenceProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Frame urls, in order. */
  frames?: string[]
  /** Frame count, with `src(i)` building each url. */
  frameCount?: number
  src?: (index: number) => string
  /** Procedural fallback: draw the frame yourself. Canvas is already DPR-scaled; w / h are CSS px. */
  render?: (ctx: CanvasRenderingContext2D, progress: number, w: number, h: number, ink: ImageSequenceInk) => void
  /** Pinned scroll length, relative to the viewport height ("200%") or in px. */
  distance?: string
  /** true = 1:1 with scroll, a number = seconds of catch-up smoothing. */
  scrub?: boolean | number
  /** Accessible description of what the sequence shows. */
  label?: string
  /** Overlay content above the canvas. */
  children?: React.ReactNode
}

function ImageSequence({
  frames,
  frameCount,
  src,
  render,
  distance = "200%",
  scrub = 0.4,
  label,
  className,
  children,
  ...props
}: ImageSequenceProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const progress = React.useRef(0)
  const images = React.useRef<HTMLImageElement[]>([])
  const ink = React.useRef<ImageSequenceInk>({ fg: "currentColor", bg: "transparent" })
  const size = React.useRef({ w: 0, h: 0 })
  const renderRef = React.useRef(render)
  renderRef.current = render

  const urls = React.useMemo(
    () => frames ?? (frameCount && src ? Array.from({ length: frameCount }, (_, i) => src(i)) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [frames, frameCount]
  )

  const draw = React.useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    const { w, h } = size.current
    if (!canvas || !ctx || !w || !h) return
    ctx.clearRect(0, 0, w, h)
    const p = progress.current
    if (renderRef.current) {
      renderRef.current(ctx, p, w, h, ink.current)
      return
    }
    const list = images.current
    if (!list.length) return
    // Nearest loaded frame at or before the target, so a slow network never shows a blank.
    let i = Math.min(list.length - 1, Math.round(p * (list.length - 1)))
    while (i > 0 && !(list[i].complete && list[i].naturalWidth)) i--
    const img = list[i]
    if (!img.complete || !img.naturalWidth) return
    const s = Math.max(w / img.naturalWidth, h / img.naturalHeight) // object-fit: cover
    const dw = img.naturalWidth * s
    const dh = img.naturalHeight * s
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
  }, [])

  // Preload frames.
  React.useEffect(() => {
    images.current = urls.map((url) => {
      const img = new Image()
      img.decoding = "async"
      img.onload = draw
      img.src = url
      return img
    })
    draw()
    return () => {
      images.current.forEach((img) => (img.onload = null))
      images.current = []
    }
  }, [urls, draw])

  // DPR-aware sizing + theme inks.
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const readInk = () => {
      ink.current = { fg: toCss(readTextColor(canvas)), bg: toCss(readGroundColor(canvas)) }
      draw()
    }
    const resize = () => {
      const r = canvas.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      size.current = { w: r.width, h: r.height }
      canvas.width = Math.round(r.width * dpr)
      canvas.height = Math.round(r.height * dpr)
      canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0)
      draw()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()
    readInk()
    const off = onThemeChange(() => requestAnimationFrame(readInk))
    return () => {
      ro.disconnect()
      off()
    }
  }, [draw])

  useCieGsap(
    ref,
    ({ reduced }) => {
      const el = ref.current
      if (!el) return
      if (reduced) {
        progress.current = 1 // freeze frame: the last frame, no pin
        draw()
        return
      }
      const state = { p: 0 }
      progress.current = 0
      draw()
      gsap.to(state, {
        p: 1,
        ease: cieGsapEase.scrub,
        onUpdate: () => {
          progress.current = state.p
          draw()
        },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: `+=${distance}`,
          pin: true,
          pinType: pinTypeFor(el),
          scrub,
          invalidateOnRefresh: true,
        },
      })
    },
    [distance, scrub]
  )

  return (
    <div
      ref={ref}
      data-slot="image-sequence"
      className={cn("relative h-svh w-full overflow-hidden text-foreground", className)}
      {...props}
    >
      <canvas
        ref={canvasRef}
        data-slot="image-sequence-canvas"
        role="img"
        aria-label={label}
        aria-hidden={label ? undefined : true}
        className="absolute inset-0 size-full"
      />
      {children}
    </div>
  )
}

export { ImageSequence, type ImageSequenceInk }
