"use client"

import * as React from "react"
import { animate, motion, MotionConfig, useMotionValue, useReducedMotion, type PanInfo } from "motion/react"
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { cieTransition } from "@/lib/cie-motion"

// UI · Carousel (Embla / shadcn lineage, no extra deps). A motion track you can drag on x;
// on release it snaps to the nearest slide (distance + flick velocity) on cieTransition.spring.
// - Prev/next round buttons; dot indicators where the active dot stretches into a short pill
//   (layout animation, spring). ArrowLeft/Right on the focused region. `loop` wraps at the ends.
// - region aria-roledescription="carousel"; each slide is a group "n of total".
// Reduced motion: snaps are instant jumps and the dot swaps without stretching.

const GAP = 12 // px — matches gap-3 on the track

const SlideCtx = React.createContext<{ index: number; total: number; active: boolean }>({
  index: 0,
  total: 0,
  active: true,
})

type CarouselProps = React.ComponentProps<"section"> & {
  loop?: boolean
  /** Accessible name for the region. */
  label?: string
}

function Carousel({ loop = false, label = "Carousel", className, children, onKeyDown, ...props }: CarouselProps) {
  const slides = React.Children.toArray(children).filter(React.isValidElement)
  const total = slides.length
  const [index, setIndex] = React.useState(0)
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const [stepPx, setStepPx] = React.useState(0)
  const x = useMotionValue(0)
  const reduce = useReducedMotion()
  const id = React.useId()

  React.useLayoutEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setStepPx(el.offsetWidth + GAP))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Snap whenever index or size changes. Resize snaps instantly.
  const lastStep = React.useRef(stepPx)
  React.useEffect(() => {
    const target = -index * stepPx
    if (reduce || lastStep.current !== stepPx) {
      lastStep.current = stepPx
      x.set(target)
      return
    }
    const controls = animate(x, target, cieTransition.spring)
    return () => controls.stop()
  }, [index, stepPx, reduce, x])

  const go = React.useCallback(
    (next: number) => {
      if (total === 0) return
      if (loop) setIndex(((next % total) + total) % total)
      else setIndex(Math.min(Math.max(next, 0), total - 1))
    },
    [loop, total]
  )

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = stepPx * 0.2
    const flick = Math.abs(info.velocity.x) > 400
    let next = index
    if (info.offset.x < -threshold || (flick && info.velocity.x < 0)) next = index + 1
    else if (info.offset.x > threshold || (flick && info.velocity.x > 0)) next = index - 1
    next = Math.min(Math.max(next, 0), total - 1)
    if (next === index) animate(x, -index * stepPx, reduce ? { duration: 0 } : cieTransition.spring)
    else setIndex(next)
  }

  const canPrev = loop || index > 0
  const canNext = loop || index < total - 1

  return (
    <MotionConfig reducedMotion={reduce ? "always" : "never"}>
      <section
        data-slot="carousel"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={0}
        onKeyDown={(e) => {
          onKeyDown?.(e)
          if (e.defaultPrevented) return
          if (e.key === "ArrowLeft") go(index - 1)
          else if (e.key === "ArrowRight") go(index + 1)
          else return
          e.preventDefault()
        }}
        className={cn(
          "flex w-full flex-col gap-4 rounded-[var(--cie-r)] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
          className
        )}
        {...props}
      >
        <div data-slot="carousel-viewport" id={id} ref={viewportRef} className="overflow-hidden">
          <motion.div
            data-slot="carousel-track"
            className="flex cursor-grab gap-3 touch-pan-y active:cursor-grabbing"
            style={{ x }}
            drag="x"
            dragConstraints={{ left: -(total - 1) * stepPx, right: 0 }}
            dragElastic={0.12}
            dragMomentum={false}
            onDragEnd={onDragEnd}
          >
            {slides.map((child, i) => (
              <SlideCtx.Provider key={child.key ?? i} value={{ index: i, total, active: i === index }}>
                {child}
              </SlideCtx.Provider>
            ))}
          </motion.div>
        </div>
        <div data-slot="carousel-controls" className="flex items-center justify-between gap-4">
          <div data-slot="carousel-dots" className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                data-slot="carousel-dot"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                tabIndex={-1}
                onClick={() => go(i)}
                className="group/dot inline-flex h-4 items-center rounded-full outline-none"
              >
                <motion.span
                  layout
                  transition={cieTransition.spring}
                  className={cn(
                    "block h-1.5 rounded-full transition-colors duration-[var(--cie-t-cell,320ms)] ease-cie-expo",
                    i === index ? "w-5 bg-primary" : "w-1.5 bg-foreground/20 group-hover/dot:bg-foreground/40"
                  )}
                />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <CarouselButton
              aria-label="Previous slide"
              aria-controls={id}
              disabled={!canPrev}
              onClick={() => go(index - 1)}
            >
              <ArrowLeftIcon />
            </CarouselButton>
            <CarouselButton
              aria-label="Next slide"
              aria-controls={id}
              disabled={!canNext}
              onClick={() => go(index + 1)}
            >
              <ArrowRightIcon />
            </CarouselButton>
          </div>
        </div>
        <span data-slot="carousel-status" className="sr-only" aria-live="polite">
          {`Slide ${index + 1} of ${total}`}
        </span>
      </section>
    </MotionConfig>
  )
}

function CarouselButton({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="carousel-button"
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full border border-border text-foreground",
        "transition-[background-color,border-color,scale,opacity] duration-[var(--cie-t-cell,320ms)] ease-cie-expo",
        "hover:border-foreground/40 hover:bg-accent active:scale-[var(--cie-press-scale,0.97)] active:duration-[var(--cie-t-snap,120ms)] motion-reduce:active:scale-100",
        "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40",
        "[&_svg]:pointer-events-none [&_svg]:size-4",
        className
      )}
      {...props}
    />
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { index, total, active } = React.useContext(SlideCtx)
  return (
    <div
      data-slot="carousel-item"
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${total}`}
      aria-hidden={!active || undefined}
      inert={!active || undefined}
      className={cn("min-w-0 shrink-0 grow-0 basis-full select-none", className)}
      {...props}
    />
  )
}

export { Carousel, CarouselItem }
