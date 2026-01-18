"use client"

import * as React from "react"
import { Slot } from "@/slot/src/index.js"

/**
 * Tabs primitives (Base-UI-style), built for shadcn-style wrappers.
 *
 * Exports (no aliases):
 * - TabsRoot
 * - TabsList
 * - TabsTrigger
 * - TabsPanel
 *
 * Goals:
 * - Controlled + uncontrolled
 * - Roving tabindex + arrow key navigation
 * - Orientation: horizontal | vertical
 * - Activation mode: automatic | manual
 * - Accessible semantics:
 *    - Root: manages state + exposes context
 *    - List: role="tablist"
 *    - Trigger: role="tab" aria-selected aria-controls id
 *    - Panel: role="tabpanel" aria-labelledby id, hidden when inactive
 * - asChild support using @haitch-ui/react/slot on List/Trigger/Panel/Root
 * - Data attrs for styling: data-[state=active|inactive], data-[orientation], data-[disabled]
 *
 * Notes:
 * - This is the "primitive layer" (headless). Your shadcn wrapper can apply styles and layout.
 * - Panels are conditionally hidden (not unmounted by default).
 */

type Orientation = "horizontal" | "vertical"
type ActivationMode = "automatic" | "manual"

type DataAttrs = {
  "data-slot"?: string
  "data-state"?: "active" | "inactive"
  "data-orientation"?: Orientation
  "data-disabled"?: "" | undefined
}

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (node: T) => {
    for (const ref of refs) {
      if (!ref) continue
      if (typeof ref === "function") ref(node)
      else (ref as React.MutableRefObject<T | null>).current = node
    }
  }
}

function composeEventHandlers<E extends { defaultPrevented?: boolean }>(
  theirHandler: ((event: E) => void) | undefined,
  ourHandler: (event: E) => void
) {
  return (event: E) => {
    theirHandler?.(event)
    if (event.defaultPrevented) return
    ourHandler(event)
  }
}

function useStableId(provided?: string) {
  const reactId = React.useId()
  return provided ?? reactId
}

type TriggerRecord = {
  value: string
  disabled: boolean
  ref: React.RefObject<HTMLElement | null>
  id: string
}

function sortByDomOrder(items: TriggerRecord[]) {
  const nodes = items
    .map((it) => ({ it, node: it.ref.current }))
    .filter((x): x is { it: TriggerRecord; node: HTMLElement } => Boolean(x.node))

  if (nodes.length !== items.length) return items

  nodes.sort((a, b) => {
    const pos = a.node.compareDocumentPosition(b.node)
    if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1
    if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1
    return 0
  })

  return nodes.map((n) => n.it)
}

function firstEnabledIndex(items: Array<{ disabled: boolean }>) {
  return items.findIndex((it) => !it.disabled)
}

function lastEnabledIndex(items: Array<{ disabled: boolean }>) {
  for (let i = items.length - 1; i >= 0; i--) if (!items[i]?.disabled) return i
  return -1
}

function nextEnabledIndex(items: Array<{ disabled: boolean }>, from: number, dir: 1 | -1) {
  const n = items.length
  for (let step = 1; step <= n; step++) {
    const idx = (from + dir * step + n) % n
    if (!items[idx]?.disabled) return idx
  }
  return from
}

/* -------------------------------------------------------------------------------------------------
 * Context
 * ------------------------------------------------------------------------------------------------- */

type TabsContextValue = {
  baseId: string
  value: string | null
  setValue: (value: string) => void
  disabled: boolean
  orientation: Orientation
  activationMode: ActivationMode

  registerTrigger: (record: TriggerRecord) => void
  unregisterTrigger: (id: string) => void
  getTriggers: () => TriggerRecord[]
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabsContext(name: string) {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error(`${name} must be used within <TabsRoot>.`)
  return ctx
}

function makeTriggerId(baseId: string, value: string) {
  return `${baseId}-trigger-${encodeURIComponent(value)}`
}
function makePanelId(baseId: string, value: string) {
  return `${baseId}-panel-${encodeURIComponent(value)}`
}

/* -------------------------------------------------------------------------------------------------
 * TabsRoot
 * ------------------------------------------------------------------------------------------------- */

export type TabsRootProps = Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> & {
  asChild?: boolean

  value?: string | null
  defaultValue?: string
  onValueChange?: (value: string) => void

  disabled?: boolean
  orientation?: Orientation
  activationMode?: ActivationMode
}

export const Root = React.forwardRef<HTMLDivElement, TabsRootProps>(function TabsRoot(
  {
    asChild,
    value: valueProp,
    defaultValue,
    onValueChange,
    disabled = false,
    orientation = "horizontal",
    activationMode = "automatic",
    children,
    ...rest
  },
  ref
) {
  const baseId = useStableId(rest.id)

  const isControlled = valueProp !== undefined
  const [uncontrolled, setUncontrolled] = React.useState<string | null>(() => defaultValue ?? null)

  const value = isControlled ? (valueProp ?? null) : uncontrolled

  const setValue = React.useCallback(
    (next: string) => {
      if (disabled) return
      onValueChange?.(next)
      if (!isControlled) setUncontrolled(next)
    },
    [disabled, isControlled, onValueChange]
  )

  const triggersRef = React.useRef<TriggerRecord[]>([])

  const registerTrigger = React.useCallback((record: TriggerRecord) => {
    triggersRef.current = [...triggersRef.current.filter((x) => x.id !== record.id), record]
  }, [])

  const unregisterTrigger = React.useCallback((id: string) => {
    triggersRef.current = triggersRef.current.filter((x) => x.id !== id)
  }, [])

  const getTriggers = React.useCallback(() => sortByDomOrder(triggersRef.current), [])

  const ctx = React.useMemo<TabsContextValue>(
    () => ({
      baseId,
      value,
      setValue,
      disabled,
      orientation,
      activationMode,
      registerTrigger,
      unregisterTrigger,
      getTriggers,
    }),
    [
      activationMode,
      baseId,
      disabled,
      getTriggers,
      orientation,
      registerTrigger,
      setValue,
      unregisterTrigger,
      value,
    ]
  )

  const dataAttrs: DataAttrs = {
    "data-slot": "tabs",
    "data-orientation": orientation,
    ...(disabled ? { "data-disabled": "" } : null),
  }

  const Comp: any = asChild ? Slot : "div"

  return (
    <TabsContext.Provider value={ctx}>
      <Comp ref={ref} {...dataAttrs} {...rest}>
        {children}
      </Comp>
    </TabsContext.Provider>
  )
})

/* -------------------------------------------------------------------------------------------------
 * TabsList
 * ------------------------------------------------------------------------------------------------- */

export type TabsListProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean
  "aria-label"?: string
}

export const List = React.forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { asChild, onKeyDown, ...rest },
  ref
) {
  const ctx = useTabsContext("TabsList")

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (ctx.disabled) return

      const triggers = ctx.getTriggers()
      if (triggers.length === 0) return

      const activeEl = document.activeElement
      const currentIndex = triggers.findIndex((t) => t.ref.current === activeEl)

      const isHorizontal = ctx.orientation === "horizontal"
      const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp"
      const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown"

      const focusTo = (idx: number) => {
        const el = triggers[idx]?.ref.current
        if (!el) return
        el.focus()
        if (ctx.activationMode === "automatic") {
          const v = triggers[idx]?.value
          if (v) ctx.setValue(v)
        }
      }

      if (e.key === prevKey || e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault()
        const from = currentIndex >= 0 ? currentIndex : firstEnabledIndex(triggers)
        if (from < 0) return
        focusTo(nextEnabledIndex(triggers, from, -1))
        return
      }

      if (e.key === nextKey || e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault()
        const from = currentIndex >= 0 ? currentIndex : firstEnabledIndex(triggers)
        if (from < 0) return
        focusTo(nextEnabledIndex(triggers, from, 1))
        return
      }

      if (e.key === "Home") {
        e.preventDefault()
        const to = firstEnabledIndex(triggers)
        if (to >= 0) focusTo(to)
        return
      }

      if (e.key === "End") {
        e.preventDefault()
        const to = lastEnabledIndex(triggers)
        if (to >= 0) focusTo(to)
        return
      }

      if (ctx.activationMode === "manual" && (e.key === "Enter" || e.key === " ")) {
        // In manual mode, Enter/Space activates the focused tab
        const focused = triggers.find((t) => t.ref.current === document.activeElement)
        if (!focused || focused.disabled) return
        e.preventDefault()
        ctx.setValue(focused.value)
      }
    },
    [ctx]
  )

  const dataAttrs: DataAttrs = {
    "data-slot": "tabs-list",
    "data-orientation": ctx.orientation,
    ...(ctx.disabled ? { "data-disabled": "" } : null),
  }

  const Comp: any = asChild ? Slot : "div"

  return (
    <Comp
      ref={ref}
      role="tablist"
      aria-orientation={ctx.orientation}
      {...dataAttrs}
      {...rest}
      onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
    />
  )
})

/* -------------------------------------------------------------------------------------------------
 * TabsTrigger
 * ------------------------------------------------------------------------------------------------- */

export type TabsTriggerProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "value" | "onChange" | "role" | "aria-selected" | "aria-controls"
> & {
  asChild?: boolean
  value: string
  disabled?: boolean
}

export const Trigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(function TabsTrigger(
  { asChild, value, disabled: disabledProp, onClick, onKeyDown, tabIndex, type, ...rest },
  ref
) {
  const ctx = useTabsContext("TabsTrigger")
  const id = useStableId(rest.id)

  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  const disabled = Boolean(ctx.disabled || disabledProp)
  const active = ctx.value === value

  React.useEffect(() => {
    ctx.registerTrigger({
      id,
      value,
      disabled,
      ref: triggerRef as React.RefObject<HTMLElement | null>,
    })
    return () => ctx.unregisterTrigger(id)
  }, [ctx, disabled, id, value])

  // roving tabindex: active tab is tabbable; otherwise first enabled tab.
  const computedTabIndex = React.useMemo(() => {
    if (disabled) return -1

    const triggers = ctx.getTriggers()
    if (triggers.length === 0) return 0

    if (active) return 0

    const firstEnabled = firstEnabledIndex(triggers)
    const firstValue = firstEnabled >= 0 ? triggers[firstEnabled]?.value : undefined
    return firstValue === value ? 0 : -1
  }, [active, ctx, disabled, value])

  const activate = React.useCallback(() => {
    if (disabled) return
    ctx.setValue(value)
  }, [ctx, disabled, value])

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) {
        e.preventDefault()
        return
      }
      activate()
    },
    [activate, disabled]
  )

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return
      if (ctx.activationMode === "manual" && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault()
        activate()
      }
    },
    [activate, ctx.activationMode, disabled]
  )

  const dataAttrs: DataAttrs = {
    "data-slot": "tabs-trigger",
    "data-state": active ? "active" : "inactive",
    "data-orientation": ctx.orientation,
    ...(disabled ? { "data-disabled": "" } : null),
  }

  const triggerId = makeTriggerId(ctx.baseId, value)
  const panelId = makePanelId(ctx.baseId, value)

  const Comp: any = asChild ? Slot : "button"

  return (
    <Comp
      ref={mergeRefs(ref, triggerRef)}
      id={triggerId}
      type={type ?? "button"}
      role="tab"
      aria-selected={active}
      aria-controls={panelId}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      tabIndex={tabIndex ?? computedTabIndex}
      {...dataAttrs}
      {...rest}
      onClick={composeEventHandlers(onClick, handleClick)}
      onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
    />
  )
})

/* -------------------------------------------------------------------------------------------------
 * TabsPanel
 * ------------------------------------------------------------------------------------------------- */

export type TabsPanelProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean
  value: string
  /** When true, unmount inactive panels. Default: false (use hidden). */
  unmountOnExit?: boolean
}

export const Content = React.forwardRef<HTMLDivElement, TabsPanelProps>(function TabsPanel(
  { asChild, value, unmountOnExit = false, children, ...rest },
  ref
) {
  const ctx = useTabsContext("TabsPanel")
  const active = ctx.value === value

  const panelId = makePanelId(ctx.baseId, value)
  const triggerId = makeTriggerId(ctx.baseId, value)

  const dataAttrs: DataAttrs = {
    "data-slot": "tabs-panel",
    "data-state": active ? "active" : "inactive",
    "data-orientation": ctx.orientation,
    ...(ctx.disabled ? { "data-disabled": "" } : null),
  }

  if (!active && unmountOnExit) return null

  const Comp: any = asChild ? Slot : "div"

  return (
    <Comp
      ref={ref}
      id={panelId}
      role="tabpanel"
      aria-labelledby={triggerId}
      hidden={!active}
      tabIndex={0}
      {...dataAttrs}
      {...rest}
    >
      {children}
    </Comp>
  )
})
