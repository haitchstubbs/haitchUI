# @haitch-ui/react-accordion

Scaffolded primitive package.

## Install
```sh
pnpm add @haitch-ui/react-accordion
```

## Overview
Accordion primitives compose a disclosure UI where each item can be expanded or collapsed.
State is managed by `Root` and shared via context to `Item`, `Header`, `Trigger`, and `Content`.

## Usage
```tsx
import { Root, Item, Header, Trigger, Content } from "@haitch-ui/react-accordion";

export function AccountAccordion() {
	return (
		<Root type="single" collapsible>
			<Item value="account">
				<Header>
					<Trigger>Account</Trigger>
				</Header>
				<Content>Account details</Content>
			</Item>
		</Root>
	);
}
```

## Anatomy
- `Root`: owns state, orientation, direction, and disabled flags.
- `Item`: binds a `value` to an accordion row and exposes state to descendants.
- `Header`: semantic header wrapper that mirrors item state.
- `Trigger`: interactive control that toggles the item and sets ARIA state.
- `Content`: disclosure panel that mounts/unmounts or stays mounted via `forceMount`.

## Behavior
- Single vs multiple: `type="single"` allows one open item; `type="multiple"` allows many.
- Collapsible: only applies to single accordions. When `false`, open items cannot be closed.
- Controlled/uncontrolled: use `value` + `onValueChange` for controlled state, or `defaultValue` for uncontrolled.
- Disabled: `Root` disables all items; `Item` can disable itself.
- Layout: `orientation` and `dir` are surfaced via data attributes for styling.

## Accessibility
- `Trigger` sets `aria-controls` and `aria-expanded`.
- `Content` uses `role="region"` and `aria-labelledby`.
- `data-state` and `data-disabled` mirror open/disabled state for styling.

## Testing strategy
- Use Vitest + React Testing Library + user-event.
- Root coverage: single/multiple behavior, collapsible rules, controlled updates, and data attributes.
- Item/Header/Trigger/Content coverage: open/closed state, disabled behavior, `asChild` slotting, and ARIA wiring.
- Content coverage: mount vs unmount, `forceMount`, and sizing CSS variables.
- Context coverage: hooks throw outside providers and expose expected IDs/state inside.

## Coverage reflection
Current tests validate component behavior and integration points. FloatingTree event
emission is not asserted directly because it is owned by `@floating-ui/react`; add an
integration test if cross-root event handling becomes a public contract.
