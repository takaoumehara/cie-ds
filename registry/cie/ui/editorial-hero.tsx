import * as React from "react"

import { cn } from "@/lib/utils"
import { Kicker } from "@/components/ui/layout"
import { Reveal } from "@/components/ui/reveal"

// Layout · EditorialHero (ElevenLabs asymmetric hero × Apple product-page hero, cie "editorial" tokens).
// variant="split" (default): on md+ a 12-column grid — kicker + whisper display headline across ~7 columns,
//   the lead (text-lead, muted) in the last ~4, aligned to the headline's LAST baseline; pill actions below
//   the headline. Stacks kicker → headline → lead → actions on mobile.
// variant="center": Apple style — kicker, huge centred headline, lead, actions, then the `media` slot full width.
// `animate` wraps each piece in <Reveal> (rise, 60ms apart); otherwise fully static and server-friendly.
// Reduced motion: Reveal renders shown, no movement.

type EditorialHeroProps = Omit<React.ComponentProps<"div">, "title"> & {
  kicker?: React.ReactNode
  title: React.ReactNode
  lead?: React.ReactNode
  /** Pills (Buttons) under the headline. */
  actions?: React.ReactNode
  /** Large visual below (full width). Usually a <MediaFrame>. */
  media?: React.ReactNode
  variant?: "split" | "center"
  /** Rise the pieces in on first view (uses Reveal). */
  animate?: boolean
  /** Heading level. */
  as?: "h1" | "h2"
}

function Piece({
  animate,
  index,
  className,
  children,
  slot,
}: {
  animate: boolean
  index: number
  className?: string
  children: React.ReactNode
  slot: string
}) {
  if (animate)
    return (
      <Reveal data-slot={slot} delay={index * 0.06} className={className}>
        {children}
      </Reveal>
    )
  return (
    <div data-slot={slot} className={className}>
      {children}
    </div>
  )
}

const has = (n: React.ReactNode) => n != null && n !== false

function EditorialHero({
  kicker,
  title,
  lead,
  actions,
  media,
  variant = "split",
  animate = false,
  as: Heading = "h1",
  className,
  ...props
}: EditorialHeroProps) {
  let i = 0
  const actionsRow = (
    <div data-slot="editorial-hero-actions-row" className="flex flex-wrap items-center gap-3">
      {actions}
    </div>
  )

  if (variant === "center") {
    return (
      <div
        data-slot="editorial-hero"
        data-variant="center"
        className={cn("flex flex-col items-center text-center", className)}
        {...props}
      >
        {has(kicker) && (
          <Piece animate={animate} index={i++} slot="editorial-hero-kicker" className="mb-[var(--cie-gap-lg)]">
            <Kicker>{kicker}</Kicker>
          </Piece>
        )}
        <Piece animate={animate} index={i++} slot="editorial-hero-title" className="max-w-[18ch]">
          <Heading className="text-[length:clamp(48px,8vw,108px)] leading-[1.02] font-[300] tracking-[-0.03em] text-balance">
            {title}
          </Heading>
        </Piece>
        {has(lead) && (
          <Piece
            animate={animate}
            index={i++}
            slot="editorial-hero-lead"
            className="mt-[var(--cie-gap-lg)] max-w-[min(var(--cie-measure,62ch),44rem)]"
          >
            <p className="text-lead text-pretty text-muted-foreground">{lead}</p>
          </Piece>
        )}
        {has(actions) && (
          <Piece
            animate={animate}
            index={i++}
            slot="editorial-hero-actions"
            className="mt-[calc(var(--cie-gap-lg)*1.5)] [&>[data-slot=editorial-hero-actions-row]]:justify-center"
          >
            {actionsRow}
          </Piece>
        )}
        {has(media) && (
          <Piece
            animate={animate}
            index={i++}
            slot="editorial-hero-media"
            className="mt-[calc(var(--cie-gap-lg)*3)] w-full text-left"
          >
            {media}
          </Piece>
        )}
      </div>
    )
  }

  return (
    <div
      data-slot="editorial-hero"
      data-variant="split"
      className={cn("grid grid-cols-1 md:grid-cols-12 md:gap-x-[var(--cie-gap-lg)]", className)}
      {...props}
    >
      {has(kicker) && (
        <Piece
          animate={animate}
          index={i++}
          slot="editorial-hero-kicker"
          className="mb-[var(--cie-gap-lg)] md:col-span-7 md:col-start-1 md:row-start-1"
        >
          <Kicker>{kicker}</Kicker>
        </Piece>
      )}
      <Piece
        animate={animate}
        index={i++}
        slot="editorial-hero-title"
        className="md:col-span-7 md:col-start-1 md:row-start-2 md:self-baseline-last"
      >
        <Heading className="max-w-[16ch] text-display text-balance">{title}</Heading>
      </Piece>
      {has(lead) && (
        <Piece
          animate={animate}
          index={i++}
          slot="editorial-hero-lead"
          className="mt-[var(--cie-gap-lg)] max-w-[var(--cie-measure,62ch)] md:col-span-4 md:col-start-9 md:row-start-2 md:mt-0 md:self-baseline-last"
        >
          <p className="text-lead text-pretty text-muted-foreground">{lead}</p>
        </Piece>
      )}
      {has(actions) && (
        <Piece
          animate={animate}
          index={i++}
          slot="editorial-hero-actions"
          className="mt-[calc(var(--cie-gap-lg)*1.5)] md:col-span-7 md:col-start-1 md:row-start-3"
        >
          {actionsRow}
        </Piece>
      )}
      {has(media) && (
        <Piece
          animate={animate}
          index={i++}
          slot="editorial-hero-media"
          className="mt-[calc(var(--cie-gap-lg)*3)] md:col-span-12 md:col-start-1 md:row-start-4"
        >
          {media}
        </Piece>
      )}
    </div>
  )
}

export { EditorialHero }
export type { EditorialHeroProps }
