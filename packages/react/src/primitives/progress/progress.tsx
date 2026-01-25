"use client"

import * as React from "react"

/**
 * Minimal, from-scratch Progress primitives (Base-UI-style)
 *
 * Goals:
 * - Headless primitives: <Progress.Root> + <Progress.Indicator>
 * - Full control over markup + styling (no classes, no external libs)
 * - Accessible: role="progressbar", aria-* wiring
 * - Controlled + uncontrolled value
 * - Determinate + indeterminate mode
 * - Data attributes for styling hooks: data-slot, data-state, data-value, data-max
 *
 * Usage:
 *   <Progress.Root value={60} max={100} className="..." >
 *     <Progress.Indicator className="..." />
 *   </Progress.Root>
 *
 * Or indeterminate:
 *   <Progress.Root indeterminate>
 *     <Progress.Indicator />
 *   </Progress.Root>
 */

type DataAttributes = {
  "data-slot"?: string
  "data-state"?: "indeterminate" | "complete" | "loading"
  "data-value"?: string
  "data-max"?: string
}

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v)
}

type RootContextValue = {
  value: number | null // null => indeterminate
  min: number
  max: number
  percent: number | null
  state: "indeterminate" | "complete" | "loading"
  getIndicatorStyle: (opts?: { orientation?: "horizontal" | "vertical" }) => React.CSSProperties
}

const ProgressContext = React.createContext<RootContextValue | null>(null)

function useProgressContext(componentName: string) {
  const ctx = React.useContext(ProgressContext)
  if (!ctx) {
    throw new Error(`${componentName} must be used within <Progress.Root>.`)
  }
  return ctx
}

export type RootOwnProps = {
  /**
   * Controlled determinate value. Use `null` for indeterminate.
   */
  value?: number | null
  /**
   * Uncontrolled initial value (determinate). Ignored if `value` is provided.
   */
  defaultValue?: number
  /**
   * Min value for determinate progress.
   */
  min?: number
  /**
   * Max value for determinate progress.
   */
  max?: number
  /**
   * Convenience flag for indeterminate progress.
   * If true, this overrides `value` to be indeterminate.
   */
  indeterminate?: boolean
  /**
   * Called when the internal uncontrolled value changes (if you wire updates).
   * (This primitive does not change value automatically; you control it.)
   */
  onValueChange?: (value: number) => void
  /**
   * If you want vertical progress, it affects the Indicator style helper.
   * Styling is still up to you.
   */
  orientation?: "horizontal" | "vertical"
}

export type ProgressRootProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> &
  RootOwnProps & {
    children?: React.ReactNode
  }

const Root = React.forwardRef<HTMLDivElement, ProgressRootProps>(function ProgressRoot(
  {
    value: valueProp,
    defaultValue,
    min: minProp = 0,
    max: maxProp = 100,
    indeterminate = false,
    onValueChange: _onValueChange,
    orientation = "horizontal",
    children,
    ...divProps
  },
  ref
) {
  // Normalize min/max
  const min = isFiniteNumber(minProp) ? minProp : 0
  const maxRaw = isFiniteNumber(maxProp) ? maxProp : 100
  const max = Math.max(maxRaw, min + Number.EPSILON)

  // Uncontrolled support (mostly for completeness)
  const [uncontrolledValue] = React.useState<number>(() => {
    const v = isFiniteNumber(defaultValue) ? defaultValue : min
    return clamp(v, min, max)
  })

  const isControlled = valueProp !== undefined
  const rawValue = indeterminate ? null : isControlled ? valueProp : uncontrolledValue

  const value =
    rawValue === null ? null : isFiniteNumber(rawValue) ? clamp(rawValue, min, max) : null

  const percent = value === null ? null : ((value - min) / (max - min)) * 100
  const state: RootContextValue["state"] =
    value === null ? "indeterminate" : value >= max ? "complete" : "loading"

  const getIndicatorStyle = React.useCallback<RootContextValue["getIndicatorStyle"]>(
    (opts) => {
      const ori = opts?.orientation ?? orientation
      if (percent === null) {
        // For indeterminate, we intentionally do not impose animation or size.
        // You can style [data-state="indeterminate"] however you like.
        return {}
      }

      const p = clamp(percent, 0, 100)

      // Base-UI-like behavior: indicator is 100% sized, and we translate it so
      // the visible portion matches p. This makes it easy to keep rounded ends.
      if (ori === "vertical") {
        // For vertical, we translate on Y so the bar "fills up" from bottom.
        // You may prefer to reverse this; change as needed.
        return {
          transform: `translateY(${100 - p}%)`,
        }
      }

      return {
        transform: `translateX(-${100 - p}%)`,
      }
    },
    [orientation, percent]
  )

  const ctx = React.useMemo<RootContextValue>(
    () => ({ value, min, max, percent, state, getIndicatorStyle }),
    [value, min, max, percent, state, getIndicatorStyle]
  )

  const dataAttrs: DataAttributes = {
    "data-slot": "progress",
    "data-state": state,
    "data-value": value === null ? "" : String(value),
    "data-max": String(max),
  }

  return (
    <ProgressContext.Provider value={ctx}>
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value === null ? undefined : value}
        aria-valuetext={value === null ? "Loading" : undefined}
        {...dataAttrs}
        {...divProps}
      >
        {children}
      </div>
    </ProgressContext.Provider>
  )
})

export type IndicatorOwnProps = {
  /**
   * Override how the indicator computes inline style.
   * - "transform" (default): uses translateX/translateY trick
   * - "scale": uses scaleX/scaleY (sometimes easier but can affect border radius)
   * - "none": does not apply any computed style; you fully control it
   */
  strategy?: "transform" | "scale" | "none"
  /**
   * If you want vertical indicator behavior, set orientation here or on Root.
   */
  orientation?: "horizontal" | "vertical"
}

export type ProgressIndicatorProps = React.HTMLAttributes<HTMLDivElement> & IndicatorOwnProps

const Indicator = React.forwardRef<HTMLDivElement, ProgressIndicatorProps>(function ProgressIndicator(
  { strategy = "transform", orientation, style, ...divProps },
  ref
) {
  const ctx = useProgressContext("Progress.Indicator")

  const dataAttrs: DataAttributes = {
    "data-slot": "progress-indicator",
    "data-state": ctx.state,
    "data-value": ctx.value === null ? "" : String(ctx.value),
    "data-max": String(ctx.max),
  }

  let computed: React.CSSProperties = {}
  const pct = ctx.percent

  if (strategy === "none") {
    computed = {}
  } else if (pct === null) {
    computed = {}
  } else {
    const p = clamp(pct, 0, 100) / 100
    const ori = orientation

    if (strategy === "scale") {
      computed =
        ori === "vertical"
          ? { transform: `scaleY(${p})`, transformOrigin: "bottom" }
          : { transform: `scaleX(${p})`, transformOrigin: "left" }
    } else {
      computed = ctx.getIndicatorStyle({ orientation: ori })
    }
  }

  return <div ref={ref} {...dataAttrs} {...divProps} style={{ ...computed, ...style }} />
})

/**
 * Optional utility primitives if you want a common pattern:
 * - <Progress.Track>: a neutral wrapper (just a div) for styling track/background.
 *   You can omit it and style Root directly if you prefer.
 */
export type ProgressTrackProps = React.HTMLAttributes<HTMLDivElement>
const Track = React.forwardRef<HTMLDivElement, ProgressTrackProps>(function ProgressTrack(props, ref) {
  // Track is purely presentational; no context required.
  const dataAttrs: DataAttributes = { "data-slot": "progress-track" }
  return <div ref={ref} {...dataAttrs} {...props} />
})

export const Progress = {
  Root,
  Indicator,
  Track,
}

// Also export individual components (handy for tree-shaking / named imports)
export { Root, Indicator, Track }
