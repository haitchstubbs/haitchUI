# Progress Primitive

A flexible and accessible progress bar component for React, designed for use in the `haitchUI` library.

## Features

- **Accessible**: Implements ARIA attributes for screen readers.
- **Customizable**: Supports custom styling and sizes.
- **Indeterminate & Determinate**: Handles both progress types.
- **Composable**: Easy to integrate and extend.

## Installation

```bash
npm install @haitchui/react
```

## Usage

```tsx
import { Progress } from '@haitchui/react/primitives/progress';

export default function Example() {
    return (
        <Progress value={60} max={100} />
    );
}
```

### Indeterminate Progress

```tsx
<Progress />
```

### Custom Styling

```tsx
<Progress className="my-custom-progress" value={40} />
```

## Props

| Prop         | Type                | Default   | Description                                      |
|--------------|---------------------|-----------|--------------------------------------------------|
| `value`      | `number`            | `undefined` | Current progress value (determinate if set)      |
| `max`        | `number`            | `100`     | Maximum value                                    |
| `className`  | `string`            | `''`      | Custom class names                               |
| `...rest`    | `React.HTMLProps`   |           | Other native props passed to the root element    |

## Accessibility

- Uses `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`.
- Indeterminate state omits `aria-valuenow`.

## File Structure

```
progress/
├── index.ts        # Exports the Progress component
├── progress.tsx    # Progress component implementation
└── README.md       # This documentation
```

## License

MIT © haitchstubbs