import * as React from "react"
import { ArrowRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Kicker } from "@/components/ui/layout"
import { MediaFrame } from "@/components/ui/media-frame"

// Layout · FeatureCard + FeatureGrid (ElevenLabs flat card × Apple media card lineage, cie "editorial" tokens).
// A flat surface — rounded-card (20px), p-card, no border, no shadow — holding kicker → whisper title (300, -0.02em)
// → muted description, with optional media in a MediaFrame pinned to the bottom (`mediaBleed` runs it to the card
// edges). `surface` picks the ground: "band" (default, on canvas), "canvas" (on a band section) or "plate".
// With `href` the whole card is one link: on hover the surface steps one tone deeper and the → nudges
// --cie-hover-nudge, both on --cie-t-cell / expo. FeatureGrid = responsive 1 / 2 / 3 columns, --cie-gap-lg apart.
// Static, server-friendly. Reduced motion: colour change only, no arrow movement.

const surfaceClass = {
  band: "bg-band",
  canvas: "bg-background",
  plate: "bg-plate",
} as const

// One step deeper on hover (link cards only).
const surfaceHover = {
  band: "hover:bg-plate",
  canvas: "hover:bg-band",
  plate: "hover:bg-[color-mix(in_oklab,var(--foreground)_10%,var(--background))]",
} as const

type FeatureCardProps = Omit<React.ComponentProps<"div">, "title" | "ref"> & {
  kicker?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  /** Rendered inside a MediaFrame at the bottom of the card. */
  media?: React.ReactNode
  /** MediaFrame aspect ratio. */
  mediaRatio?: string
  /** Let the media run to the card's side and bottom edges. */
  mediaBleed?: boolean
  surface?: keyof typeof surfaceClass
  /** Turns the whole card into a link. */
  href?: string
  target?: string
  rel?: string
  /** Heading level for the title. */
  as?: "h2" | "h3" | "h4"
}

function FeatureCard({
  kicker,
  title,
  description,
  media,
  mediaRatio = "4/3",
  mediaBleed = false,
  surface = "band",
  href,
  target,
  rel,
  as: Heading = "h3",
  className,
  children,
  ...props
}: FeatureCardProps) {
  const link = href != null
  const classes = cn(
    "group/feature-card relative flex h-full min-w-0 flex-col overflow-clip rounded-card p-card text-foreground",
    surfaceClass[surface],
    link &&
      cn(
        "transition-colors duration-[var(--cie-t-cell,320ms)] ease-cie-expo",
        "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        surfaceHover[surface]
      ),
    className
  )

  const body = (
    <>
      <div data-slot="feature-card-body" className="flex flex-col gap-3">
        {kicker != null && kicker !== false && <Kicker data-slot="feature-card-kicker">{kicker}</Kicker>}
        <Heading
          data-slot="feature-card-title"
          className="flex items-start justify-between gap-4 text-2xl leading-[1.2] font-[300] tracking-[-0.02em] text-balance"
        >
          <span>{title}</span>
          {link && (
            <ArrowRightIcon
              data-slot="feature-card-arrow"
              aria-hidden
              className={cn(
                "mt-[0.3em] size-5 shrink-0 text-muted-foreground transition-[translate,color] duration-[var(--cie-t-cell,320ms)] ease-cie-expo",
                "group-hover/feature-card:translate-x-[var(--cie-hover-nudge,3px)] group-hover/feature-card:text-foreground",
                "motion-reduce:group-hover/feature-card:translate-x-0"
              )}
            />
          )}
        </Heading>
        {description != null && description !== false && (
          <p
            data-slot="feature-card-description"
            className="max-w-[var(--cie-measure,62ch)] text-[15px] leading-[1.6] text-pretty text-muted-foreground"
          >
            {description}
          </p>
        )}
      </div>
      {children}
      {media != null && media !== false && (
        <div
          data-slot="feature-card-media"
          className={cn("mt-auto pt-[calc(var(--cie-gap-lg)*1.5)]", mediaBleed && "-mx-card -mb-card")}
        >
          <MediaFrame ratio={mediaRatio} frameClassName={cn(mediaBleed && "rounded-none")}>
            {media}
          </MediaFrame>
        </div>
      )}
    </>
  )

  if (link) {
    return (
      <a
        data-slot="feature-card"
        data-surface={surface}
        href={href}
        target={target}
        rel={rel}
        className={classes}
        {...(props as React.HTMLAttributes<HTMLElement>)}
      >
        {body}
      </a>
    )
  }
  return (
    <div data-slot="feature-card" data-surface={surface} className={classes} {...props}>
      {body}
    </div>
  )
}

type FeatureGridProps = React.ComponentProps<"div"> & {
  /** Columns at lg+ (md always shows 2). */
  columns?: 2 | 3
}

function FeatureGrid({ columns = 3, className, ...props }: FeatureGridProps) {
  return (
    <div
      data-slot="feature-grid"
      className={cn(
        "grid grid-cols-1 gap-[var(--cie-gap-lg)] md:grid-cols-2",
        columns === 3 && "lg:grid-cols-3",
        className
      )}
      {...props}
    />
  )
}

export { FeatureCard, FeatureGrid }
export type { FeatureCardProps, FeatureGridProps }
