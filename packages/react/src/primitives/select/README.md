# Select Primitive

A flexible and accessible Select component for React, designed as part of the `haitchUI` library.

## Features

- **Accessible**: Keyboard and screen reader friendly.
- **Customizable**: Style and extend as needed.
- **Controlled & Uncontrolled**: Supports both usage patterns.
- **TypeScript**: Fully typed for safety and autocompletion.

## Installation

```bash
npm install @haitchui/react
```

## Usage

```tsx
import { Select } from '@haitchui/react/select';

function Example() {
    return (
        <Select>
            <Select.Trigger>Choose an option</Select.Trigger>
            <Select.Content>
                <Select.Item value="apple">Apple</Select.Item>
                <Select.Item value="banana">Banana</Select.Item>
                <Select.Item value="orange">Orange</Select.Item>
            </Select.Content>
        </Select>
    );
}
```

## API

### `<Select>`

The root component. Accepts standard props for controlling value and open state.

#### Props

| Prop            | Type                         | Description                                 |
|-----------------|------------------------------|---------------------------------------------|
| `value`         | `string`                     | Selected value (controlled)                 |
| `defaultValue`  | `string`                     | Initial value (uncontrolled)                |
| `onValueChange` | `(value: string) => void`    | Callback when value changes                 |
| `open`          | `boolean`                    | Open state (controlled)                     |
| `defaultOpen`   | `boolean`                    | Initial open state (uncontrolled)           |
| `onOpenChange`  | `(open: boolean) => void`    | Callback when open state changes            |

### Subcomponents

- **`<Select.Trigger>`**: Button to open the select menu.
- **`<Select.Content>`**: The dropdown list container.
- **`<Select.Item>`**: An option in the dropdown.

## Accessibility

- Fully keyboard navigable.
- Proper ARIA roles and attributes.
- Focus management for usability.

## Customization

Style using your preferred CSS-in-JS solution or plain CSS. All components accept `className` and `style` props.

## License

MIT

---

For more details, see the source code in [`select.tsx`](./select.tsx).
