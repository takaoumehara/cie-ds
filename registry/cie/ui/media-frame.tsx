import * as React from "react"

import { cn } from "@/lib/utils"

// Layout · MediaFrame (Apple product-page media card lineage, cie "editorial" tokens).
// A flat plate (bg-plate, rounded-media 28px, no border / shadow) at a fixed aspect ratio; any child
// (img, video, svg, a composed div) fills it, images / video with object-cover. Optional DM Mono caption below.
// `bleed="left" | "right"` lets the frame run to the viewport edge on that side at lg+ (imagery entering from
// one side): a negative margin of gutter + the space outside the 1280px column; the bleeding side loses its radius.
// Put it inside a <Section> (overflow-x: clip) so the 100vw maths never causes a horizontal scrollbar.
// Static, server-friendly. No motion.

type MediaFrameProps = React.ComponentProps<"figure"> & {
  /** CSS aspect-ratio, e.g. "16/9" (default), "4/5", "1/1", "21/9". */
  ratio?: string
  caption?: React.ReactNode
  /** Extend to the viewport edge on this side at lg+. */
  bleed?: "left" | "right"
  /** Classes for the inner frame (the rounded plate). */
  frameClassName?: string
}

// Distance from the page column's content edge to the viewport edge.
const bleedVar = "[--cie-bleed:calc(max(0px,(100vw_-_var(--cie-container,1280px))/2)_+_var(--cie-gutter))]"

function MediaFrame({
  ratio = "16/9",
  caption,
  bleed,
  className,
  frameClassName,
  children,
  ...props
}: MediaFrameProps) {
  return (
    <figure
      data-slot="media-frame"
      data-bleed={bleed}
      className={cn(
        "m-0 min-w-0",
        bleed && bleedVar,
        bleed === "right" && "lg:mr-[calc(var(--cie-bleed)*-1)]",
        bleed === "left" && "lg:ml-[calc(var(--cie-bleed)*-1)]",
        className
      )}
      {...props}
    >
      <div
        data-slot="media-frame-plate"
        style={{ aspectRatio: ratio }}
        className={cn(
          "relative w-full overflow-clip rounded-media bg-plate",
          "[&>*]:size-full [&>img]:object-cover [&>video]:object-cover",
          bleed === "right" && "lg:rounded-r-none",
          bleed === "left" && "lg:rounded-l-none",
          frameClassName
        )}
      >
        {children}
      </div>
      {caption != null && caption !== false && (
        <figcaption
          data-slot="media-frame-caption"
          className={cn(
            "mt-3 font-mono text-xs tracking-[0.04em] text-muted-foreground uppercase",
            bleed === "left" && "lg:pl-[var(--cie-bleed)]"
          )}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

export { MediaFrame }
export type { MediaFrameProps }
