# Aspect Ratio Primitive

A flexible React primitive for maintaining a consistent aspect ratio for its children. Useful for images, videos, or any content that should scale responsively while preserving its proportions.

## Features

- Maintains a fixed aspect ratio for any content
- Responsive and works with any child elements
- Composable and customizable
- Written in TypeScript

## Installation

```bash
npm install @haitchui/react
```

## Usage

```tsx
import { AspectRatio } from '@haitchui/react/primitives/aspect-ratio';

<AspectRatio ratio={16 / 9}>
    <img src="example.jpg" alt="Example" style={{ width: '100%', height: '100%' }} />
</AspectRatio>
```

## API

### `<AspectRatio>`

#### Props

| Prop   | Type    | Default | Description                                 |
|--------|---------|---------|---------------------------------------------|
| ratio  | number  | 1       | The aspect ratio (width / height) to enforce. |
| ...    | any     |         | Additional props are spread to the root element. |

## Advanced Usage

You can use any content inside the `AspectRatio` component, including videos, iframes, or custom layouts.

```tsx
<AspectRatio ratio={4 / 3}>
    <iframe src="https://example.com" title="Example" />
</AspectRatio>
```

## Types

Type definitions are available in the `types` directory for advanced usage and type safety.

## Testing

Unit tests are provided in `aspect-ratio-root.test.tsx` to ensure reliability.

## License

MIT