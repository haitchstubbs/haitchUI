Got it. Here’s a **generic, reusable agent instruction template** you can apply to *any* primitive (avatar, carousel, popover, select, tooltip, etc.), whether it needs portals or not.

---

## Generic Primitive Pattern (Radix-ish + Base-UI-ish + Shadcn wrappers)

### Goal

Build components in **two layers**:

1. **Primitive package** (`packages/react/<slug>`)
   Headless, accessible, minimal dependencies, high performance, Radix-ish API surface.

2. **Shadcn layer** (`apps/web/components/ui/...`)
   Styling + composition + icons + app conventions, consuming primitives like Radix.

---

## Layer 1: Primitive package rules

### 1) Always expose a compound component API

Export parts like:

* `Root`
* `Trigger`
* `Content`
* `Item`
* etc.

Also export a namespace object:

```ts
export const Thing = { Root, Trigger, Content, Item };
export { Root, Trigger, Content, Item };
```

### 2) `asChild` + Slot is mandatory

Every part that renders an element supports:

```ts
type Props = React.ComponentPropsWithoutRef<"div"> & { asChild?: boolean };
```

Implementation uses your Slot primitive. Primitives must not assume DOM structure.

### 3) Separate “Stable API” from “Reactive Engine”

Every primitive has:

#### A) **Stable API object** (imperative, identity-stable)

* Stored in `useRef`
* Safe to pass to outer layers
* Methods must read latest state from refs
* Equivalent to “Embla API” / “Radix context controller”

Example:

```ts
type Api = {
  open(): void;
  close(): void;
  toggle(): void;
  // or scrollPrev/scrollNext, etc.
};
```

#### B) **Reactive engine/context value**

* Returned with `useMemo`
* Contains state flags needed for rendering
* Contains `getXProps()` helpers
* Includes `api` pointer

Example:

```ts
type Engine = {
  open: boolean;
  disabled: boolean;
  getTriggerProps: (p) => p;
  getContentProps: (p) => p;
  api: Api;
};
```

### 4) Context is for internal parts only

The primitive exposes context internally:

* `useThingContext("Thing.Part")` throws outside Root
* Shadcn layer does **not** use this hook directly

### 5) Event + ref composition rules

* Never overwrite user handlers; compose them.
* Never drop refs; always merge with `composeRefs`.
* Slot handles event composition for `asChild`.

### 6) Performance rules

* **Never** put high-frequency events (scroll/drag/mousemove) into React state.
* Use refs for continuous values.
* Update DOM imperatively where required.
* Use `requestAnimationFrame` for animation/physics loops.
* Use `ResizeObserver` for layout measurement.

### 7) Accessibility rules (baseline)

* Put semantics where they belong:

  * keyboard handlers on Root/Trigger as needed
  * roles/aria on appropriate parts
* Don’t rely on “window” events by default.
* Respect `boundarySelector` scoping for keyboard/outside interactions if relevant (Shadow DOM safe).

---

## Optional Capability: Portals + Floating Positioning (only when needed)

### Decision rule

Only use portal/positioning logic when the component requires:

* overlay positioning (popover, tooltip, menu)
* escape overflow clipping
* layering above other UI

### Standard approach (when required)

Use **@floating-ui** as the positioning engine.

**Engine responsibilities (primitive layer):**

* owns `open` state + interactions (click/dismiss/role/focus)
* computes positioning (`x/y/strategy/refs`) via Floating UI
* optionally renders into a portal **scoped to a root container** (not global `document.body`)

**Root scoping rule**
Do not hardcode `window` or `document.body`. Prefer:

* a `portalContainer` prop OR
* a `boundarySelector` (default `.ui-root`) and portal into the nearest matching ancestor.

This makes it Shadow DOM friendly and avoids global coupling.

---

## Layer 2: Shadcn wrapper rules

### 1) Treat primitive as a dependency like Radix

Shadcn wrapper:

* imports `Root/Trigger/Content/...`
* passes Tailwind classes
* adds icons, sizing, layout
* preserves the familiar shadcn structure/API

### 2) Only consume the primitive’s **stable API**, never the engine

If the wrapper needs imperatives (scroll prev/next, open/close):

* use `onApi?: (api) => void` bridge from Root
* store the api in state or ref in wrapper

### 3) Wrapper never re-implements engine logic

No duplicate physics, no duplicate outside-click logic, no duplicate keyboard rules.
Only style + composition.

---

## Export contract checklist (for every primitive)

Each package must export:

* `Thing` namespace object
* named parts: `Root`, `Trigger`, `Content`, etc.
* stable types: `ThingApi`, `UseThingOptions`, `ThingState` (optional), `ThingEngine` (internal but typed)
* (optional) `useThingEngine` if you want direct headless usage, but default consumers should not need it.

---

## When generating a new primitive, do this sequence

1. Define public API: parts + props + events + `asChild`.
2. Write engine types:

   * `UseXOptions`
   * `XApi` (stable, imperative)
   * `XEngine` (reactive state + prop getters + `api`)
3. Implement `useXEngine`:

   * state + refs
   * stable apiRef.current
   * prop getters
4. Implement compound components:

   * Root provides context
   * parts read engine from context
   * parts call `engine.api.*` for setters/imperatives
5. Add `index.ts` exports for package.
6. Write shadcn wrapper:

   * same structure as shadcn’s Radix wrapper
   * styles only
   * uses `onApi` bridge when needed

---

## Default conventions

* Default `boundarySelector`: `.ui-root`
* Default `asChild`: `false`
* Prefer host elements: `div/span/button` (match Radix conventions)
* Avoid dependencies unless needed; Floating UI allowed for overlays.

---