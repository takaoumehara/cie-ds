"use client"

import * as React from "react"
import { useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { onThemeChange, readTextColor, toCss } from "@/lib/cie-color"

// Atmosphere · Canvas 2D particle field (Aceternity Sparkles / Magic UI Particles lineage).
// Drifting specks that ease away from the cursor and twinkle. Colour comes from the
// element's text colour (default text-foreground) and follows theme changes.
// Pauses off-screen; renders a single still frame under prefers-reduced-motion.

type ParticlesProps = React.ComponentProps<"div"> & {
  /** Particles per 10 000 px² — scales with the element. */
  density?: number
  /** Max particle radius in px. */
  size?: number
  /** Drift speed multiplier. */
  speed?: number
  /** Cursor influence radius in px (0 = off). Negative attracts. */
  repel?: number
  twinkle?: boolean
}

type P = { x: number; y: number; vx: number; vy: number; r: number; a: number; phase: number; ox: number; oy: number }

function Particles({
  density = 1.2,
  size = 1.6,
  speed = 1,
  repel = 120,
  twinkle = true,
  className,
  ...props
}: ParticlesProps) {
  const wrap = React.useRef<HTMLDivElement>(null)
  const canvas = React.useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()

  React.useEffect(() => {
    const el = wrap.current
    const cv = canvas.current
    const ctx = cv?.getContext("2d")
    if (!el || !cv || !ctx) return

    let w = 0
    let h = 0
    let dpr = 1
    let ps: P[] = []
    let color = readTextColor(el)
    let raf = 0
    let visible = true
    const mouse = { x: -9999, y: -9999 }

    const seed = () => {
      const n = Math.round(((w * h) / 10000) * density)
      ps = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15 * speed,
        vy: (Math.random() - 0.5) * 0.15 * speed - 0.05 * speed,
        r: 0.4 + Math.random() * (size - 0.4),
        a: 0.25 + Math.random() * 0.75,
        phase: Math.random() * Math.PI * 2,
        ox: 0,
        oy: 0,
      }))
    }

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = el.clientWidth
      h = el.clientHeight
      cv.width = Math.max(1, w * dpr)
      cv.height = Math.max(1, h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed()
      draw(0)
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h)
      for (const p of ps) {
        const flicker = twinkle && !reduce ? 0.55 + 0.45 * Math.sin(t * 0.0018 + p.phase) : 1
        ctx.fillStyle = toCss(color, p.a * flicker)
        ctx.beginPath()
        ctx.arc(p.x + p.ox, p.y + p.oy, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const step = (t: number) => {
      for (const p of ps) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < -4) p.x = w + 4
        if (p.x > w + 4) p.x = -4
        if (p.y < -4) p.y = h + 4
        if (p.y > h + 4) p.y = -4
        // cursor field — eased offset so specks glide back (expo-ish settle)
        let tx = 0
        let ty = 0
        if (repel !== 0) {
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const d = Math.hypot(dx, dy)
          const R = Math.abs(repel)
          if (d < R && d > 0.01) {
            const f = (1 - d / R) ** 2 * 36 * Math.sign(repel)
            tx = (dx / d) * f
            ty = (dy / d) * f
          }
        }
        p.ox += (tx - p.ox) * 0.12
        p.oy += (ty - p.oy) * 0.12
      }
      draw(t)
      raf = requestAnimationFrame(step)
    }

    const start = () => {
      cancelAnimationFrame(raf)
      if (!reduce && visible) raf = requestAnimationFrame(step)
    }

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
    }
    const onLeave = () => {
      mouse.x = mouse.y = -9999
    }

    const ro = new ResizeObserver(resize)
    ro.observe(el)
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start()
      else cancelAnimationFrame(raf)
    })
    io.observe(el)
    const offTheme = onThemeChange(() => {
      color = readTextColor(el)
      draw(performance.now())
    })
    window.addEventListener("pointermove", onMove, { passive: true })
    document.addEventListener("pointerleave", onLeave)
    resize()
    start()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      offTheme()
      window.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerleave", onLeave)
    }
  }, [density, size, speed, repel, twinkle, reduce])

  return (
    <div
      ref={wrap}
      aria-hidden="true"
      data-slot="particles"
      className={cn("pointer-events-none absolute inset-0 text-foreground", className)}
      {...props}
    >
      <canvas ref={canvas} className="block size-full" />
    </div>
  )
}

export { Particles }
