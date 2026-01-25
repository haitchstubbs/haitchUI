"use client"

import * as React from "react"
import { composeRefs } from "@/utils/compose-refs"
import { composeEventHandlers } from "@/utils/compose-event-handlers"
type Orientation = "horizontal" | "vertical"

type DataAttrs = {
  "data-slot"?: string
  "data-state"?: "checked" | "unchecked"
  "data-disabled"?: "" | undefined
  "data-checked"?: "" | undefined
  "data-orientation"?: Orientation
}



/** ---------- Root context ---------- */

type ItemRecord = {
  id: string
  value: string
  disabled: boolean
  ref: React.RefObject<HTMLElement | null>
}

type RadioGroupContextValue = {
  name?: string
  required?: boolean
  disabled?: boolean
  orientation: Orientation
  value: string | null
  setValue: (next: string) => void
  selectOnFocus: boolean

  registerItem: (record: ItemRecord) => void
  unregisterItem: (id: string) => void
  getItems: () => ItemRecord[]
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null)

function useRadioGroupContext(componentName: string) {
  const ctx = React.useContext(RadioGroupContext)
  if (!ctx) throw new Error(`${componentName} must be used within <RadioGroup.Root>.`)
  return ctx
}

function useStableId(provided?: string) {
  const reactId = React.useId()
  return provided ?? reactId
}

function sortByDomOrder(items: ItemRecord[]) {
  const nodes = items
    .map((it) => ({ it, node: it.ref.current }))
    .filter((x): x is { it: ItemRecord; node: HTMLElement } => Boolean(x.node))

  if (nodes.length !== items.length) return items

  nodes.sort((a, b) => {
    const pos = a.node.compareDocumentPosition(b.node)
    if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1
    if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1
    return 0
  })

  return nodes.map((n) => n.it)
}

function firstEnabledIndex(items: ItemRecord[]) {
  return items.findIndex((it) => !it.disabled)
}

function lastEnabledIndex(items: ItemRecord[]) {
  for (let i = items.length - 1; i >= 0; i--) if (!items[i]?.disabled) return i
  return -1
}

function nextEnabledIndex(items: ItemRecord[], from: number, dir: 1 | -1) {
  const n = items.length
  for (let step = 1; step <= n; step++) {
    const idx = (from + dir * step + n) % n
    if (!items[idx]?.disabled) return idx
  }
  return from
}

/** ---------- Root ---------- */

type RootOwnProps = {
  value?: string | null
  defaultValue?: string
  onValueChange?: (value: string) => void

  name?: string
  required?: boolean
  disabled?: boolean
  orientation?: Orientation

  /**
   * When true (default), arrow keys set the value as focus moves.
   * When false, arrows only move focus; Space/Enter selects.
   */
  selectOnFocus?: boolean
}

type RootProps = Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> &
  RootOwnProps & {
    children?: React.ReactNode
  }

const RadioGroupRoot = React.forwardRef<HTMLDivElement, RootProps>(function RadioGroupRoot(
  {
    value: valueProp,
    defaultValue,
    onValueChange,
    name,
    required,
    disabled,
    orientation = "vertical",
    selectOnFocus = true,
    children,
    onKeyDown,
    ...divProps
  },
  ref
) {
  const isControlled = valueProp !== undefined
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string | null>(
    defaultValue ?? null
  )

  const value = isControlled ? (valueProp ?? null) : uncontrolledValue

  const itemsRef = React.useRef<ItemRecord[]>([])

  const registerItem = React.useCallback((record: ItemRecord) => {
    itemsRef.current = [...itemsRef.current.filter((x) => x.id !== record.id), record]
  }, [])

  const unregisterItem = React.useCallback((id: string) => {
    itemsRef.current = itemsRef.current.filter((x) => x.id !== id)
  }, [])

  const getItems = React.useCallback(() => sortByDomOrder(itemsRef.current), [])

  const setValue = React.useCallback(
    (next: string) => {
      if (disabled) return
      onValueChange?.(next)
      if (!isControlled) setUncontrolledValue(next)
    },
    [disabled, isControlled, onValueChange]
  )

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return

      const items = getItems()
      if (items.length === 0) return

      const activeEl = document.activeElement
      const currentIndex = items.findIndex((it) => it.ref.current === activeEl)

      const isHorizontal = orientation === "horizontal"
      const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp"
      const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown"

      const moveTo = (toIndex: number) => {
        const target = items[toIndex]?.ref.current
        if (!target) return
        target.focus()
        if (selectOnFocus) {
          const v = items[toIndex]?.value
          if (v) setValue(v)
        }
      }

      const key = e.key

      if (key === prevKey || key === "ArrowLeft" || key === "ArrowUp") {
        e.preventDefault()
        const from = currentIndex >= 0 ? currentIndex : firstEnabledIndex(items)
        if (from < 0) return
        moveTo(nextEnabledIndex(items, from, -1))
        return
      }

      if (key === nextKey || key === "ArrowRight" || key === "ArrowDown") {
        e.preventDefault()
        const from = currentIndex >= 0 ? currentIndex : firstEnabledIndex(items)
        if (from < 0) return
        moveTo(nextEnabledIndex(items, from, 1))
        return
      }

      if (key === "Home") {
        e.preventDefault()
        const to = firstEnabledIndex(items)
        if (to >= 0) moveTo(to)
        return
      }

      if (key === "End") {
        e.preventDefault()
        const to = lastEnabledIndex(items)
        if (to >= 0) moveTo(to)
      }
    },
    [disabled, getItems, orientation, selectOnFocus, setValue]
  )

  const ctx = React.useMemo<RadioGroupContextValue>(
    () => ({
      name,
      required,
      disabled,
      orientation,
      value,
      setValue,
      selectOnFocus,
      registerItem,
      unregisterItem,
      getItems,
    }),
    [
      name,
      required,
      disabled,
      orientation,
      value,
      setValue,
      selectOnFocus,
      registerItem,
      unregisterItem,
      getItems,
    ]
  )

  const dataAttrs: DataAttrs = {
    "data-slot": "radio-group",
    "data-orientation": orientation,
    ...(disabled ? { "data-disabled": "" } : null),
  }

  return (
    <RadioGroupContext.Provider value={ctx}>
      <div
        ref={ref}
        role="radiogroup"
        aria-orientation={orientation}
        aria-disabled={disabled || undefined}
        {...dataAttrs}
        {...divProps}
        onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
      >
        {name ? (
          <input
            type="hidden"
            name={name}
            value={value ?? ""}
            required={required}
            disabled={disabled}
            data-slot="radio-group-input"
          />
        ) : null}
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
})

/** ---------- Item context (so Indicator is real) ---------- */

type ItemContextValue = {
  checked: boolean
  disabled: boolean
}

const RadioGroupItemContext = React.createContext<ItemContextValue | null>(null)

function useItemContext(componentName: string) {
  const ctx = React.useContext(RadioGroupItemContext)
  if (!ctx) throw new Error(`${componentName} must be used within <RadioGroup.Item>.`)
  return ctx
}

/** ---------- Item ---------- */

type ItemOwnProps = {
  value: string
  disabled?: boolean
}

type ItemProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> &
  ItemOwnProps & {
    children?: React.ReactNode
  }

const RadioGroupItem = React.forwardRef<HTMLButtonElement, ItemProps>(function RadioGroupItem(
  { value, disabled: disabledProp, children, onClick, onKeyDown, tabIndex, type, ...buttonProps },
  ref
) {
  const group = useRadioGroupContext("RadioGroup.Item")
  const id = useStableId(buttonProps.id)

  const itemRef = React.useRef<HTMLButtonElement | null>(null)

  const disabled = Boolean(group.disabled || disabledProp)
  const checked = group.value === value

  React.useEffect(() => {
    group.registerItem({ id, value, disabled, ref: itemRef as React.RefObject<HTMLElement | null> })
    return () => group.unregisterItem(id)
  }, [group, id, value, disabled])

  const computedTabIndex = React.useMemo(() => {
    if (disabled) return -1

    const items = group.getItems()
    if (items.length === 0) return 0

    if (checked) return 0

    const first = firstEnabledIndex(items)
    const firstValue = first >= 0 ? items[first]?.value : undefined
    return firstValue === value ? 0 : -1
  }, [checked, disabled, group, value])

  const select = React.useCallback(() => {
    if (disabled) return
    group.setValue(value)
  }, [disabled, group, value])

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) {
        e.preventDefault()
        return
      }
      select()
    },
    [disabled, select]
  )

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault()
        select()
      }
    },
    [disabled, select]
  )

  const dataAttrs: DataAttrs = {
    "data-slot": "radio-group-item",
    "data-orientation": group.orientation,
    "data-state": checked ? "checked" : "unchecked",
    ...(checked ? { "data-checked": "" } : null),
    ...(disabled ? { "data-disabled": "" } : null),
  }

  return (
    <RadioGroupItemContext.Provider value={{ checked, disabled }}>
      <button
        ref={composeRefs(ref, itemRef)}
        type={type ?? "button"}
        role="radio"
        aria-checked={checked}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        tabIndex={tabIndex ?? computedTabIndex}
        {...dataAttrs}
        {...buttonProps}
        onClick={composeEventHandlers(onClick, handleClick)}
        onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
      >
        {children}
      </button>
    </RadioGroupItemContext.Provider>
  )
})

/** ---------- Indicator ---------- */

type IndicatorProps = React.HTMLAttributes<HTMLSpanElement> & {
  /**
   * Render indicator even when unchecked (for CSS animations).
   * Default: false (only render when checked).
   */
  forceMount?: boolean
}

const RadioGroupIndicator = React.forwardRef<HTMLSpanElement, IndicatorProps>(function RadioGroupIndicator(
  { forceMount = false, children, ...spanProps },
  ref
) {
  const group = useRadioGroupContext("RadioGroup.Indicator")
  const item = useItemContext("RadioGroup.Indicator")

  if (!forceMount && !item.checked) return null

  const dataAttrs: DataAttrs = {
    "data-slot": "radio-group-indicator",
    "data-orientation": group.orientation,
    ...(item.checked ? { "data-checked": "" } : null),
    ...(item.disabled ? { "data-disabled": "" } : null),
  }

  return (
    <span ref={ref} {...dataAttrs} {...spanProps}>
      {children}
    </span>
  )
})

export const RadioGroup = { RadioGroupRoot, RadioGroupItem, RadioGroupIndicator }
export { RadioGroupRoot, RadioGroupItem, RadioGroupIndicator }