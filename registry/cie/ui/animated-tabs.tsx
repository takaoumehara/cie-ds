"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"
import { motion, MotionConfig, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { cieDuration, cieEase, cieTransition } from "@/lib/cie-motion"

// Micro · Animated Tabs (transitions.dev / Magic UI lineage) on Radix Tabs.
// - A shared-layout pill glides between triggers (spring, ~350ms settle).
// - <AnimatedTabsPanels> animates its height; content rises in with a soft blur.
// Fully keyboard accessible (Radix roving focus).

type Ctx = { value: string; id: string }
const TabsCtx = React.createContext<Ctx>({ value: "", id: "" })

function AnimatedTabs({
  value: valueProp,
  defaultValue,
  onValueChange,
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  const [inner, setInner] = React.useState(defaultValue ?? "")
  const value = valueProp ?? inner
  const id = React.useId()
  const reduce = useReducedMotion()
  return (
    <TabsCtx.Provider value={{ value, id }}>
      <MotionConfig reducedMotion={reduce ? "always" : "never"}>
        <TabsPrimitive.Root
          data-slot="tabs"
          value={value}
          onValueChange={(v) => {
            setInner(v)
            onValueChange?.(v)
          }}
          className={cn("flex flex-col gap-3", className)}
          {...props}
        />
      </MotionConfig>
    </TabsCtx.Provider>
  )
}

function AnimatedTabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn("relative inline-flex w-fit items-center gap-1 rounded-full border border-border p-1", className)}
      {...props}
    />
  )
}

function AnimatedTabsTrigger({
  className,
  value,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const ctx = React.useContext(TabsCtx)
  const active = ctx.value === value
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      value={value}
      className={cn(
        "relative inline-flex h-8 items-center justify-center rounded-full px-4 text-sm font-[400] whitespace-nowrap text-muted-foreground",
        "transition-[color,font-weight] duration-[var(--cie-t-cell,320ms)] ease-cie-expo hover:text-foreground",
        "data-[state=active]:font-[520] data-[state=active]:text-primary-foreground",
        "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40",
        className
      )}
      {...props}
    >
      {active && (
        <motion.span
          layoutId={`${ctx.id}-pill`}
          className="absolute inset-0 -z-0 rounded-full bg-primary"
          transition={cieTransition.spring}
        />
      )}
      <span className="relative z-10">{children}</span>
    </TabsPrimitive.Trigger>
  )
}

/** Wrap all <AnimatedTabsContent> in this to get the smooth height change. */
function AnimatedTabsPanels({ className, children, ...props }: React.ComponentProps<"div">) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [height, setHeight] = React.useState<number | "auto">("auto")
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setHeight(e.borderBoxSize?.[0]?.blockSize ?? el.offsetHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <motion.div
      data-slot="tabs-panels"
      className={cn("relative overflow-hidden", className)}
      animate={{ height }}
      transition={{ duration: cieDuration.move, ease: cieEase.expo }}
      {...(props as React.ComponentProps<typeof motion.div>)}
    >
      <div ref={ref}>{children}</div>
    </motion.div>
  )
}

function AnimatedTabsContent({
  className,
  value,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  // Radix unmounts inactive panels; each newly-active panel rises in. (No exit pass:
  // Radix hides the outgoing panel synchronously, and the height glide covers the swap.)
  return (
    <TabsPrimitive.Content value={value} asChild {...props}>
      <motion.div
        data-slot="tabs-content"
        className={cn("outline-none", className)}
        initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={cieTransition.rise}
      >
        {children}
      </motion.div>
    </TabsPrimitive.Content>
  )
}

export { AnimatedTabs, AnimatedTabsContent, AnimatedTabsList, AnimatedTabsPanels, AnimatedTabsTrigger }
