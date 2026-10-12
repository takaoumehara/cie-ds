"use client"

import * as React from "react"
import { motion, useInView, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { cieDuration } from "@/lib/cie-motion"

// Scroll · Typewriter (Magic UI / Aceternity typewriter lineage), scroll entrance 07.
// Types `text` one glyph at a time once it scrolls into view, with a 1px ink caret that
// blinks in hard steps while idle (solid while typing). `words` mode types a word, holds,
// deletes it and types the next — looping. Screen readers get the full text at once
// (aria-label on the wrapper; typed glyphs and caret are aria-hidden).
// Reduced motion: the full text renders instantly; the caret (if any) stays still.

type TypewriterProps = Omit<React.HTMLAttributes<HTMLElement>, "children"> & {
  /** Text to type once. Ignored when `words` is given. */
  text?: string
  /** Loop through these: type → hold → delete → next. */
  words?: string[]
  /** Characters per second while typing (deleting runs at 2×). */
  speed?: number
  /** Seconds before typing starts (after entering the viewport). */
  delay?: number
  /** Seconds a word stays fully typed in `words` mode. */
  hold?: number
  /** Show the blinking caret. */
  caret?: boolean
  as?: "span" | "p" | "h1" | "h2" | "h3" | "div"
}

function Typewriter({
  text = "",
  words,
  speed = 28,
  delay = 0,
  hold = 1.6,
  caret = true,
  as = "span",
  className,
  ...props
}: TypewriterProps) {
  const ref = React.useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()
  const Tag = as as React.ElementType
  const list = words && words.length > 0 ? words : null

  const [index, setIndex] = React.useState(0)
  const [count, setCount] = React.useState(0)
  const [phase, setPhase] = React.useState<"wait" | "type" | "hold" | "delete" | "done">("wait")
  const target = list ? list[index % list.length] : text

  // Start after `delay` once in view.
  React.useEffect(() => {
    if (!inView || reduce || phase !== "wait") return
    const t = setTimeout(() => setPhase("type"), delay * 1000)
    return () => clearTimeout(t)
  }, [inView, reduce, phase, delay])

  React.useEffect(() => {
    if (reduce) return
    const step = 1000 / Math.max(1, speed)
    let t: ReturnType<typeof setTimeout> | undefined
    if (phase === "type") {
      if (count < target.length) t = setTimeout(() => setCount((c) => c + 1), step)
      else setPhase(list ? "hold" : "done")
    } else if (phase === "hold") {
      t = setTimeout(() => setPhase("delete"), hold * 1000)
    } else if (phase === "delete") {
      if (count > 0) t = setTimeout(() => setCount((c) => c - 1), step / 2)
      else {
        t = setTimeout(() => {
          setIndex((i) => i + 1)
          setPhase("type")
        }, cieDuration.move * 1000)
      }
    }
    return () => clearTimeout(t)
  }, [phase, count, target, speed, hold, list, reduce])

  const shown = reduce ? (list ? list[0] : text) : target.slice(0, count)
  const typing = phase === "type" || phase === "delete"
  const label = list ? list.join(", ") : text

  return (
    <Tag ref={ref} data-slot="typewriter" aria-label={label} className={cn("inline", className)} {...props}>
      <span data-slot="typewriter-text" aria-hidden className="whitespace-pre-wrap">
        {shown}
      </span>
      {caret && (
        <motion.span
          data-slot="typewriter-caret"
          aria-hidden
          className="ml-[0.06em] inline-block h-[1em] w-px translate-y-[0.12em] bg-foreground align-baseline"
          animate={reduce || typing ? { opacity: 1 } : { opacity: [1, 1, 0, 0] }}
          transition={
            reduce || typing
              ? { duration: 0 }
              : { duration: 1.06, times: [0, 0.5, 0.5, 1], ease: "linear", repeat: Infinity }
          }
        />
      )}
    </Tag>
  )
}

export { Typewriter }
