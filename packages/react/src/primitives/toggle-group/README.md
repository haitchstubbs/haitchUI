# Toggle Group

A flexible and accessible toggle group primitive for React, designed for use in the `haitchUI` component library.

## Features

- Supports single or multiple selection modes
- Keyboard accessible
- Customizable styling
- Composable API

## Installation

```bash
npm install @haitchui/react
```

## Usage

```tsx
import { ToggleGroup } from '@haitchui/react/toggle-group';

function Example() {
    return (
        <ToggleGroup type="single" defaultValue="bold" aria-label="Text formatting">
            <ToggleGroup.Item value="bold">Bold</ToggleGroup.Item>
            <ToggleGroup.Item value="italic">Italic</ToggleGroup.Item>
            <ToggleGroup.Item value="underline">Underline</ToggleGroup.Item>
        </ToggleGroup>
    );
}
```

## API

### `<ToggleGroup>`

| Prop            | Type                      | Description                    |
| --------------- | ------------------------- | ------------------------------ |
| `type`          | `"single" \| "multiple"`  | Selection mode                 |
| `value`         | `string \| string[]`      | Controlled value(s)            |
| `defaultValue`  | `string \| string[]`      | Uncontrolled default value(s)  |
| `onValueChange` | `(value) => void`         | Callback when value changes    |
| `aria-label`    | `string`                  | Accessibility label            |

### `<ToggleGroup.Item>`

| Prop    | Type     | Description           |
| ------- | -------- | --------------------- |
| `value` | `string` | Value for the item    |

## Accessibility

- Fully keyboard navigable
- Proper ARIA roles and attributes

## License

MIT
