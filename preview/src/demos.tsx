import * as React from "react"
import { ArrowRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { GridPattern } from "@/components/ui/grid-pattern"
import { Noise } from "@/components/ui/noise"
import { Particles } from "@/components/ui/particles"
import { ShaderField } from "@/components/ui/shader-field"
import { Spotlight } from "@/components/ui/spotlight"
import { BorderBeam } from "@/components/ui/border-beam"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { TextShimmer } from "@/components/ui/text-shimmer"
import {
  AnimatedTabs,
  AnimatedTabsContent,
  AnimatedTabsList,
  AnimatedTabsPanels,
  AnimatedTabsTrigger,
} from "@/components/ui/animated-tabs"
import {
  SmoothAccordion,
  SmoothAccordionContent,
  SmoothAccordionItem,
  SmoothAccordionTrigger,
} from "@/components/ui/smooth-accordion"
import { Parallax, ScrollExpand } from "@/components/ui/parallax"
import { Reveal, RevealGroup } from "@/components/ui/reveal"
import { SplitText } from "@/components/ui/split-text"
import { WordRotate } from "@/components/ui/word-rotate"
import { NumberTicker } from "@/components/ui/number-ticker"
import { ExpandBoard, ExpandCard } from "@/components/ui/expand-card"

export type Demo = {
  render: () => React.ReactNode
  /** "stage" = fixed-height canvas the effect fills; "plain" = padded centred area; "flush" = no chrome. */
  layout?: "stage" | "plain" | "flush"
  /** Offer a replay button (remounts the demo). */
  replay?: boolean
  note?: string
}

const Mono = ({ children }: { children: React.ReactNode }) => (
  <span className="font-mono text-xs tracking-[0.02em] text-muted-foreground uppercase">{children}</span>
)

function ShaderModes() {
  const [mode, setMode] = React.useState<"flow" | "contour" | "dither">("flow")
  return (
    <ShaderField mode={mode} intensity={mode === "flow" ? 0.4 : 0.55}>
      <div className="relative z-10 flex size-full flex-col items-start justify-end gap-3 p-6">
        <div className="flex gap-1 rounded-full border border-border bg-background/60 p-1 backdrop-blur">
          {(["flow", "contour", "dither"] as const).map((m) => (
            <Button key={m} size="sm" variant={m === mode ? "default" : "ghost"} onClick={() => setMode(m)}>
              {m}
            </Button>
          ))}
        </div>
      </div>
    </ShaderField>
  )
}

export const demos: Record<string, Demo> = {
  button: {
    layout: "plain",
    render: () => (
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button>Start a project</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">
          Read more <ArrowRightIcon />
        </Button>
        <Button size="icon" aria-label="Next">
          <ArrowRightIcon />
        </Button>
        <Button variant="destructive" size="sm">
          Delete
        </Button>
      </div>
    ),
  },
  input: {
    layout: "plain",
    render: () => (
      <form className="flex w-full max-w-sm flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
        <label className="flex flex-col gap-2">
          <Mono>Email</Mono>
          <Input type="email" placeholder="you@studio.jp" />
        </label>
        <label className="flex flex-col gap-2">
          <Mono>Invalid</Mono>
          <Input aria-invalid defaultValue="not-an-email" />
        </label>
        <Input disabled placeholder="Disabled" />
      </form>
    ),
  },
  dialog: {
    layout: "plain",
    render: () => (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Open dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start a project</DialogTitle>
            <DialogDescription>
              Tell us where creativity should show up next. We reply within two days.
            </DialogDescription>
          </DialogHeader>
          <Input placeholder="Project name" />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button>Send</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ),
  },
  sheet: {
    layout: "plain",
    render: () => (
      <div className="flex flex-wrap justify-center gap-3">
        {(["right", "left", "bottom"] as const).map((side) => (
          <Sheet key={side}>
            <SheetTrigger asChild>
              <Button variant="outline">{side}</Button>
            </SheetTrigger>
            <SheetContent side={side}>
              <SheetHeader>
                <Mono>Navigation</Mono>
                <SheetTitle>Creativity is everywhere</SheetTitle>
                <SheetDescription>Slides on --cie-t-move / expo.</SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col gap-1 text-3xl font-[300] tracking-[-0.03em]">
                {["Work", "About", "Journal", "Contact"].map((l) => (
                  <a
                    key={l}
                    href="#"
                    className="w-fit transition-[font-weight,translate] duration-[var(--cie-t-cell)] ease-cie-expo hover:translate-x-1 hover:font-[560]"
                  >
                    {l}
                  </a>
                ))}
              </nav>
              <SheetFooter>
                <Button>Start a project</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        ))}
      </div>
    ),
  },

  "grid-pattern": {
    layout: "stage",
    render: () => (
      <div className="grid size-full grid-cols-1 sm:grid-cols-3">
        <div className="relative border-b border-border sm:border-r sm:border-b-0">
          <GridPattern cells={6} />
          <span className="absolute bottom-3 left-4">
            <Mono>grid · cells</Mono>
          </span>
        </div>
        <div className="relative border-b border-border sm:border-r sm:border-b-0">
          <GridPattern variant="dots" size={20} className="text-foreground/30" />
          <span className="absolute bottom-3 left-4">
            <Mono>dots</Mono>
          </span>
        </div>
        <div className="relative">
          <GridPattern variant="cross" size={32} fade="top" className="text-foreground/30" />
          <span className="absolute bottom-3 left-4">
            <Mono>cross · fade top</Mono>
          </span>
        </div>
      </div>
    ),
  },
  noise: {
    layout: "stage",
    render: () => (
      <div className="relative grid size-full place-items-center">
        <Noise opacity={0.14} />
        <p className="relative text-5xl font-[200] tracking-[-0.045em]">Grain</p>
      </div>
    ),
  },
  particles: {
    layout: "stage",
    note: "Move the cursor through the field.",
    render: () => (
      <div className="relative grid size-full place-items-center">
        <Particles density={2} />
        <p className="relative text-5xl font-[200] tracking-[-0.045em]">Everywhere</p>
      </div>
    ),
  },
  "shader-field": {
    layout: "stage",
    note: "WebGL. Cursor bends the field. Colours = bg-background → text-foreground.",
    render: () => <ShaderModes />,
  },
  spotlight: {
    layout: "plain",
    render: () => (
      <div className="grid w-full gap-3 sm:grid-cols-2">
        {["Brand systems", "Interactive spaces"].map((t) => (
          <Spotlight key={t} className="p-7">
            <Mono>Capability</Mono>
            <p className="mt-10 text-3xl font-[300] tracking-[-0.03em]">{t}</p>
          </Spotlight>
        ))}
      </div>
    ),
  },

  "border-beam": {
    layout: "plain",
    render: () => (
      <div className="relative w-full max-w-md rounded-page border border-border p-8">
        <Mono>Now booking</Mono>
        <p className="mt-6 text-3xl font-[300] tracking-[-0.03em]">Spring 2027 residencies</p>
        <BorderBeam size={120} duration={7} />
        <BorderBeam size={120} duration={7} delay={3.5} />
      </div>
    ),
  },
  "shimmer-button": {
    layout: "plain",
    render: () => (
      <div className="flex flex-wrap items-center justify-center gap-3">
        <ShimmerButton>Start a project</ShimmerButton>
        <ShimmerButton variant="outline" rim={false}>
          Without rim
        </ShimmerButton>
      </div>
    ),
  },
  "text-shimmer": {
    layout: "plain",
    render: () => (
      <div className="flex flex-col items-center gap-4">
        <TextShimmer className="text-2xl font-[300]">Generating your moodboard…</TextShimmer>
        <TextShimmer className="font-mono text-xs uppercase" duration={1.6}>
          Loading · cie-ds
        </TextShimmer>
      </div>
    ),
  },
  "animated-tabs": {
    layout: "plain",
    render: () => (
      <AnimatedTabs defaultValue="work" className="w-full max-w-md">
        <AnimatedTabsList>
          <AnimatedTabsTrigger value="work">Work</AnimatedTabsTrigger>
          <AnimatedTabsTrigger value="about">About</AnimatedTabsTrigger>
          <AnimatedTabsTrigger value="contact">Contact</AnimatedTabsTrigger>
        </AnimatedTabsList>
        <AnimatedTabsPanels className="rounded-[var(--radius)] border border-border">
          <AnimatedTabsContent value="work" className="p-6">
            <p className="text-2xl font-[300] tracking-[-0.03em]">Selected work</p>
            <p className="mt-2 text-sm text-muted-foreground">Height glides between panels.</p>
          </AnimatedTabsContent>
          <AnimatedTabsContent value="about" className="p-6">
            <p className="text-2xl font-[300] tracking-[-0.03em]">About</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Creativity is everywhere — a studio for brand, space and interaction. This panel is taller so you can see
              the container ease to its new height on the cie expo curve.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">Keyboard: arrows move between tabs.</p>
          </AnimatedTabsContent>
          <AnimatedTabsContent value="contact" className="p-6">
            <p className="text-2xl font-[300] tracking-[-0.03em]">hello@cie</p>
          </AnimatedTabsContent>
        </AnimatedTabsPanels>
      </AnimatedTabs>
    ),
  },
  "smooth-accordion": {
    layout: "plain",
    render: () => (
      <SmoothAccordion type="single" collapsible defaultValue="a" className="w-full max-w-lg">
        {[
          ["a", "Brand systems", "Identity, type and motion rules that survive contact with real products."],
          ["b", "Interactive spaces", "Installations and exhibitions where the body is the interface."],
          ["c", "Tools", "Small internal tools, built on the same tokens as everything else."],
        ].map(([v, t, d]) => (
          <SmoothAccordionItem key={v} value={v}>
            <SmoothAccordionTrigger>{t}</SmoothAccordionTrigger>
            <SmoothAccordionContent>{d}</SmoothAccordionContent>
          </SmoothAccordionItem>
        ))}
      </SmoothAccordion>
    ),
  },

  parallax: {
    layout: "flush",
    note: "Scroll the page. Layers drift at different speeds; below, ScrollExpand grows a block into a page.",
    render: () => (
      <div>
        <div className="relative grid h-96 grid-cols-3 items-center gap-4 overflow-hidden px-6">
          <Parallax speed={-1.5}>
            <div className="aspect-[3/4] rounded-[var(--radius)] bg-card" />
          </Parallax>
          <Parallax speed={1}>
            <p className="text-center text-4xl font-[200] tracking-[-0.045em]">Depth</p>
          </Parallax>
          <Parallax speed={2.5}>
            <div className="aspect-square rounded-full border border-border" />
          </Parallax>
        </div>
        <ScrollExpand length={1}>
          <div className="flex size-full flex-col justify-end p-8 sm:p-14">
            <Mono>
              <span className="text-card-foreground/60">ScrollExpand</span>
            </Mono>
            <p className="mt-3 text-5xl leading-[0.9] font-[300] tracking-[-0.045em] sm:text-8xl">Block becomes page</p>
          </div>
        </ScrollExpand>
      </div>
    ),
  },
  reveal: {
    layout: "plain",
    replay: true,
    render: () => (
      <RevealGroup className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
        {(["rise", "fade", "blur", "slide", "scale", "clip"] as const).map((v) => (
          <Reveal
            key={v}
            variant={v}
            className="flex h-28 items-end rounded-[var(--radius)] bg-card p-4 text-card-foreground"
          >
            <span className="font-mono text-xs uppercase">{v}</span>
          </Reveal>
        ))}
      </RevealGroup>
    ),
  },
  "split-text": {
    layout: "plain",
    replay: true,
    render: () => (
      <div className="flex flex-col items-center gap-6 text-center">
        <SplitText as="h3" effect="mask" className="text-5xl leading-none font-[300] tracking-[-0.045em] sm:text-6xl">
          Creativity is everywhere
        </SplitText>
        <SplitText by="char" effect="weight" weight={640} className="text-3xl tracking-[-0.03em]">
          Weight motion
        </SplitText>
        <SplitText effect="blur" delay={0.4} className="max-w-md text-muted-foreground">
          Words blur in and settle, staggered by the cie stagger token.
        </SplitText>
      </div>
    ),
  },
  "word-rotate": {
    layout: "plain",
    render: () => (
      <p className="text-4xl font-[300] tracking-[-0.04em] sm:text-5xl">
        We design <WordRotate words={["brands", "spaces", "tools", "motion"]} className="font-[560]" />
      </p>
    ),
  },
  "number-ticker": {
    layout: "plain",
    replay: true,
    render: () => (
      <div className="grid w-full grid-cols-3 gap-6 text-center">
        {[
          [128, "Projects"],
          [14, "Countries"],
          [99.9, "Uptime %", 1],
        ].map(([v, l, d]) => (
          <div key={String(l)} className="flex flex-col gap-2">
            <NumberTicker
              value={Number(v)}
              decimals={Number(d ?? 0)}
              className="text-5xl font-[200] tracking-[-0.04em]"
            />
            <Mono>{l}</Mono>
          </div>
        ))}
      </div>
    ),
  },
  "expand-card": {
    layout: "plain",
    note: "Click a cell. Esc or × to close.",
    render: () => (
      <ExpandBoard className="w-full">
        {[
          ["work", "Work", "01"],
          ["about", "About", "02"],
          ["journal", "Journal", "03"],
        ].map(([id, t, n]) => (
          <ExpandCard key={id} id={id} title={t} eyebrow={n} summary="Open the page">
            <div className="grid gap-4 text-lg leading-relaxed opacity-80 sm:grid-cols-2">
              <p>
                The block becomes a page on --cie-t-move (360ms) with the expo curve — the same morph as
                creativityiseverywhere.com, rebuilt as a shared-layout transition.
              </p>
              <p>Other cells step back to 35% and 0.97 scale while this one is open.</p>
            </div>
          </ExpandCard>
        ))}
      </ExpandBoard>
    ),
  },
}
