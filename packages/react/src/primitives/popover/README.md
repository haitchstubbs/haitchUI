# Popover Primitive

A flexible and accessible Popover component for React, designed for use in the `haitchUI` library. This primitive provides a composable API for building popover menus, tooltips, and other floating UI elements.

## Features

- **Composable API:** Build custom popover experiences using hooks and context.
- **Accessibility:** Keyboard navigation and ARIA attributes included.
- **Focus Management:** Handles focus trapping and restoration.
- **Positioning:** Smart positioning logic to keep the popover in view.
- **TypeScript Support:** Fully typed API for safety and autocompletion.

## Installation

```bash
npm install @haitchui/react
```

## Usage

```tsx
import { Popover, usePopover } from '@haitchui/react/popover';

function Example() {
    const { isOpen, open, close, toggle, triggerProps, popoverProps } = usePopover();

    return (
        <div>
            <button {...triggerProps}>Open Popover</button>
            {isOpen && (
                <Popover {...popoverProps}>
                    <div>Popover Content</div>
                    <button onClick={close}>Close</button>
                </Popover>
            )}
        </div>
    );
}
```

## API Reference

### `usePopover()`

A custom hook that manages popover state and accessibility.

#### Returns

- `isOpen`: `boolean` — Whether the popover is open.
- `open()`: `() => void` — Opens the popover.
- `close()`: `() => void` — Closes the popover.
- `toggle()`: `() => void` — Toggles the popover.
- `triggerProps`: `object` — Props to spread on the trigger element.
- `popoverProps`: `object` — Props to spread on the popover element.

### `<Popover />`

A component that renders the popover content. Handles focus management and positioning.

#### Props

- `children`: `ReactNode` — Content of the popover.
- `...rest`: Other props are spread to the root element.

## Advanced Usage

You can access lower-level utilities and context for custom implementations:

- `PopoverContext` — React context for popover state.
- `usePopoverContext()` — Hook to access the context.
- `usePopoverPosition()` — Utility for custom positioning logic.

## File Structure

```
popover/
├── index.ts           # Entry point
├── README.md          # This file
└── src/
        ├── context.ts     # Popover context and provider
        ├── hooks.ts       # usePopover and related hooks
        ├── index.ts       # Internal exports
        ├── popover.tsx    # Popover component implementation
        ├── types.ts       # TypeScript types
        └── util.ts        # Utility functions (e.g., positioning)
```

## Accessibility

- Focus is trapped within the popover when open.
- ARIA attributes are automatically managed.
- Keyboard navigation is supported.

## License

MIT
