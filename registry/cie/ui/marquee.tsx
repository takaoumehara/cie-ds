"use client"

import * as React from "react"
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react"

import { cn } from "@/lib/utils"
import { cieTransition } from "@/lib/cie-motion"

// Scroll · Marquee (motion "scroll velocity" lineage).
// Children are repeated `repeat` times in one track; useAnimationFrame moves it `baseVelocity` % of one copy
// per second and wraps seamlessly. Page scroll velocity (useVelocity(scrollY) → cieTransition.follow spring)
// multiplies the speed, and scrolling up flips the direction. `pauseOnHover` holds it under the pointer.
// Reduced motion: static — the first copy sits still, no loop, no scroll coupling.

type MarqueeProps = React.ComponentProps<"div"> & {
  /** % of one copy per second. Negative runs left → right. */
  baseVelocity?: number
  pauseOnHover?: boolean
  /** How many copies make up the track (enough to fill the width twice). */
  repeat?: number
  /** Extra speed per 1000px/s of scroll velocity. 0 = ignore scroll. */
  scrollFactor?: number
}

const { stiffness, damping, mass } = cieTransition.follow

function Marquee({
  baseVelocity = 6,
  pauseOnHover = false,
  repeat = 4,
  scrollFactor = 4,
  className,
  children,
  onPointerEnter,
  onPointerLeave,
  ...props
}: MarqueeProps) {
  const reduce = useReducedMotion()
  const progress = useMotionValue(0) // copies travelled, wrapped to [0, 1)
  const { scrollY } = useScroll()
  const velocity = useSpring(useVelocity(scrollY), { stiffness, damping, mass })
  const factor = useTransform(velocity, [0, 1000], [0, scrollFactor], { clamp: false })
  const direction = React.useRef(1)
  const hovered = React.useRef(false)
  const x = useTransform(progress, (v) => `${(-v * 100) / repeat}%`)

  useAnimationFrame((_, delta) => {
    if (reduce || (pauseOnHover && hovered.current)) return
    const f = factor.get()
    if (f < 0) direction.current = -1
    else if (f > 0) direction.current = 1
    let move = direction.current * baseVelocity * (delta / 1000)
    move += direction.current * move * f
    const next = (progress.get() + move / 100) % 1
    progress.set(next < 0 ? next + 1 : next)
  })

  return (
    <div
      data-slot="marquee"
      className={cn("relative flex w-full overflow-hidden", className)}
      onPointerEnter={(e) => {
        hovered.current = true
        onPointerEnter?.(e)
      }}
      onPointerLeave={(e) => {
        hovered.current = false
        onPointerLeave?.(e)
      }}
      {...props}
    >
      <motion.div
        data-slot="marquee-track"
        className="flex w-max shrink-0 flex-nowrap will-change-transform"
        style={reduce ? undefined : { x }}
      >
        {Array.from({ length: repeat }, (_, i) => (
          <div
            key={i}
            data-slot="marquee-item"
            aria-hidden={i > 0 || undefined}
            className="flex shrink-0 flex-nowrap items-center"
          >
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export { Marquee }
