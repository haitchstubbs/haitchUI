# Hover Card

A flexible and accessible React primitive for displaying floating content when users hover over a target element.

## Features

- **Accessible**: Keyboard and screen reader friendly.
- **Customizable**: Easily style and configure appearance and behavior.
- **Composable**: Designed to work seamlessly with other primitives.

## Installation

```bash
npm install @haitchui/react
```

## Usage

```tsx
import { HoverCard } from '@haitchui/react/hover-card';

function Example() {
    return (
        <HoverCard>
            <HoverCard.Trigger>
                <button>Hover me</button>
            </HoverCard.Trigger>
            <HoverCard.Content>
                <div>
                    <strong>Hover Card Content</strong>
                    <p>This content appears on hover.</p>
                </div>
            </HoverCard.Content>
        </HoverCard>
    );
}
```

## API Reference

### `<HoverCard>`

The root component that manages state and context.

#### Props

| Prop         | Type    | Default | Description                        |
|--------------|---------|---------|------------------------------------|
| `openDelay`  | number  | 700     | Delay (ms) before opening content. |
| `closeDelay` | number  | 300     | Delay (ms) before closing content. |

### `<HoverCard.Trigger>`

The element that users interact with to trigger the hover card.

### `<HoverCard.Content>`

The floating content displayed on hover.

#### Props

| Prop      | Type   | Default | Description                |
|-----------|--------|---------|----------------------------|
| `side`    | string | 'top'   | Side to display the card.  |
| `align`   | string | 'center'| Alignment of the content.  |

## Accessibility

- Fully keyboard navigable.
- ARIA attributes are applied automatically.

## Customization

Style the hover card using your preferred CSS-in-JS solution or plain CSS.

## License

MIT