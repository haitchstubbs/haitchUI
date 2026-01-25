# Radio Group Primitive

A flexible and accessible radio group component for React, designed for use in the `haitchUI` design system.

## Features

- **Accessible**: Implements proper ARIA roles and keyboard navigation.
- **Controlled & Uncontrolled**: Supports both controlled and uncontrolled usage.
- **Customizable**: Easily style and extend with your own components.
- **TypeScript**: Fully typed for safety and autocompletion.

## Installation

```bash
npm install @haitchui/react
```

## Usage

```tsx
import { RadioGroup, RadioGroupItem } from '@haitchui/react/radio-group';

function Example() {
    const [value, setValue] = React.useState('option1');

    return (
        <RadioGroup value={value} onValueChange={setValue}>
            <RadioGroupItem value="option1" label="Option 1" />
            <RadioGroupItem value="option2" label="Option 2" />
            <RadioGroupItem value="option3" label="Option 3" />
        </RadioGroup>
    );
}
```

## API Reference

### `<RadioGroup>`

| Prop           | Type                       | Description                                 |
| -------------- | -------------------------- | ------------------------------------------- |
| `value`        | `string`                   | The selected value (controlled).            |
| `defaultValue` | `string`                   | The initial value (uncontrolled).           |
| `onValueChange`| `(value: string) => void`  | Callback when the value changes.            |
| `children`     | `React.ReactNode`          | Radio group items.                          |
| `name`         | `string`                   | Name for the radio inputs (optional).       |
| `disabled`     | `boolean`                  | Disables all radio items (optional).        |
| ...rest        | `HTMLAttributes`           | Other props spread to the root element.     |

### `<RadioGroupItem>`

| Prop      | Type              | Description                       |
| --------- | ----------------- | --------------------------------- |
| `value`   | `string`          | The value for this radio item.    |
| `label`   | `string`          | The label for the radio item.     |
| `disabled`| `boolean`         | Disables this radio item.         |
| ...rest   | `HTMLAttributes`  | Other props for the input.        |

## Accessibility

- Uses `role="radiogroup"` and `role="radio"` for proper semantics.
- Supports keyboard navigation (arrow keys, tab, space/enter).
- Can be used with screen readers.

## Customization

You can style the radio group and items using your preferred CSS-in-JS solution or plain CSS. The components expose className and style props for easy customization.

## License

MIT
