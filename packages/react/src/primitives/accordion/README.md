# @haitch-ui/react/accordion

Scaffolded primitive package.

## Import

```tsx
import { AccordionRoot, AccordionItem, AccordionHeader, AccordionTrigger, AccordionContent } from "@haitch-ui/react-accordion";
```

## Overview

Accordion primitives compose a disclosure UI where each AccordionItem can be expanded or collapsed.
State is managed by `AccordionRoot` and shared via context to `AccordionItem`, `AccordionHeader`, `AccordionTrigger`, and `AccordionContent`.

## Usage

```tsx
export function AccountAccordion() {
 return (
  <AccordionRoot type="single" collapsible>
   <AccordionItem value="account">
    <AccordionHeader>
     <AccordionTrigger>Account</AccordionTrigger>
    </AccordionHeader>
    <AccordionContent>Account details</AccordionContent>
   </AccordionItem>
  </AccordionRoot>
 );
}
```

## Anatomy

- `AccordionRoot`: owns state, orientation, direction, and disabled flags.
- `AccordionItem`: binds a `value` to an accordion row and exposes state to descendants.
- `AccordionHeader`: semantic header wrapper that mirrors AccordionItem state.
- `AccordionTrigger`: interactive control that toggles the AccordionItem and sets ARIA state.
- `AccordionContent`: disclosure panel that mounts/unmounts or stays mounted via `forceMount`.

## Behavior

- Single vs multiple: `type="single"` allows one open AccordionItem; `type="multiple"` allows many.
- Collapsible: only applies to single accordions. When `false`, open AccordionItems cannot be closed.
- Controlled/uncontrolled: use `value` + `onValueChange` for controlled state, or `defaultValue` for uncontrolled.
- Disabled: `AccordionRoot` disables all AccordionItems; `AccordionItem` can disable itself.
- Layout: `orientation` and `dir` are surfaced via data attributes for styling.

## Accessibility

- `AccordionTrigger` sets `aria-controls` and `aria-expanded`.
- `AccordionContent` uses `role="region"` and `aria-labelledby`.
- `data-state` and `data-disabled` mirror open/disabled state for styling.

## Testing strategy

- Use Vitest + React Testing Library + user-event.
- AccordionRoot coverage: single/multiple behavior, collapsible rules, controlled updates, and data attributes.
- AccordionItem/AccordionHeader/AccordionTrigger/AccordionContent coverage: open/closed state, disabled behavior, `asChild` slotting, and ARIA wiring.
- AccordionContent coverage: mount vs unmount, `forceMount`, and sizing CSS variables.
- Context coverage: hooks throw outside providers and expose expected IDs/state inside.

## Coverage reflection

Current tests validate component behavior and integration points. FloatingTree event
emission is not asserted directly because it is owned by `@floating-ui/react`; add an
integration test if cross-AccordionRoot event handling becomes a public contract.
