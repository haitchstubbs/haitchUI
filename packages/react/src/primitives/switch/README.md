# Switch Primitive

A flexible, accessible, and customizable Switch component for React, designed for use in the `haitchUI` design system.

## Features

- **Accessible**: Keyboard and screen reader friendly.
- **Customizable**: Style using your own CSS or utility classes.
- **Controlled & Uncontrolled**: Supports both controlled and uncontrolled usage.
- **TypeScript**: Fully typed for safety and autocompletion.

## Installation

```bash
npm install @haitchui/react
# or
yarn add @haitchui/react
```

## Usage

```tsx
import { Switch } from '@haitchui/react/switch';

function Example() {
    const [checked, setChecked] = React.useState(false);

    return (
        <Switch
            checked={checked}
            onCheckedChange={setChecked}
            aria-label="Enable notifications"
        />
    );
}
```

## Props

| Prop             | Type                             | Default   | Description                                      |
|------------------|----------------------------------|-----------|--------------------------------------------------|
| `checked`        | `boolean`                        | —         | Controlled checked state.                        |
| `defaultChecked` | `boolean`                        | `false`   | Uncontrolled initial checked state.              |
| `onCheckedChange`| `(checked: boolean) => void`     | —         | Callback when checked state changes.             |
| `disabled`       | `boolean`                        | `false`   | Disables the switch.                             |
| `className`      | `string`                         | —         | Custom class names for styling.                  |
| `...props`       | `React.ComponentProps<'button'>` | —         | Other button props are spread to the root.       |

## Accessibility

- Uses a native `<button>` element with `role="switch"`.
- Supports keyboard navigation (Space/Enter toggles).
- Properly sets `aria-checked` and `aria-disabled`.

## Styling

Style the Switch using your preferred method (CSS, Tailwind, etc.) by passing a `className` prop.

```tsx
<Switch className="bg-gray-200 data-[state=checked]:bg-blue-500 rounded-full w-12 h-6" />
```

## Example

```tsx
<Switch
    defaultChecked
    onCheckedChange={checked => console.log(checked)}
    aria-label="Dark mode"
    className="switch"
/>
```

## License

MIT © haitchstubbs
