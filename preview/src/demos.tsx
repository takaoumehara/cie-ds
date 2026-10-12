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
import { BoldIcon, ItalicIcon, LinkIcon, UnderlineIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Toaster, toast } from "@/components/ui/toast"
import {
  BottomSheet,
  BottomSheetClose,
  BottomSheetContent,
  BottomSheetDescription,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetTrigger,
} from "@/components/ui/bottom-sheet"
import { Switch } from "@/components/ui/switch"
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"
import { Chip, Chips } from "@/components/ui/chips"
import { Slider } from "@/components/ui/slider"
import { Stepper } from "@/components/ui/stepper"
import { Pagination } from "@/components/ui/pagination"
import { Carousel, CarouselItem } from "@/components/ui/carousel"
import { BellIcon, InboxIcon } from "lucide-react"
import { MenuToggle } from "@/components/ui/menu-toggle"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import {
  MegaMenu,
  MegaMenuContent,
  MegaMenuItem,
  MegaMenuLink,
  MegaMenuList,
  MegaMenuTrigger,
} from "@/components/ui/mega-menu"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner, type SpinnerState } from "@/components/ui/spinner"
import { Badge, CountBadge } from "@/components/ui/badge"
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@/components/ui/empty-state"
import { Typewriter } from "@/components/ui/typewriter"
import { TextFill } from "@/components/ui/text-fill"
import { SvgDraw, SvgDrawPath } from "@/components/ui/svg-draw"
import { ScrollProgress } from "@/components/ui/scroll-progress"
import { Marquee } from "@/components/ui/marquee"
import { CardStack, CardStackItem } from "@/components/ui/card-stack"
import { HideHeader } from "@/components/ui/hide-header"
import { Scrollspy } from "@/components/ui/scrollspy"
import { PinScrubSteps } from "@/components/ui/pin-scrub"
import { Scrollytelling, ScrollytellingStep } from "@/components/ui/scrollytelling"
import { HorizontalScroll, HorizontalScrollPanel } from "@/components/ui/horizontal-scroll"
import { ImageSequence, type ImageSequenceInk } from "@/components/ui/image-sequence"

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

function DropdownMenuDemo() {
  const [grid, setGrid] = React.useState(true)
  const [labels, setLabels] = React.useState(false)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Options</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>File</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            New page<DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Duplicate<DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>Share…</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>View</DropdownMenuLabel>
        <DropdownMenuCheckboxItem checked={grid} onCheckedChange={(v) => setGrid(v === true)}>
          Show grid
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={labels} onCheckedChange={(v) => setLabels(v === true)}>
          Show labels
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          Delete<DropdownMenuShortcut>⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const yen = (v: number) => `¥${v.toLocaleString("en-US")}`

function StepperDemo() {
  const [guests, setGuests] = React.useState(2)
  return (
    <div className="flex items-center gap-4">
      <Mono>Guests</Mono>
      <Stepper aria-label="Guests" value={guests} onValueChange={setGuests} min={0} max={10} />
    </div>
  )
}

function MenuToggleDemo() {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="flex items-center gap-4">
      <MenuToggle open={open} onOpenChange={setOpen} />
      <Mono>{open ? "Open" : "Closed"}</Mono>
    </div>
  )
}

const megaGroups = [
  {
    label: "Work",
    links: [
      ["Identity", "Marks, type and colour systems"],
      ["Spaces", "Exhibitions and wayfinding"],
      ["Digital", "Sites, apps and tools"],
      ["Motion", "Titles and product film"],
    ],
  },
  {
    label: "Studio",
    links: [
      ["About", "Who we are"],
      ["Process", "How a project runs"],
      ["Journal", "Notes and essays"],
    ],
  },
] as const

function MegaMenuDemo() {
  return (
    <div className="flex min-h-72 w-full justify-center">
      <MegaMenu>
        <MegaMenuList>
          {megaGroups.map((g) => (
            <MegaMenuItem key={g.label}>
              <MegaMenuTrigger>{g.label}</MegaMenuTrigger>
              <MegaMenuContent>
                <ul className={g.links.length > 3 ? "grid w-[28rem] grid-cols-2 gap-1" : "grid w-72 gap-1"}>
                  {g.links.map(([title, desc]) => (
                    <li key={title}>
                      <MegaMenuLink href="#">
                        <span className="font-[460]">{title}</span>
                        <span className="text-xs text-muted-foreground">{desc}</span>
                      </MegaMenuLink>
                    </li>
                  ))}
                </ul>
              </MegaMenuContent>
            </MegaMenuItem>
          ))}
          <MegaMenuItem>
            <MegaMenuLink variant="trigger" href="#">
              Contact
            </MegaMenuLink>
          </MegaMenuItem>
        </MegaMenuList>
      </MegaMenu>
    </div>
  )
}

function StepIndicatorDemo() {
  const steps = ["Account", "Profile", "Billing", "Review"]
  const [current, setCurrent] = React.useState(1)
  return (
    <div className="flex w-full max-w-lg flex-col gap-6">
      <StepIndicator steps={steps} current={current} />
      <div className="flex justify-between">
        <Button variant="outline" size="sm" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
          Back
        </Button>
        <Button size="sm" onClick={() => setCurrent((c) => (c >= steps.length ? 0 : c + 1))}>
          {current >= steps.length ? "Restart" : current === steps.length - 1 ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  )
}

function SpinnerDemo() {
  const [state, setState] = React.useState<SpinnerState>("loading")
  return (
    <div className="flex flex-col items-center gap-6">
      <Spinner state={state} className="size-10" />
      <div className="flex flex-wrap justify-center gap-2">
        {(["loading", "success", "error", "idle"] as const).map((s) => (
          <Button key={s} size="sm" variant={s === state ? "default" : "outline"} onClick={() => setState(s)}>
            {s}
          </Button>
        ))}
      </div>
    </div>
  )
}

function BadgeDemo() {
  const [count, setCount] = React.useState(3)
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Error</Badge>
      </div>
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Decrease"
          onClick={() => setCount((c) => Math.max(0, c - 1))}
        >
          −
        </Button>
        <CountBadge count={count}>
          <Button variant="secondary" size="icon" aria-label="Notifications">
            <BellIcon />
          </Button>
        </CountBadge>
        <Button variant="outline" size="icon-sm" aria-label="Increase" onClick={() => setCount((c) => c + 1)}>
          +
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setCount(120)}>
          120
        </Button>
      </div>
    </div>
  )
}

const scrollCopy = [
  "A block becomes the page. Scroll is the timeline: every pixel you travel is a frame you can map to something.",
  "Progress bars are the simplest scroll-linked motion — one value, zero to one, drawn as a hairline of ink.",
  "Two inks, one ruler. The bar never overshoots the page; the spring only takes the edge off a jumpy wheel.",
  "Measure the page, an inner box, or a single article. The offsets decide where zero and one live.",
  "Reduced motion drops the spring: the bar maps one-to-one, nothing follows through, nothing floats.",
  "Keep reading. The ring on the right draws itself in step with the hairline at the top of the box.",
]

function ScrollProgressDemo() {
  const box = React.useRef<HTMLDivElement>(null)
  return (
    <div className="flex w-full max-w-xl items-start gap-4">
      <div ref={box} className="relative h-[420px] flex-1 overflow-y-auto rounded-page border border-border">
        <ScrollProgress position="sticky" container={box} />
        <div className="flex flex-col gap-4 p-6 text-sm leading-relaxed text-muted-foreground">
          {[...scrollCopy, ...scrollCopy].map((t, i) => (
            <p key={i}>{t}</p>
          ))}
        </div>
      </div>
      <ScrollProgress variant="circle" container={box} showValue />
    </div>
  )
}

function HideHeaderDemo() {
  const box = React.useRef<HTMLDivElement>(null)
  return (
    <div ref={box} className="relative h-[420px] w-full max-w-xl overflow-y-auto rounded-page border border-border">
      <HideHeader container={box}>
        <div className="flex h-12 items-center justify-between px-5">
          <span className="text-sm font-[520]">cie</span>
          <Mono>Work · About · Contact</Mono>
        </div>
      </HideHeader>
      <div className="flex flex-col gap-4 p-6 text-sm leading-relaxed text-muted-foreground">
        {[...scrollCopy, ...scrollCopy, ...scrollCopy].map((t, i) => (
          <p key={i}>{t}</p>
        ))}
      </div>
    </div>
  )
}

const spySections = [
  { id: "spy-intro", label: "Intro" },
  { id: "spy-tokens", label: "Tokens" },
  { id: "spy-motion", label: "Motion" },
  { id: "spy-scroll", label: "Scroll" },
]

function ScrollspyDemo() {
  const box = React.useRef<HTMLDivElement>(null)
  return (
    <div className="flex w-full max-w-2xl items-start gap-6">
      <Scrollspy items={spySections} root={box} className="w-32 shrink-0 pt-2" />
      <div ref={box} className="relative h-[420px] flex-1 overflow-y-auto rounded-page border border-border">
        {spySections.map((s, i) => (
          <section
            key={s.id}
            id={s.id}
            className={i === spySections.length - 1 ? "min-h-[420px] p-6" : "min-h-[300px] p-6"}
          >
            <Mono>{`0${i + 1}`}</Mono>
            <h3 className="mt-2 text-2xl font-[400] tracking-tight">{s.label}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{scrollCopy[i]}</p>
          </section>
        ))}
      </div>
    </div>
  )
}

const STORY = [
  { n: "01", title: "Listen", body: "Every project starts with a room full of questions, not answers." },
  { n: "02", title: "Shape", body: "We cut the brief down until one idea is left standing." },
  { n: "03", title: "Ship", body: "Then we build it — type, motion and code on the same tokens." },
]

/** Procedural frame: a ring closes and a block turns a quarter as progress runs 0 → 1. Inks from the theme. */
function drawRingFrame(ctx: CanvasRenderingContext2D, p: number, w: number, h: number, ink: ImageSequenceInk) {
  const cx = w / 2
  const cy = h / 2
  const r = Math.min(w, h) * 0.3
  ctx.lineCap = "round"
  ctx.strokeStyle = ink.fg
  ctx.globalAlpha = 0.15
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.stroke()
  ctx.globalAlpha = 1
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p)
  ctx.stroke()
  const s = r * (0.5 + 0.25 * p)
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate((Math.PI / 2) * p)
  ctx.fillStyle = ink.fg
  ctx.fillRect(-s / 2, -s / 2, s, s)
  ctx.restore()
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
  tooltip: {
    layout: "plain",
    render: () => (
      <TooltipProvider>
        <div className="flex gap-1 rounded-full border border-border p-1">
          {[
            { icon: <BoldIcon />, label: "Bold" },
            { icon: <ItalicIcon />, label: "Italic" },
            { icon: <UnderlineIcon />, label: "Underline" },
            { icon: <LinkIcon />, label: "Insert link" },
          ].map(({ icon, label }) => (
            <Tooltip key={label}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={label}>
                  {icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    ),
  },
  popover: {
    layout: "plain",
    render: () => (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Dimensions</Button>
        </PopoverTrigger>
        <PopoverContent className="flex w-64 flex-col gap-3">
          <Mono>Dimensions</Mono>
          <label className="flex items-center justify-between gap-3 text-sm">
            Width
            <Input defaultValue="1200" className="h-8 w-28" />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm">
            Height
            <Input defaultValue="800" className="h-8 w-28" />
          </label>
          <PopoverClose asChild>
            <Button size="sm" className="self-end">
              Apply
            </Button>
          </PopoverClose>
        </PopoverContent>
      </Popover>
    ),
  },
  "dropdown-menu": {
    layout: "plain",
    render: () => <DropdownMenuDemo />,
  },
  toast: {
    layout: "plain",
    note: "Swipe a toast right to dismiss it.",
    render: () => (
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => toast("Changes saved", { icon: true, description: "Just now" })}>Save</Button>
        <Button
          variant="outline"
          onClick={() =>
            toast("Upload failed", { variant: "destructive", description: "Check your connection and retry." })
          }
        >
          Fail
        </Button>
        <Toaster />
      </div>
    ),
  },
  "bottom-sheet": {
    layout: "plain",
    note: "Drag the handle down to dismiss.",
    render: () => (
      <BottomSheet>
        <BottomSheetTrigger asChild>
          <Button>Open sheet</Button>
        </BottomSheetTrigger>
        <BottomSheetContent>
          <BottomSheetHeader>
            <Mono>Sheet</Mono>
            <BottomSheetTitle>Share this page</BottomSheetTitle>
            <BottomSheetDescription>
              Anyone with the link can view. Pull the handle down past a third of the sheet, or flick it, to close.
            </BottomSheetDescription>
          </BottomSheetHeader>
          <BottomSheetClose asChild>
            <Button variant="secondary" className="self-start">
              Close
            </Button>
          </BottomSheetClose>
        </BottomSheetContent>
      </BottomSheet>
    ),
  },
  switch: {
    layout: "plain",
    render: () => (
      <div className="flex w-full max-w-xs flex-col gap-4">
        {[
          { id: "sw-notify", label: "Notifications", on: true },
          { id: "sw-sound", label: "Section sound", on: false },
          { id: "sw-motion", label: "Reduce motion", on: false },
        ].map((s) => (
          <label key={s.id} htmlFor={s.id} className="flex items-center justify-between gap-4 text-sm">
            {s.label}
            <Switch id={s.id} defaultChecked={s.on} />
          </label>
        ))}
      </div>
    ),
  },
  "segmented-control": {
    layout: "plain",
    render: () => (
      <SegmentedControl defaultValue="week" aria-label="Range">
        <SegmentedControlItem value="day">Day</SegmentedControlItem>
        <SegmentedControlItem value="week">Week</SegmentedControlItem>
        <SegmentedControlItem value="month">Month</SegmentedControlItem>
      </SegmentedControl>
    ),
  },
  chips: {
    layout: "plain",
    render: () => (
      <Chips defaultValue={["tokyo"]} aria-label="Filter by location" className="max-w-sm justify-center">
        <Chip value="all">All</Chip>
        <Chip value="tokyo">Tokyo</Chip>
        <Chip value="osaka">Osaka</Chip>
        <Chip value="online">Online</Chip>
      </Chips>
    ),
  },
  slider: {
    layout: "plain",
    note: "Hover or drag a thumb to see its value.",
    render: () => (
      <div className="flex w-full max-w-sm flex-col gap-3">
        <Mono>Price</Mono>
        <Slider
          aria-label="Price range"
          defaultValue={[3000, 7000]}
          min={1000}
          max={10000}
          step={500}
          minStepsBetweenThumbs={1}
          showValue
          formatValue={yen}
        />
        <div className="flex justify-between font-mono text-xs text-muted-foreground">
          <span>{yen(1000)}</span>
          <span>{yen(10000)}</span>
        </div>
      </div>
    ),
  },
  stepper: {
    layout: "plain",
    render: () => <StepperDemo />,
  },
  pagination: {
    layout: "plain",
    render: () => <Pagination total={12} defaultPage={1} />,
  },
  carousel: {
    layout: "plain",
    note: "Drag, use the arrows, or focus and press ← →.",
    render: () => (
      <Carousel label="Featured" className="max-w-md">
        {["01", "02", "03", "04"].map((n) => (
          <CarouselItem key={n}>
            <div className="flex aspect-[4/3] items-end rounded-[var(--cie-r)] border border-border p-6">
              <span className="text-7xl font-[300] tracking-[-0.04em] tabular-nums">{n}</span>
            </div>
          </CarouselItem>
        ))}
      </Carousel>
    ),
  },
  "menu-toggle": {
    layout: "plain",
    render: () => <MenuToggleDemo />,
  },
  breadcrumb: {
    layout: "plain",
    note: "5 items, maxItems 3 — press … to expand.",
    render: () => (
      <Breadcrumb>
        <BreadcrumbList maxItems={3}>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Work</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">2025</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Identity</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>Museum signage</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    ),
  },
  "mega-menu": {
    layout: "plain",
    render: () => <MegaMenuDemo />,
  },
  "step-indicator": {
    layout: "plain",
    replay: true,
    render: () => <StepIndicatorDemo />,
  },
  skeleton: {
    layout: "plain",
    render: () => (
      <div aria-busy="true" className="flex w-full max-w-sm items-start gap-4 rounded-page border border-border p-5">
        <Skeleton className="size-12 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-2.5 pt-1">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>
    ),
  },
  spinner: {
    layout: "plain",
    render: () => <SpinnerDemo />,
  },
  badge: {
    layout: "plain",
    render: () => <BadgeDemo />,
  },
  "empty-state": {
    layout: "plain",
    replay: true,
    render: () => (
      <EmptyState>
        <EmptyStateIcon>
          <InboxIcon />
        </EmptyStateIcon>
        <EmptyStateTitle>No messages yet</EmptyStateTitle>
        <EmptyStateDescription>When someone writes to you, the conversation will show up here.</EmptyStateDescription>
        <EmptyStateActions>
          <Button size="sm">Start a conversation</Button>
        </EmptyStateActions>
      </EmptyState>
    ),
  },
  typewriter: {
    layout: "plain",
    replay: true,
    render: () => (
      <div className="flex w-full flex-col gap-6">
        <h2 className="text-4xl font-[300] tracking-[-0.04em]">
          We design <Typewriter words={["brands", "spaces", "tools"]} delay={0.3} />
        </h2>
        <Typewriter
          as="p"
          className="max-w-md text-sm text-muted-foreground"
          text="Quiet interfaces, typed one letter at a time."
          speed={36}
          delay={0.6}
        />
      </div>
    ),
  },
  "text-fill": {
    layout: "plain",
    note: "Scroll — words fill with ink.",
    render: () => (
      <TextFill className="max-w-2xl text-3xl font-[300] leading-tight tracking-[-0.03em]">
        Good motion is mostly restraint. A page that moves only when it has something to say reads calmer, loads faster
        and leaves room for the work itself to carry the story.
      </TextFill>
    ),
  },
  "svg-draw": {
    layout: "plain",
    note: "Scroll to draw.",
    render: () => (
      <div className="flex w-full flex-col items-center gap-10">
        <SvgDraw
          viewBox="0 0 400 80"
          strokeWidth={2}
          className="w-full"
          d="M4 40 C 54 0, 96 0, 146 40 S 238 80, 288 40 S 360 0, 396 40"
        />
        <SvgDraw trigger="view" viewBox="0 0 48 48" strokeWidth={2} className="size-16">
          <SvgDrawPath d="M24 4 a20 20 0 1 1 0 40 a20 20 0 1 1 0 -40" />
          <SvgDrawPath d="M15 25 l6 6 l12 -13" />
        </SvgDraw>
      </div>
    ),
  },
  "scroll-progress": {
    layout: "plain",
    note: "Scroll inside the box.",
    render: () => <ScrollProgressDemo />,
  },
  marquee: {
    layout: "flush",
    note: "Scroll the page to speed it up.",
    render: () => (
      <div className="flex flex-col gap-2 py-8">
        <Marquee baseVelocity={4}>
          {["Two inks", "Snappy motion", "Blocks become pages"].map((w) => (
            <span key={w} className="px-6 text-5xl font-[300] tracking-tight whitespace-nowrap md:text-7xl">
              {w} ·
            </span>
          ))}
        </Marquee>
        <Marquee baseVelocity={-4}>
          {["Scroll", "Reveal", "Parallax", "Stack"].map((w) => (
            <span
              key={w}
              className="px-6 text-5xl font-[300] tracking-tight whitespace-nowrap text-muted-foreground md:text-7xl"
            >
              {w} ·
            </span>
          ))}
        </Marquee>
      </div>
    ),
  },
  "card-stack": {
    layout: "plain",
    note: "Scroll the page. Each card sticks; the ones beneath shrink and dim.",
    render: () => (
      <CardStack className="w-full max-w-xl" top={96}>
        {["Reveal", "Parallax", "Progress", "Stack"].map((t, i) => (
          <CardStackItem key={t} className="flex h-[300px] flex-col justify-between">
            <Mono>{`0${i + 1} / 04`}</Mono>
            <p className="text-4xl font-[300] tracking-tight">{t}</p>
          </CardStackItem>
        ))}
      </CardStack>
    ),
  },
  "hide-header": {
    layout: "plain",
    note: "Scroll down inside the box, then up.",
    render: () => <HideHeaderDemo />,
  },
  scrollspy: {
    layout: "plain",
    note: "Scroll the box or click an entry.",
    render: () => <ScrollspyDemo />,
  },
  "pin-scrub": {
    layout: "flush",
    note: "GSAP · Scroll — the stage pins while three steps play, then lets go.",
    render: () => (
      <PinScrubSteps className="bg-card text-card-foreground">
        {["Pin.", "Scrub.", "Release."].map((word, i) => (
          <div key={word} className="flex flex-col gap-3">
            <span className="font-mono text-xs text-muted-foreground uppercase">
              Step {String(i + 1).padStart(2, "0")}
            </span>
            <p className="text-6xl leading-[0.9] font-[300] tracking-[-0.045em] sm:text-8xl">{word}</p>
          </div>
        ))}
      </PinScrubSteps>
    ),
  },
  scrollytelling: {
    layout: "flush",
    note: "GSAP · Scroll — the figure pins and changes with the active step.",
    render: () => (
      <Scrollytelling
        figure={(i) => (
          <div className="flex flex-col items-center gap-6">
            <div
              className="size-28 bg-foreground transition-[border-radius,transform] duration-[var(--cie-t-move,360ms)] ease-cie-expo motion-reduce:transition-none sm:size-36"
              style={{
                borderRadius: i === 0 ? "999px" : i === 1 ? "var(--cie-r)" : "0px",
                transform: `rotate(${i * 45}deg)`,
              }}
            />
            <span className="text-7xl font-[200] tracking-[-0.05em] tabular-nums sm:text-8xl">{STORY[i]?.n}</span>
          </div>
        )}
      >
        {STORY.map((s) => (
          <ScrollytellingStep key={s.n}>
            <span className="font-mono text-xs uppercase">{s.n}</span>
            <h4 className="mt-2 text-4xl font-[300] tracking-[-0.035em]">{s.title}</h4>
            <p className="mt-3 max-w-sm text-base">{s.body}</p>
          </ScrollytellingStep>
        ))}
      </Scrollytelling>
    ),
  },
  "horizontal-scroll": {
    layout: "flush",
    note: "GSAP · Scroll — scrolling down moves the track sideways, snapping to each panel.",
    render: () => (
      <HorizontalScroll snap aria-label="Five panels">
        {["01", "02", "03", "04", "05"].map((n, i) => (
          <HorizontalScrollPanel key={n} className="p-3">
            <div
              className={
                i % 2 === 0
                  ? "flex size-full flex-col justify-between rounded-page bg-card p-8 text-card-foreground"
                  : "flex size-full flex-col justify-between rounded-page border border-border p-8"
              }
            >
              <span className="font-mono text-xs text-muted-foreground uppercase">Panel</span>
              <span className="text-8xl font-[200] tracking-[-0.06em] tabular-nums sm:text-9xl">{n}</span>
            </div>
          </HorizontalScrollPanel>
        ))}
      </HorizontalScroll>
    ),
  },
  "image-sequence": {
    layout: "flush",
    note: "GSAP · Scroll — a canvas draws frame by frame as you scroll (procedural, no images).",
    render: () => (
      <ImageSequence
        render={drawRingFrame}
        label="A ring closing around a turning square"
        className="bg-card text-card-foreground"
      >
        <span className="absolute top-6 left-6 font-mono text-xs text-muted-foreground uppercase">Frame sequence</span>
      </ImageSequence>
    ),
  },
}
