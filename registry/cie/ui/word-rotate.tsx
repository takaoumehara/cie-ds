"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { cieDuration, cieEase, cieTransition } from "@/lib/cie-motion"

// Showcase · Rotating word (SmoothUI Rotating Text / Magic UI Word Rotate lineage).
// The slot's width glides between words (layout spring) while the word rolls up
// through a mask on --cie-ease-expo. Announces politely to screen readers.

type WordRotateProps = Omit<React.ComponentProps<"span">, "children"> & {
  words: string[]
  /** Seconds each word stays. */
  interval?: number
}

function WordRotate({ words, interval = 2.4, className, ...props }: WordRotateProps) {
  const [i, setI] = React.useState(0)
  const reduce = useReducedMotion()
  React.useEffect(() => {
    if (words.length < 2) return
    const t = setInterval(() => setI((n) => (n + 1) % words.length), interval * 1000)
    return () => clearInterval(t)
  }, [words.length, interval])

  return (
    <motion.span
      layout={!reduce}
      transition={cieTransition.spring}
      data-slot="word-rotate"
      className={cn("relative inline-flex overflow-hidden align-bottom", className)}
      aria-live="polite"
      {...(props as React.ComponentProps<typeof motion.span>)}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={words[i]}
          className="inline-block whitespace-nowrap"
          initial={reduce ? { opacity: 0 } : { y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: "-100%", opacity: 0 }}
          transition={{ duration: cieDuration.move * 1.4, ease: cieEase.expo }}
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  )
}

export { WordRotate }
