# Slot

Note - this package is now deprecated. Future releases will be included in @haitch-ui/react

A **strict, compositional slot component** for React that safely forwards props, events, and refs to **exactly one valid child element**.

Designed for design systems and headless UI components where you want to enhance or wrap a child element **without adding extra DOM nodes**, while keeping behavior predictable and explicit.

---

## Table of Contents

* [Installation](#installation)
* [Why Slot Exists](#why-slot-exists)
* [Core Guarantees](#core-guarantees)
* [Basic Usage](#basic-usage)
* [Child Requirements](#child-requirements)

  * [Allowed](#allowed)
  * [Disallowed](#disallowed)
* [Prop Merging Rules](#prop-merging-rules)

  * [Default Behavior](#default-behavior)
  * [`className`](#classname)
  * [`style`](#style)
* [Event Handler Composition](#event-handler-composition)
* [Ref Behavior](#ref-behavior)
* [Intentional Constraints](#intentional-constraints)
* [Testing Philosophy](#testing-philosophy)
* [When to Use Slot](#when-to-use-slot)
* [API Reference](#api-reference)
* [Summary](#summary)

---

## Installation

```bash
npm i @haitch-ui/react
```

```tsx
import { Slot } from "@haitch-ui/react/slot
```

---

## Why Slot Exists

In many component libraries, you want to:

* Attach props to *user-provided elements*
* Avoid extra wrappers (`div`, `span`, etc.)
* Preserve refs and event handlers
* Maintain strict control over structure

`Slot` enforces **exactly one valid React element child** and clones it with deterministic, well-defined merging rules.

---

## Core Guarantees

`Slot` guarantees:

1. **Exactly one non-whitespace child**
2. **Child must be a valid React element**
3. **Fragments are explicitly disallowed**
4. **Props are merged deterministically**
5. **Refs are safely composed**
6. **Event handlers are composed, not overridden**
7. **Whitespace-only JSX formatting is ignored**

If any invariant is violated, `Slot` throws early with a clear error.

---

## Basic Usage

```tsx
<Slot className="btn-primary" onClick={handleClick}>
  <button className="btn">Save</button>
</Slot>
```

Resulting behavior:

* `className` → `"btn btn-primary"`
* `onClick` → child handler runs first, then slot handler
* No wrapper elements added
* Refs still point to the `<button>`

---

## Child Requirements

### Allowed

```tsx
<Slot>
  <button />
</Slot>
```

```tsx
<Slot>
  {"\n  "}
  <button />
  {"\n"}
</Slot>
```

Whitespace-only text nodes are ignored.

---

### Disallowed

#### No child

```tsx
<Slot />
```

#### Multiple children

```tsx
<Slot>
  <button />
  <button />
</Slot>
```

#### Non-element child

```tsx
<Slot>{"hello"}</Slot>
<Slot>{123}</Slot>
```

#### Fragment

```tsx
<Slot>
  <>
    <button />
  </>
</Slot>
```

Fragments are rejected because props and refs **cannot be safely attached**.

---

## Prop Merging Rules

### Default Behavior

* **Slot props win** over child props
* Child props are preserved unless explicitly overridden

```tsx
<Slot id="slot-id">
  <button id="child-id" />
</Slot>
```

Result:

```html
<button id="slot-id" />
```

---

### `className`

* Concatenated if both exist
* Order: **child first, slot second**

```tsx
<Slot className="slot">
  <button className="child" />
</Slot>
```

Result:

```ts
"child slot"
```

---

### `style`

* Shallow merge
* Slot values win on conflicts

```tsx
<Slot style={{ color: "red" }}>
  <button style={{ color: "blue", margin: 4 }} />
</Slot>
```

Result:

```ts
{
  color: "red",
  margin: 4
}
```

---

## Event Handler Composition

Supported events are **composed**, not overridden:

* `onClick`
* `onMouseDown / Up`
* `onPointerDown / Up`
* `onMouseEnter / Leave`
* `onFocus / Blur`
* `onKeyDown / Up`

### Execution Order

1. Child handler
2. Slot handler

```tsx
<Slot onClick={() => console.log("slot")}>
  <button onClick={() => console.log("child")} />
</Slot>
```

Output:

```txt
child
slot
```

If only one side provides a handler, it is used unchanged.

---

## Ref Behavior

Refs are **safely composed** using `@haitch-ui/react-compose-refs`.

Supported ref types:

* Object refs
* Callback refs
* Forwarded refs

All refs receive the **same underlying DOM element**.

```tsx
const ref = useRef<HTMLButtonElement>(null);

<Slot ref={ref}>
  <button />
</Slot>
```

---

## Intentional Constraints

These are deliberate design decisions:

| Constraint           | Reason                                 |
| -------------------- | -------------------------------------- |
| Single child only    | Prevents ambiguous prop application    |
| No fragments         | Fragments cannot receive refs or props |
| No implicit wrapping | Preserves DOM structure                |
| Early runtime errors | Fail fast, easier debugging            |

---

## Testing Philosophy

The test suite validates **behavioral guarantees**, not implementation details.

Covered cases include:

* Child validation rules
* Whitespace handling
* Prop precedence
* `className` and `style` merging
* Event handler composition
* Ref composition (object + callback)
* Pass-through of `data-*` and `aria-*` props

Tests use:

* **Vitest**
* **React Testing Library**
* **@testing-library/jest-dom**

---

## When to Use Slot

Use `Slot` when:

* Building headless or unstyled components
* Designing APIs that accept “any element”
* You need strict structural guarantees
* Predictable prop + ref behavior matters

Avoid `Slot` when:

* Multiple children are required
* Fragments are unavoidable
* You want implicit wrapping

---

## API Reference

### `<Slot />`

```ts
const Slot: React.ForwardRefExoticComponent<
  {
    children: React.ReactNode;
  } & Record<string, unknown> &
    React.RefAttributes<HTMLElement>
>;
```

### Props

#### `children` (required)

```ts
children: React.ReactNode;
```

* Must resolve to **exactly one non-whitespace React element**
* Whitespace-only text nodes are ignored
* The following are not allowed:

  * No children
  * Multiple non-whitespace children
  * Strings, numbers, or other primitives
  * `React.Fragment`

Violations throw a runtime error.

---

### Forwarded Props

All additional props are forwarded to the child:

```tsx
<Slot disabled aria-label="Save">
  <button />
</Slot>
```

Becomes:

```tsx
<button disabled aria-label="Save" />
```

#### Prop precedence

* Slot props override child props by default
* Exceptions: `className`, `style`, event handlers

---

### Event Handlers

If both child and slot define a handler:

```ts
(event) => {
  childHandler(event);
  slotHandler(event);
};
```

If only one exists, it is used unchanged.

---

### `ref`

```ts
ref?: React.Ref<HTMLElement>;
```

* `forwardRef` enabled
* Child and slot refs are composed
* All refs receive the same element instance

---

### Runtime Errors

| Condition         | Error                                            |
| ----------------- | ------------------------------------------------ |
| No valid child    | `Received 0 non-whitespace children`             |
| Multiple children | `Received N non-whitespace children`             |
| Non-element child | `expects a single valid React element child`     |
| Fragment child    | `must be a single element, not a React.Fragment` |

---

### TypeScript Notes

* `Slot` does **not** infer child prop types
* This is intentional for headless flexibility
* Consumers should rely on the child element’s typing

---

## Summary

`Slot` is intentionally strict.

That strictness makes it:

* Predictable
* Safe
* Design-system ready
* Easy to reason about

If it renders, it behaves exactly how you expect.

---
