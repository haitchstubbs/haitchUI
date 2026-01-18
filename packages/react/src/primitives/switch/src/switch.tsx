"use client"

import * as React from "react"

/**
 * Switch primitives (Base-UI-style), from scratch, single file.
 *
 * Exports (no aliases):
 * - SwitchRoot
 * - SwitchThumb
 *
 * Features:
 * - Headless + fully styleable via className/CSS + data attributes
 * - Accessible: role="switch", aria-checked, keyboard (Space/Enter)
 * - Controlled + uncontrolled
 * - Disabled + required
 * - Optional form integration:
 *    - If `name` is provided, renders a hidden checkbox input for native form submit
 *      and sets checked/required/disabled accordingly.
 *
 * Data attributes:
 * - Root: data-slot="switch", data-state="checked|unchecked", data-disabled
 * - Thumb: data-slot="switch-thumb", inherits checked/disabled via item context
 */

type DataAttrs = {
  "data-slot"?: string
  "data-state"?: "checked" | "unchecked"
  "data-disabled"?: "" | undefined
  "data-checked"?: "" | undefined
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

type SwitchContextValue = {
  checked: boolean
  disabled: boolean
}

const SwitchContext = React.createContext<SwitchContextValue | null>(null)

function useSwitchContext(componentName: string) {
  const ctx = React.useContext(SwitchContext)
  if (!ctx) throw new Error(`${componentName} must be used within <SwitchRoot>.`)
  return ctx
}

export type SwitchRootProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "role" | "aria-checked" | "onChange"
> & {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void

  disabled?: boolean
  required?: boolean

  /** Optional form integration */
  name?: string
  value?: string
  form?: string
}

export const Root = React.forwardRef<HTMLButtonElement, SwitchRootProps>(function SwitchRoot(
  {
    checked: checkedProp,
    defaultChecked,
    onCheckedChange,
    disabled = false,
    required = false,
    name,
    value = "on",
    form,
    children,
    onClick,
    onKeyDown,
    type,
    ...buttonProps
  },
  ref
) {
  const isControlled = checkedProp !== undefined
  const [uncontrolledChecked, setUncontrolledChecked] = React.useState<boolean>(() => {
    return Boolean(defaultChecked)
  })

  const checked = isControlled ? Boolean(checkedProp) : uncontrolledChecked

  const setChecked = React.useCallback(
    (next: boolean) => {
      if (disabled) return
      onCheckedChange?.(next)
      if (!isControlled) setUncontrolledChecked(next)
    },
    [disabled, isControlled, onCheckedChange]
  )

  const toggle = React.useCallback(() => {
    setChecked(!checked)
  }, [checked, setChecked])

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) {
        e.preventDefault()
        return
      }
      toggle()
    },
    [disabled, toggle]
  )

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault()
        toggle()
      }
    },
    [disabled, toggle]
  )

  const dataAttrs: DataAttrs = {
    "data-slot": "switch",
    "data-state": checked ? "checked" : "unchecked",
    ...(checked ? { "data-checked": "" } : null),
    ...(disabled ? { "data-disabled": "" } : null),
  }

  return (
    <SwitchContext.Provider value={{ checked, disabled }}>
      <button
        ref={ref}
        type={type ?? "button"}
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        {...dataAttrs}
        {...buttonProps}
        onClick={composeEventHandlers(onClick, handleClick)}
        onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
      >
        {/* Native form integration */}
        {name ? (
          <input
            data-slot="switch-input"
            type="checkbox"
            tabIndex={-1}
            aria-hidden="true"
            name={name}
            value={value}
            form={form}
            checked={checked}
            required={required}
            disabled={disabled}
            readOnly
            // visually hidden; you can override if you want
            style={{
              position: "absolute",
              opacity: 0,
              pointerEvents: "none",
              width: 1,
              height: 1,
              margin: 0,
            }}
          />
        ) : null}
        {children}
      </button>
    </SwitchContext.Provider>
  )
})

export type SwitchThumbProps = React.HTMLAttributes<HTMLSpanElement>

export const Thumb = React.forwardRef<HTMLSpanElement, SwitchThumbProps>(function SwitchThumb(
  { children, ...spanProps },
  ref
) {
  const ctx = useSwitchContext("SwitchThumb")

  const dataAttrs: DataAttrs = {
    "data-slot": "switch-thumb",
    "data-state": ctx.checked ? "checked" : "unchecked",
    ...(ctx.checked ? { "data-checked": "" } : null),
    ...(ctx.disabled ? { "data-disabled": "" } : null),
  }

  return (
    <span ref={ref} {...dataAttrs} {...spanProps}>
      {children}
    </span>
  )
})
