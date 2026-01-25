# Rect Primitive

The `rect` primitive provides a React hook for measuring and tracking the bounding rectangle of a DOM element. This is useful for responsive layouts, animations, and any scenario where you need to know the size or position of an element.

## Files

- `index.ts` – Exports the main hook.
- `use-rect.ts` – Contains the implementation of the `useRect` hook.
- `README.md` – Documentation for the rect primitive.

## Installation

```sh
npm install @haitchui/react
```

## Usage

```tsx
import { useRect } from '@haitchui/react/rect';

function Example() {
    const [rect, ref] = useRect();

    return (
        <div ref={ref} style={{ resize: 'both', overflow: 'auto', border: '1px solid #ccc' }}>
            <pre>{JSON.stringify(rect, null, 2)}</pre>
            Resize me!
        </div>
    );
}
```

## API

### `useRect()`

A React hook that returns a tuple:

- `rect`: An object with the current bounding rectangle (`{ x, y, width, height, top, left, right, bottom }`), or `null` if not measured yet.
- `ref`: A React ref callback to attach to the element you want to measure.

#### Example return value

```json
{
    "x": 10,
    "y": 20,
    "width": 200,
    "height": 100,
    "top": 20,
    "left": 10,
    "right": 210,
    "bottom": 120
}
```

## Features

- Tracks changes to the element's size and position.
- Uses `ResizeObserver` and `MutationObserver` for efficient updates.
- Works with any HTML element.

## License

MIT
