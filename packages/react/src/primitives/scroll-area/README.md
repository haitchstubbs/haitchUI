# ScrollArea

A flexible, accessible, and customizable scroll area primitive for React, designed for use in the `haitchUI` component library.

## Features

- **Custom Scrollbars:** Easily style and control the appearance of scrollbars.
- **Keyboard Accessible:** Fully navigable via keyboard.
- **RTL Support:** Handles both LTR and RTL layouts.
- **Composable:** Works well with other primitives and layout components.
- **Performance:** Virtualizes scroll events for smooth performance.

## Installation

```bash
npm install @haitchui/react
```

## Usage

```tsx
import { ScrollArea } from '@haitchui/react/scroll-area';

function Example() {
    return (
        <ScrollArea style={{ height: 300, width: 400 }}>
            <div style={{ height: 1000, width: 800 }}>
                {/* Your scrollable content here */}
            </div>
        </ScrollArea>
    );
}
```

## API

### `<ScrollArea>`

| Prop         | Type        | Default | Description                              |
|--------------|-------------|---------|------------------------------------------|
| `children`   | `ReactNode` | —       | Content to be made scrollable.           |
| `style`      | `object`    | —       | Inline styles for the scroll area.       |
| `className`  | `string`    | —       | Custom class name for styling.           |
| `...rest`    | `any`       | —       | Other props are spread to the container. |

### Customization

You can style the scrollbars using CSS or pass custom class names.

```css
/* Example: Custom scrollbar styling */
.my-scroll-area::-webkit-scrollbar {
    width: 8px;
    background: #eee;
}
.my-scroll-area::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
}
```

## Accessibility

- Follows [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/).
- Keyboard navigation is supported out of the box.

## License

MIT © haitchstubbs
