"use client"

import * as React from "react"
import { Slot } from "@/slot/src/index.js"

type DataAttrs = {
  "data-slot"?: string
  "data-state"?: "on" | "off"
  "data-disabled"?: "" | undefined
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

export type ToggleRootProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange" | "aria-pressed"
> & {
  asChild?: boolean
  pressed?: boolean
  defaultPressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  disabled?: boolean
}

export const Root = React.forwardRef<HTMLButtonElement, ToggleRootProps>(function ToggleRoot(
  {
    asChild,
    pressed: pressedProp,
    defaultPressed,
    onPressedChange,
    disabled = false,
    onClick,
    onKeyDown,
    type,
    children,
    ...rest
  },
  ref
) {
  const isControlled = pressedProp !== undefined
  const [uncontrolled, setUncontrolled] = React.useState<boolean>(() => Boolean(defaultPressed))
  const pressed = isControlled ? Boolean(pressedProp) : uncontrolled

  const setPressed = React.useCallback(
    (next: boolean) => {
      if (disabled) return
      onPressedChange?.(next)
      if (!isControlled) setUncontrolled(next)
    },
    [disabled, isControlled, onPressedChange]
  )

  const toggle = React.useCallback(() => setPressed(!pressed), [pressed, setPressed])

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
    "data-slot": "toggle",
    "data-state": pressed ? "on" : "off",
    ...(disabled ? { "data-disabled": "" } : null),
  }

  const sharedProps = {
    ref,
    type: type ?? "button",
    "aria-pressed": pressed,
    "aria-disabled": disabled || undefined,
    disabled,
    ...dataAttrs,
    ...rest,
    onClick: composeEventHandlers(onClick, handleClick),
    onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
  } as const

  if (asChild) {
    return <Slot {...sharedProps}>{children}</Slot>
  }

  return <button {...sharedProps}>{children}</button>
})

Root.displayName = "Toggle.Root"
