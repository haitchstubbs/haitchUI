# Overlay Primitive

The `overlay` primitive provides a flexible and accessible way to render overlays, modals, and dialogs in React applications. It manages focus, stacking, and interaction logic to ensure overlays behave consistently and accessibly.

## Features

- **Accessible**: Handles focus trapping and ARIA attributes for accessibility.
- **Stacking**: Supports multiple overlays with proper stacking order.
- **Imperative API**: Programmatically open, close, or toggle overlays.
- **Customizable**: Easily style and compose overlays for various use cases.

## Installation

```bash
npm install @haitchui/react
```

## Usage

```tsx
import { Overlay, useOverlayService } from '@haitchui/react/overlay';

function App() {
    const { open, close } = useOverlayService();

    return (
        <>
            <button onClick={open}>Open Overlay</button>
            <Overlay>
                <div>
                    <h2>Overlay Content</h2>
                    <button onClick={close}>Close</button>
                </div>
            </Overlay>
        </>
    );
}
```

## API

### `<Overlay />`

Renders its children in a portal above the main content. Handles focus management and escape key to close.

**Props:**

| Prop         | Type      | Description                                 |
|--------------|-----------|---------------------------------------------|
| `isOpen`     | boolean   | Controls visibility of the overlay          |
| `onClose`    | function  | Callback when overlay requests to close     |
| `children`   | ReactNode | Content to render inside the overlay        |
| `...rest`    | any       | Additional props spread to the container    |

### Overlay Service

The overlay service provides imperative methods to control overlays.

#### `useOverlayService()`

Returns an object with methods:

- `open()`: Opens the overlay.
- `close()`: Closes the overlay.
- `toggle()`: Toggles the overlay state.

## Types

See [`types.ts`](./src/types.ts) for detailed type definitions.

## Implementation

- [`overlay.tsx`](./src/overlay.tsx): Overlay component logic.
- [`service.ts`](./src/service.ts): Overlay service and context.
- [`types.ts`](./src/types.ts): TypeScript types for overlays.

## License

MIT