# Toggle Primitive

A simple, accessible toggle (switch) component for React, designed for use in the `haitchUI` component library.

## Features

- **Accessible**: Keyboard and screen reader friendly.
- **Customizable**: Easily style and extend.
- **Controlled/Uncontrolled**: Supports both usage patterns.
- **Lightweight**: Minimal dependencies.

## Installation

```bash
npm install @haitchui/react
```

## Usage

```tsx
import { Toggle } from '@haitchui/react/toggle';

function Example() {
    const [checked, setChecked] = React.useState(false);

    return (
        <Toggle
            checked={checked}
            onCheckedChange={setChecked}
            aria-label="Enable notifications"
        />
    );
}
```

## Props

| Prop             | Type                          | Description                                 |
|------------------|-------------------------------|---------------------------------------------|
| `checked`        | `boolean`                     | Controlled checked state.                   |
| `defaultChecked` | `boolean`                     | Uncontrolled initial checked state.         |
| `onCheckedChange`| `(checked: boolean) => void`  | Callback when checked state changes.        |
| `disabled`       | `boolean`                     | Disables the toggle.                        |
| `aria-label`     | `string`                      | Accessibility label.                        |
| ...rest          | `React.HTMLAttributes`        | Other props spread to the root element.     |

## Accessibility

- Uses `role="switch"` and proper ARIA attributes.
- Fully keyboard navigable.

## File Structure

```txt
toggle/
├── index.ts         # Entry point for the toggle primitive
├── README.md        # This documentation
└── src/
        └── toggle.tsx   # Toggle component implementation
```

## License

MIT
