"use client"

import * as React from "react"
import { Slot } from "@/slot/src/index.js"

/**
 * Toggle + ToggleGroup primitives (Base-UI-style), single file.
 *
 * Exports (no aliases):
 * - ToggleRoot
 * - ToggleGroupRoot
 * - ToggleGroupItem
 *
 * Accessibility semantics (default):
 * - ToggleRoot: <button> with aria-pressed
 * - ToggleGroupRoot:
 *    - type="single": role="radiogroup"
 *    - type="multiple": role="group"
 * - ToggleGroupItem:
 *    - type="single": role="radio" + aria-checked
 *    - type="multiple": role="checkbox" + aria-checked
 *
 * Keyboard:
 * - Space/Enter toggles selection on the focused item
 * - Arrow keys move focus within the group (roving focus enabled by default)
 * - Home/End jump to first/last enabled item
 *
 * asChild:
 * - All three primitives support `asChild` using @haitch-ui/react/slot
 *
 * Form integration:
 * - ToggleGroupRoot can render hidden inputs when `name` is provided
 *   - single: one hidden input
 *   - multiple: one hidden input per selected value
 */

type Orientation = "horizontal" | "vertical"

type DataAttrs = {
  "data-slot"?: string
  "data-disabled"?: "" | undefined
  "data-state"?: "on" | "off"
  "data-type"?: "single" | "multiple"
  "data-orientation"?: Orientation
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

function sortByDomOrder<T extends { ref: React.RefObject<HTMLElement | null> }>(items: T[]) {
  const nodes = items
    .map((it) => ({ it, node: it.ref.current }))
    .filter((x): x is { it: T; node: HTMLElement } => Boolean(x.node))

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
 * ToggleGroup
 * ------------------------------------------------------------------------------------------------- */

type ToggleGroupItemRegistry = {
  id: string
  value: string
  disabled: boolean
  ref: React.RefObject<HTMLButtonElement | null>
}

type ToggleGroupContextValue = {
  type: "single" | "multiple"
  disabled: boolean
  orientation: Orientation
  rovingFocus: boolean

  isPressed: (value: string) => boolean
  press: (value: string) => void

  registerItem: (item: ToggleGroupItemRegistry) => void
  unregisterItem: (id: string) => void
  getItems: () => ToggleGroupItemRegistry[]
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue | null>(null)

function useToggleGroupContext(componentName: string) {
  const ctx = React.useContext(ToggleGroupContext)
  if (!ctx) throw new Error(`${componentName} must be used within <ToggleGroupRoot>.`)
  return ctx
}

type ToggleGroupBaseProps = Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> & {
  asChild?: boolean
  disabled?: boolean
  orientation?: Orientation
  rovingFocus?: boolean

  /** Optional form integration */
  name?: string
  form?: string
}

type ToggleGroupSingleProps = ToggleGroupBaseProps & {
  type: "single"
  value?: string | null
  defaultValue?: string
  onValueChange?: (value: string | null) => void

  /** When true, cannot clear selection (radio-like) */
  requiredSelection?: boolean
}

type ToggleGroupMultipleProps = ToggleGroupBaseProps & {
  type: "multiple"
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}

export type ToggleGroupRootProps = ToggleGroupSingleProps | ToggleGroupMultipleProps

export const Root = React.forwardRef<HTMLDivElement, ToggleGroupRootProps>(
  function ToggleGroupRoot(rawProps, ref) {
    const props = rawProps as ToggleGroupRootProps & { children?: React.ReactNode }

    const {
      asChild,
      disabled = false,
      orientation = "horizontal",
      rovingFocus = true,
      name,
      form,
      onKeyDown,
      children,
      ...rest
    } = props

    const isSingle = props.type === "single"
    const requiredSelection = isSingle ? Boolean((props as ToggleGroupSingleProps).requiredSelection) : false

    const isControlled = (props as any).value !== undefined

    const [uncontrolledSingle, setUncontrolledSingle] = React.useState<string | null>(() => {
      if (!isSingle) return null
      return (props as ToggleGroupSingleProps).defaultValue ?? null
    })

    const [uncontrolledMultiple, setUncontrolledMultiple] = React.useState<string[]>(() => {
      if (isSingle) return []
      return (props as ToggleGroupMultipleProps).defaultValue ?? []
    })

    const valueSingle = isSingle
      ? (isControlled ? ((props as ToggleGroupSingleProps).value ?? null) : uncontrolledSingle)
      : null

    const valueMultiple = !isSingle
      ? (isControlled ? ((props as ToggleGroupMultipleProps).value ?? []) : uncontrolledMultiple)
      : []

    const commitSingle = React.useCallback(
      (next: string | null) => {
        ;(props as ToggleGroupSingleProps).onValueChange?.(next)
        if (!isControlled) setUncontrolledSingle(next)
      },
      [isControlled, props]
    )

    const commitMultiple = React.useCallback(
      (next: string[]) => {
        ;(props as ToggleGroupMultipleProps).onValueChange?.(next)
        if (!isControlled) setUncontrolledMultiple(next)
      },
      [isControlled, props]
    )

    const isPressed = React.useCallback(
      (v: string) => {
        if (isSingle) return valueSingle === v
        return valueMultiple.includes(v)
      },
      [isSingle, valueMultiple, valueSingle]
    )

    const press = React.useCallback(
      (v: string) => {
        if (disabled) return

        if (isSingle) {
          const currently = valueSingle === v
          const next = currently ? (requiredSelection ? v : null) : v
          commitSingle(next)
          return
        }

        const set = new Set(valueMultiple)
        if (set.has(v)) set.delete(v)
        else set.add(v)
        commitMultiple(Array.from(set))
      },
      [commitMultiple, commitSingle, disabled, isSingle, requiredSelection, valueMultiple, valueSingle]
    )

    // Registry for roving focus
    const itemsRef = React.useRef<ToggleGroupItemRegistry[]>([])

    const registerItem = React.useCallback((item: ToggleGroupItemRegistry) => {
      itemsRef.current = [...itemsRef.current.filter((x) => x.id !== item.id), item]
    }, [])

    const unregisterItem = React.useCallback((id: string) => {
      itemsRef.current = itemsRef.current.filter((x) => x.id !== id)
    }, [])

    const getItems = React.useCallback(() => sortByDomOrder(itemsRef.current), [])

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!rovingFocus || disabled) return

        const items = getItems()
        if (items.length === 0) return

        const activeEl = document.activeElement
        const currentIndex = items.findIndex((it) => it.ref.current === activeEl)

        const isHorizontal = orientation === "horizontal"
        const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp"
        const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown"

        const moveTo = (toIndex: number) => {
          const target = items[toIndex]?.ref.current
          target?.focus()
        }

        if (e.key === prevKey || e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault()
          const from = currentIndex >= 0 ? currentIndex : firstEnabledIndex(items)
          if (from < 0) return
          moveTo(nextEnabledIndex(items, from, -1))
          return
        }

        if (e.key === nextKey || e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault()
          const from = currentIndex >= 0 ? currentIndex : firstEnabledIndex(items)
          if (from < 0) return
          moveTo(nextEnabledIndex(items, from, 1))
          return
        }

        if (e.key === "Home") {
          e.preventDefault()
          const to = firstEnabledIndex(items)
          if (to >= 0) moveTo(to)
          return
        }

        if (e.key === "End") {
          e.preventDefault()
          const to = lastEnabledIndex(items)
          if (to >= 0) moveTo(to)
        }
      },
      [disabled, getItems, orientation, rovingFocus]
    )

    const ctx = React.useMemo<ToggleGroupContextValue>(
      () => ({
        type: props.type,
        disabled,
        orientation,
        rovingFocus,
        isPressed,
        press,
        registerItem,
        unregisterItem,
        getItems,
      }),
      [disabled, getItems, isPressed, orientation, press, props.type, registerItem, rovingFocus, unregisterItem]
    )

    const dataAttrs: DataAttrs = {
      "data-slot": "toggle-group",
      "data-type": props.type,
      "data-orientation": orientation,
      ...(disabled ? { "data-disabled": "" } : null),
    }

    // ARIA semantics by default:
    // - single -> radiogroup
    // - multiple -> group
    const role = props.type === "single" ? "radiogroup" : "group"
    const ariaOrientation = orientation

    // Form integration
    const hiddenInputs = name
      ? props.type === "single"
        ? [
            <input
              key="single"
              type="hidden"
              name={name}
              form={form}
              value={valueSingle ?? ""}
              disabled={disabled}
              data-slot="toggle-group-input"
            />,
          ]
        : valueMultiple.map((v) => (
            <input
              key={v}
              type="hidden"
              name={name}
              form={form}
              value={v}
              disabled={disabled}
              data-slot="toggle-group-input"
            />
          ))
      : null

    const Comp: any = asChild ? Slot : "div"

    return (
      <ToggleGroupContext.Provider value={ctx}>
        <Comp
          ref={ref}
          role={role}
          aria-orientation={ariaOrientation}
          aria-disabled={disabled || undefined}
          {...dataAttrs}
          {...rest}
          onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
        >
          {hiddenInputs}
          {children}
        </Comp>
      </ToggleGroupContext.Provider>
    )
  }
)

/* -------------------------------------------------------------------------------------------------
 * ToggleGroupItem
 * ------------------------------------------------------------------------------------------------- */

export type ToggleGroupItemProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "value" | "onChange" | "role" | "aria-checked"
> & {
  asChild?: boolean
  value: string
  disabled?: boolean
}

export const Item = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  function ToggleGroupItem(
    { asChild, value, disabled: disabledProp, onClick, onKeyDown, tabIndex, type, ...props },
    ref
  ) {
    const group = useToggleGroupContext("ToggleGroupItem")
    const id = useStableId((props as any).id)

    const itemRef = React.useRef<HTMLButtonElement | null>(null)

    const disabled = Boolean(group.disabled || disabledProp)
    const pressed = group.isPressed(value)

    React.useEffect(() => {
      group.registerItem({ id, value, disabled, ref: itemRef })
      return () => group.unregisterItem(id)
    }, [disabled, group, id, value])

    // Roving tabindex:
    // - make the first enabled selected item tabbable
    // - else first enabled item tabbable
    const computedTabIndex = React.useMemo(() => {
      if (!group.rovingFocus) return tabIndex
      if (disabled) return -1

      const items = group.getItems()
      if (items.length === 0) return 0

      const firstSelected = items.findIndex((it) => group.isPressed(it.value) && !it.disabled)
      if (firstSelected >= 0) {
        return items[firstSelected]?.id === id ? 0 : -1
      }

      const firstEnabled = firstEnabledIndex(items)
      if (firstEnabled >= 0) {
        return items[firstEnabled]?.id === id ? 0 : -1
      }

      return -1
    }, [disabled, group, id, tabIndex])

    const activate = React.useCallback(() => {
      if (disabled) return
      group.press(value)
    }, [disabled, group, value])

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
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault()
          activate()
        }
      },
      [activate, disabled]
    )

    // ARIA semantics by default:
    // - single -> radio
    // - multiple -> checkbox
    const role = group.type === "single" ? "radio" : "checkbox"

    const dataAttrs: DataAttrs = {
      "data-slot": "toggle-group-item",
      "data-state": pressed ? "on" : "off",
      "data-orientation": group.orientation,
      ...(disabled ? { "data-disabled": "" } : null),
    }

    const Comp: any = asChild ? Slot : "button"

    return (
      <Comp
        ref={mergeRefs(ref, itemRef)}
        type={type ?? "button"}
        role={role}
        aria-checked={pressed}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        tabIndex={computedTabIndex}
        {...dataAttrs}
        {...props}
        onClick={composeEventHandlers(onClick, handleClick)}
        onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
      />
    )
  }
)
