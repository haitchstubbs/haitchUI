# Collapsible Primitive

A flexible, accessible, and fully controllable collapsible component for React, designed for building expandable/collapsible UI sections such as accordions, disclosure widgets, and more.

## Features

- **Uncontrolled & Controlled Modes:** Manage open state internally or via props.
- **Accessible:** Keyboard navigation and ARIA attributes included.
- **Composable:** Split into `Root`, `Trigger`, and `Content` for flexible composition.
- **TypeScript:** Fully typed API.
- **Lightweight:** No external dependencies.

## Installation

```bash
npm install @haitchui/react
```

## Usage

```tsx
import { 
    CollapsibleRoot, 
    CollapsibleTrigger, 
    CollapsibleContent 
} from '@haitchui/react/collapsible';

function Example() {
    return (
        <CollapsibleRoot>
            <CollapsibleTrigger>Toggle</CollapsibleTrigger>
            <CollapsibleContent>
                <p>This content can be collapsed.</p>
            </CollapsibleContent>
        </CollapsibleRoot>
    );
}
```

## API Reference

### `<CollapsibleRoot />`

The root component that manages the open/closed state.

**Props:**

| Prop         | Type                      | Default   | Description                                 |
|--------------|---------------------------|-----------|---------------------------------------------|
| `open`       | `boolean`                 | —         | Controlled open state                       |
| `defaultOpen`| `boolean`                 | `false`   | Uncontrolled initial open state             |
| `onOpenChange`| `(open: boolean) => void`| —         | Callback when open state changes            |
| `disabled`   | `boolean`                 | `false`   | Disables interaction                        |
| `children`   | `ReactNode`               | —         | Collapsible children                        |

### `<CollapsibleTrigger />`

The button or element that toggles the collapsible state.

**Props:**

| Prop         | Type        | Description                    |
|--------------|-------------|--------------------------------|
| `asChild`    | `boolean`   | Render as child element        |
| `children`   | `ReactNode` | Trigger content                |

### `<CollapsibleContent />`

The collapsible content area.

**Props:**

| Prop         | Type        | Description                    |
|--------------|-------------|--------------------------------|
| `asChild`    | `boolean`   | Render as child element        |
| `children`   | `ReactNode` | Content to show/hide           |

## Hooks

### `useControllableState`

A utility hook for managing controlled/uncontrolled state.

```ts
const [state, setState] = useControllableState({
    value,         // controlled value
    defaultValue,  // initial value if uncontrolled
    onChange,      // callback on change
});
```

## Accessibility

- Uses proper ARIA attributes for disclosure widgets.
- Keyboard accessible by default.

## File Structure

```
collapsible/
    index.ts
    README.md
    content/
        component.tsx
        index.ts
    context/
        context.ts
        index.ts
    hooks/
        index.ts
        useControllableState.ts
    root/
        component.tsx
        index.tsx
    trigger/
        component.tsx
        index.ts
    types/
        index.ts
```

## License

MIT