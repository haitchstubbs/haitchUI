# Slider Primitive

A flexible, accessible, and customizable slider component for React, designed for use in the `haitchUI` design system.

## Features

- **Accessible**: Keyboard and screen reader support.
- **Customizable**: Style and configure to fit your needs.
- **Controlled & Uncontrolled**: Supports both controlled and uncontrolled usage.
- **Horizontal & Vertical**: Orientation support.
- **Step, Min, Max**: Full range and step configuration.

## Installation

```bash
npm install @haitchui/react
```

## Usage

```tsx
import { Slider } from '@haitchui/react/slider';

function Example() {
    const [value, setValue] = React.useState(50);

    return (
        <Slider
            value={value}
            onChange={setValue}
            min={0}
            max={100}
            step={1}
            orientation="horizontal"
            aria-label="Volume"
        />
    );
}
```

## Props

| Prop           | Type                        | Default        | Description                                 |
|----------------|-----------------------------|----------------|---------------------------------------------|
| `value`        | `number`                    | —              | Controlled value of the slider              |
| `defaultValue` | `number`                    | —              | Uncontrolled initial value                  |
| `onChange`     | `(value: number) => void`   | —              | Callback when value changes                 |
| `min`          | `number`                    | `0`            | Minimum value                               |
| `max`          | `number`                    | `100`          | Maximum value                               |
| `step`         | `number`                    | `1`            | Step increment                              |
| `orientation`  | `'horizontal' \| 'vertical'`| `'horizontal'` | Slider orientation                          |
| `aria-label`   | `string`                    | —              | Accessibility label                         |
| ...rest        | `HTMLAttributes`            |                | Other props passed to the root element      |

## Accessibility

- Fully keyboard accessible (arrow keys, Home/End, PageUp/PageDown).
- Proper ARIA roles and attributes.
- Labeling via `aria-label` or associated `<label>`.

## Customization

Style the slider using your preferred CSS-in-JS solution or by targeting the component's class names.

## License

MIT

---

_See [`slider.tsx`](./slider.tsx) and [`index.ts`](./index.ts) for implementation details.
