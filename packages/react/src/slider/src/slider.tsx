"use client"

import * as React from "react"

/**
 * Minimal, from-scratch Slider primitives (Base-UI-style)
 *
 * Goals:
 * - Headless primitives: <Slider.Root> + <Slider.Track> + <Slider.Range> + <Slider.Thumb>
 * - Controlled + uncontrolled value
 * - Single value slider (easy to extend to multi-thumb later)
 * - Accessible: role="slider", aria-* wiring, keyboard support
 * - Pointer + touch dragging with proper pointer capture
 * - Orientation: horizontal | vertical
 * - Optional form integration via hidden <input> (name)
 * - Data attributes for styling hooks: data-slot, data-disabled, data-orientation, data-dragging
 *
 * Usage:
 *   <Slider.Root value={v} onValueChange={setV} min={0} max={100} step={1} name="volume">
 *     <Slider.Track>
 *       <Slider.Range />
 *     </Slider.Track>
 *     <Slider.Thumb />
 *   </Slider.Root>
 */

type Orientation = "horizontal" | "vertical"

type DataAttrs = {
  "data-slot"?: string
  "data-disabled"?: "" | undefined
  "data-orientation"?: Orientation
  "data-dragging"?: "" | undefined
}

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}

function roundToStep(value: number, step: number, min: number) {
  const inv = 1 / step
  // avoid float drift by rounding in step space
  const snapped = Math.round((value - min) * inv) / inv + min
  // Normalize -0
  return Object.is(snapped, -0) ? 0 : snapped
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

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v)
}

function getPercent(value: number, min: number, max: number) {
  if (max <= min) return 0
  return ((value - min) / (max - min)) * 100
}

/** ---------- Context ---------- */

type SliderContextValue = {
  value: number
  min: number
  max: number
  step: number
  disabled: boolean
  orientation: Orientation
  dragging: boolean
  setDragging: (d: boolean) => void
  setValueFromPointer: (clientX: number, clientY: number, opts?: { commit?: boolean }) => void
  setValue: (next: number, opts?: { commit?: boolean }) => void
  percent: number
  rootRef: React.RefObject<HTMLDivElement | null>
}

const SliderContext = React.createContext<SliderContextValue | null>(null)

function useSliderContext(name: string) {
  const ctx = React.useContext(SliderContext)
  if (!ctx) throw new Error(`${name} must be used within <Slider.Root>.`)
  return ctx
}

/** ---------- Root ---------- */

type RootOwnProps = {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  onValueCommit?: (value: number) => void

  min?: number
  max?: number
  step?: number
  disabled?: boolean
  orientation?: Orientation

  name?: string
  required?: boolean
}

type RootProps = Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> &
  RootOwnProps & {
    children?: React.ReactNode
  }

const Root = React.forwardRef<HTMLDivElement, RootProps>(function SliderRoot(
  {
    value: valueProp,
    defaultValue,
    onValueChange,
    onValueCommit,
    min: minProp = 0,
    max: maxProp = 100,
    step: stepProp = 1,
    disabled = false,
    orientation = "horizontal",
    name,
    required,
    children,
    onPointerDown,
    onKeyDown,
    ...divProps
  },
  ref
) {
  const rootRef = React.useRef<HTMLDivElement | null>(null)

  const min = isFiniteNumber(minProp) ? minProp : 0
  const maxRaw = isFiniteNumber(maxProp) ? maxProp : 100
  const max = Math.max(maxRaw, min + Number.EPSILON)

  const step = isFiniteNumber(stepProp) && stepProp > 0 ? stepProp : 1

  const isControlled = valueProp !== undefined
  const [uncontrolledValue, setUncontrolledValue] = React.useState<number>(() => {
    const v = isFiniteNumber(defaultValue) ? defaultValue : min
    const clamped = clamp(v, min, max)
    return roundToStep(clamped, step, min)
  })

  const [dragging, setDragging] = React.useState(false)

  const valueRaw = isControlled ? (valueProp ?? min) : uncontrolledValue
  const value = roundToStep(clamp(valueRaw, min, max), step, min)
  const percent = clamp(getPercent(value, min, max), 0, 100)

  const setValue = React.useCallback(
    (next: number, opts?: { commit?: boolean }) => {
      if (disabled) return
      const clamped = roundToStep(clamp(next, min, max), step, min)

      onValueChange?.(clamped)
      if (!isControlled) setUncontrolledValue(clamped)

      if (opts?.commit) onValueCommit?.(clamped)
    },
    [disabled, isControlled, max, min, onValueChange, onValueCommit, step]
  )

  const setValueFromPointer = React.useCallback(
    (clientX: number, clientY: number, opts?: { commit?: boolean }) => {
      const el = rootRef.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const vertical = orientation === "vertical"

      let ratio = 0
      if (vertical) {
        // bottom = min, top = max
        const y = clamp(clientY - rect.top, 0, rect.height)
        ratio = rect.height === 0 ? 0 : 1 - y / rect.height
      } else {
        const x = clamp(clientX - rect.left, 0, rect.width)
        ratio = rect.width === 0 ? 0 : x / rect.width
      }

      const next = min + ratio * (max - min)
      setValue(next, opts)
    },
    [max, min, orientation, setValue]
  )

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return
      // Only left click / primary touch
      if (e.pointerType === "mouse" && e.button !== 0) return

      const el = rootRef.current
      if (!el) return

      el.setPointerCapture(e.pointerId)
      setDragging(true)
      // focus for keyboard follow-up
      el.focus()

      setValueFromPointer(e.clientX, e.clientY, { commit: false })
      e.preventDefault()
    },
    [disabled, setValueFromPointer]
  )

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return
      if (!dragging) return
      setValueFromPointer(e.clientX, e.clientY, { commit: false })
      e.preventDefault()
    },
    [disabled, dragging, setValueFromPointer]
  )

  const endDrag = React.useCallback(
    (commitValue: boolean) => {
      if (!dragging) return
      setDragging(false)
      if (commitValue) onValueCommit?.(value)
    },
    [dragging, onValueCommit, value]
  )

  const handlePointerUp = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return
      if (!dragging) return
      // commit on release
      setValueFromPointer(e.clientX, e.clientY, { commit: true })
      endDrag(false) // commit already handled above
      e.preventDefault()
    },
    [disabled, dragging, endDrag, setValueFromPointer]
  )

  const handlePointerCancel = React.useCallback(() => {
    if (disabled) return
    endDrag(true)
  }, [disabled, endDrag])

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return

      const vertical = orientation === "vertical"
      const key = e.key

      const page = step * 10

      const commit = (next: number) => {
        setValue(next, { commit: true })
      }

      if (key === "Home") {
        e.preventDefault()
        commit(min)
        return
      }
      if (key === "End") {
        e.preventDefault()
        commit(max)
        return
      }

      if (key === "PageUp") {
        e.preventDefault()
        commit(value + page)
        return
      }
      if (key === "PageDown") {
        e.preventDefault()
        commit(value - page)
        return
      }

      // Arrows:
      // Horizontal: Left/Right
      // Vertical: Down decreases, Up increases (common slider convention)
      if (key === "ArrowLeft") {
        e.preventDefault()
        commit(value - step)
        return
      }
      if (key === "ArrowRight") {
        e.preventDefault()
        commit(value + step)
        return
      }
      if (key === "ArrowDown") {
        e.preventDefault()
        commit(value - step)
        return
      }
      if (key === "ArrowUp") {
        e.preventDefault()
        commit(value + step)
        return
      }

      // allow other keys
      void vertical
    },
    [disabled, max, min, orientation, setValue, step, value]
  )

  const ctx = React.useMemo<SliderContextValue>(
    () => ({
      value,
      min,
      max,
      step,
      disabled,
      orientation,
      dragging,
      setDragging,
      setValueFromPointer,
      setValue,
      percent,
      rootRef,
    }),
    [
      value,
      min,
      max,
      step,
      disabled,
      orientation,
      dragging,
      setValueFromPointer,
      setValue,
      percent,
    ]
  )

  const dataAttrs: DataAttrs = {
    "data-slot": "slider",
    "data-orientation": orientation,
    ...(disabled ? { "data-disabled": "" } : null),
    ...(dragging ? { "data-dragging": "" } : null),
  }

  return (
    <SliderContext.Provider value={ctx}>
      <div
        ref={mergeRefs(ref, rootRef)}
        tabIndex={disabled ? -1 : 0}
        role="slider"
        aria-disabled={disabled || undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-orientation={orientation}
        {...dataAttrs}
        {...divProps}
        onPointerDown={composeEventHandlers(onPointerDown, handlePointerDown)}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
      >
        {/* Optional form integration */}
        {name ? (
          <input
            type="hidden"
            name={name}
            value={String(value)}
            required={required}
            disabled={disabled}
            data-slot="slider-input"
          />
        ) : null}

        {children}
      </div>
    </SliderContext.Provider>
  )
})

/** ---------- Track ---------- */

type TrackProps = React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }

const Track = React.forwardRef<HTMLDivElement, TrackProps>(function SliderTrack(
  { children, ...props },
  ref
) {
  const ctx = useSliderContext("Slider.Track")
  const dataAttrs: DataAttrs = {
    "data-slot": "slider-track",
    "data-orientation": ctx.orientation,
    ...(ctx.disabled ? { "data-disabled": "" } : null),
  }
  return (
    <div ref={ref} {...dataAttrs} {...props}>
      {children}
    </div>
  )
})

/** ---------- Range ---------- */

type RangeProps = React.HTMLAttributes<HTMLDivElement>

const Range = React.forwardRef<HTMLDivElement, RangeProps>(function SliderRange(props, ref) {
  const ctx = useSliderContext("Slider.Range")
  const p = ctx.percent

  const style: React.CSSProperties =
    ctx.orientation === "vertical"
      ? {
          // range fills from bottom to percent
          height: `${p}%`,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          ...(props.style ?? {}),
        }
      : {
          width: `${p}%`,
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          ...(props.style ?? {}),
        }

  const dataAttrs: DataAttrs = {
    "data-slot": "slider-range",
    "data-orientation": ctx.orientation,
    ...(ctx.disabled ? { "data-disabled": "" } : null),
  }

  return <div ref={ref} {...dataAttrs} {...props} style={style} />
})

/** ---------- Thumb ---------- */

type ThumbProps = React.HTMLAttributes<HTMLDivElement>

const Thumb = React.forwardRef<HTMLDivElement, ThumbProps>(function SliderThumb(props, ref) {
  const ctx = useSliderContext("Slider.Thumb")
  const p = ctx.percent

  const style: React.CSSProperties =
    ctx.orientation === "vertical"
      ? {
          position: "absolute",
          left: "50%",
          bottom: `${p}%`,
          transform: "translate(-50%, 50%)",
          touchAction: "none",
          ...(props.style ?? {}),
        }
      : {
          position: "absolute",
          top: "50%",
          left: `${p}%`,
          transform: "translate(-50%, -50%)",
          touchAction: "none",
          ...(props.style ?? {}),
        }

  const dataAttrs: DataAttrs = {
    "data-slot": "slider-thumb",
    "data-orientation": ctx.orientation,
    ...(ctx.disabled ? { "data-disabled": "" } : null),
    ...(ctx.dragging ? { "data-dragging": "" } : null),
  }

  // Note: The "interactive" element is Root (role=slider). Thumb is visual.
  // If you prefer the Thumb to be the focusable element, tell me and I’ll flip it.
  return <div ref={ref} {...dataAttrs} {...props} style={style} />
})

export const Slider = { Root, Track, Range, Thumb }
export { Root, Track, Range, Thumb }
