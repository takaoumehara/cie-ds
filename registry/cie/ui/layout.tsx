import * as React from "react"
import { ArrowRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// Layout · Editorial page skeleton (ElevenLabs / Apple product-page lineage, cie "editorial" tokens).
// Container   — max-w-page centred column with gutter padding; size="measure" caps it at --cie-measure (~62ch).
// Section     — one vertical beat of the page: py-section rhythm, canvas / band / ink tone, data-cie-mode="editorial"
//               (relaxed leading + tracking), and a Container inside unless `bleed`.
//               tone="ink" inverts locally (bg-foreground / text-background) and re-points muted text, hairlines,
//               band / plate surfaces and the primary pill at the inverted inks, so nested parts still read.
// SectionHeader — kicker → whisper heading → muted description; an `aside` (e.g. a TextLink) sits opposite on md+,
//               baseline-aligned with the heading. Gap below = --cie-gap-lg × 2.
// Kicker      — DM Mono uppercase micro label, optional leading ink dot.
// Hairline    — 1px --cie-hairline rule; `inset` keeps it inside the page gutter.
// TextLink    — inline link whose → nudges --cie-hover-nudge (3px) on hover on --cie-t-cell / expo.
// Static and server-friendly (no client hooks). Reduced motion: the arrow nudge is disabled (motion-reduce).

/* ---------------------------------- Container ---------------------------------- */

type ContainerProps = React.ComponentProps<"div"> & {
  /** "page" = --cie-container (1280px). "measure" = a readable text column (--cie-measure ≈ 62ch). */
  size?: "page" | "measure"
}

function Container({ size = "page", className, ...props }: ContainerProps) {
  return (
    <div
      data-slot="container"
      data-size={size}
      className={cn(
        "mx-auto w-full px-gutter",
        size === "page" ? "max-w-page" : "max-w-[calc(var(--cie-measure,62ch)+var(--cie-gutter)*2)]",
        className
      )}
      {...props}
    />
  )
}

/* ----------------------------------- Section ----------------------------------- */

const toneClass = {
  canvas: "bg-background text-foreground",
  band: "bg-band text-foreground",
  // Local inversion: the ink becomes the ground; derived tokens are re-pointed so children keep working.
  ink: [
    "bg-foreground text-background",
    "[--muted-foreground:color-mix(in_oklab,var(--background)_62%,var(--foreground))]",
    "[--cie-hairline:color-mix(in_oklab,var(--background)_16%,transparent)]",
    "[--cie-surface-band:color-mix(in_oklab,var(--background)_7%,var(--foreground))]",
    "[--cie-surface-plate:color-mix(in_oklab,var(--background)_12%,var(--foreground))]",
    "[--primary:var(--background)] [--primary-foreground:var(--foreground)]",
    "[--border:color-mix(in_oklab,var(--background)_18%,transparent)]",
    "[--accent:color-mix(in_oklab,var(--background)_10%,transparent)]",
    "[--ring:var(--background)]",
  ].join(" "),
} as const

const spacingClass = {
  default: "py-section",
  tight: "py-[calc(var(--cie-section)*0.6)]",
  none: "py-0",
} as const

type SectionProps = React.ComponentProps<"section"> & {
  tone?: keyof typeof toneClass
  spacing?: keyof typeof spacingClass
  /** Sets data-cie-mode (editorial = relaxed leading + tracking). Pass false to inherit. */
  mode?: "editorial" | false
  /** Skip the inner Container — children span the full width. */
  bleed?: boolean
  /** Inner Container size (ignored with `bleed`). */
  size?: ContainerProps["size"]
  /** Extra classes for the inner Container. */
  containerClassName?: string
}

function Section({
  tone = "canvas",
  spacing = "default",
  mode = "editorial",
  bleed = false,
  size = "page",
  className,
  containerClassName,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      data-slot="section"
      data-tone={tone}
      data-cie-mode={mode || undefined}
      className={cn("relative overflow-x-clip", toneClass[tone], spacingClass[spacing], className)}
      {...props}
    >
      {bleed ? (
        children
      ) : (
        <Container size={size} className={containerClassName}>
          {children}
        </Container>
      )}
    </section>
  )
}

/* ------------------------------------ Kicker ----------------------------------- */

type KickerProps = React.ComponentProps<"span"> & {
  /** Leading ink dot. */
  dot?: boolean
}

function Kicker({ dot = false, className, children, ...props }: KickerProps) {
  return (
    <span
      data-slot="kicker"
      className={cn(
        "inline-flex items-center gap-2 font-mono text-xs leading-none tracking-[0.04em] text-muted-foreground uppercase",
        className
      )}
      {...props}
    >
      {dot && <span data-slot="kicker-dot" aria-hidden className="size-1.5 shrink-0 rounded-full bg-foreground" />}
      {children}
    </span>
  )
}

/* ---------------------------------- TextLink ----------------------------------- */

type TextLinkProps = React.ComponentProps<"a"> & {
  /** Trailing → that nudges on hover. */
  arrow?: boolean
}

function TextLink({ arrow = true, className, children, ...props }: TextLinkProps) {
  return (
    <a
      data-slot="text-link"
      className={cn(
        "group/text-link inline-flex items-center gap-1.5 rounded-sm text-[15px] font-[500] tracking-[-0.005em] text-foreground",
        "underline decoration-transparent decoration-1 underline-offset-[5px]",
        "transition-[text-decoration-color,color] duration-[var(--cie-t-cell,320ms)] ease-cie-expo hover:decoration-current",
        "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className
      )}
      {...props}
    >
      {children}
      {arrow && (
        <ArrowRightIcon
          data-slot="text-link-arrow"
          aria-hidden
          className={cn(
            "size-4 shrink-0 transition-transform duration-[var(--cie-t-cell,320ms)] ease-cie-expo",
            "group-hover/text-link:translate-x-[var(--cie-hover-nudge,3px)]",
            "motion-reduce:transition-none motion-reduce:group-hover/text-link:translate-x-0"
          )}
        />
      )}
    </a>
  )
}

/* -------------------------------- SectionHeader -------------------------------- */

type SectionHeaderProps = Omit<React.ComponentProps<"header">, "title"> & {
  kicker?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  /** Opposite-side slot on md+ (baseline-aligned with the heading), e.g. a <TextLink>. */
  aside?: React.ReactNode
  align?: "start" | "center"
  /** Heading level. */
  as?: "h1" | "h2" | "h3"
}

function SectionHeader({
  kicker,
  title,
  description,
  aside,
  align = "start",
  as: Heading = "h2",
  className,
  ...props
}: SectionHeaderProps) {
  const center = align === "center"
  const hasKicker = kicker != null && kicker !== false
  // Explicit md rows so the aside can share the heading's row (baseline) while staying last in DOM / on mobile.
  const titleRow = hasKicker ? "md:row-start-2" : "md:row-start-1"
  const descRow = hasKicker ? "md:row-start-3" : "md:row-start-2"
  return (
    <header
      data-slot="section-header"
      data-align={align}
      className={cn(
        "mb-[calc(var(--cie-gap-lg)*2)] grid gap-y-[var(--cie-gap)]",
        center
          ? "justify-items-center text-center"
          : "grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] md:gap-x-[calc(var(--cie-gap-lg)*2)]",
        className
      )}
      {...props}
    >
      {hasKicker && (
        <Kicker data-slot="section-header-kicker" className={cn(!center && "md:col-start-1 md:row-start-1")}>
          {kicker}
        </Kicker>
      )}
      <Heading
        data-slot="section-header-title"
        className={cn(
          "max-w-[22ch] text-heading text-balance",
          !center && cn("md:col-start-1 md:self-baseline", titleRow)
        )}
      >
        {title}
      </Heading>
      {description != null && description !== false && (
        <p
          data-slot="section-header-description"
          className={cn(
            "max-w-[var(--cie-measure,62ch)] text-base text-pretty text-muted-foreground",
            !center && cn("md:col-start-1", descRow)
          )}
        >
          {description}
        </p>
      )}
      {aside != null && aside !== false && (
        <div
          data-slot="section-header-aside"
          className={cn(
            "flex items-baseline",
            center ? "mt-1" : cn("md:col-start-2 md:self-baseline md:justify-self-end", titleRow)
          )}
        >
          {aside}
        </div>
      )}
    </header>
  )
}

/* ----------------------------------- Hairline ---------------------------------- */

type HairlineProps = React.ComponentProps<"hr"> & {
  /** Keep the rule inside the page column (max-w-page + gutter) instead of spanning the full width. */
  inset?: boolean
}

function Hairline({ inset = false, className, ...props }: HairlineProps) {
  const rule = (
    <hr
      data-slot={inset ? "hairline-rule" : "hairline"}
      className={cn("h-0 w-full border-0 border-t border-hairline", !inset && className)}
      {...props}
    />
  )
  if (!inset) return rule
  return (
    <div data-slot="hairline" className={cn("mx-auto w-full max-w-page px-gutter", className)}>
      {rule}
    </div>
  )
}

export { Container, Section, SectionHeader, Kicker, Hairline, TextLink }
export type { ContainerProps, SectionProps, SectionHeaderProps, KickerProps, HairlineProps, TextLinkProps }
