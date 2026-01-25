# `@haitch-ui/react/label`

A flexible, accessible Label primitive for React, designed for seamless integration with form controls.

---

## Features

- **Accessible**: Properly associates labels with form elements for screen readers.
- **Composable**: Works with custom and native form controls.
- **Typed**: Fully typed with TypeScript.
- **Lightweight**: Minimal dependencies.

---

## Installation

```bash
npm install @haitch-ui/react
# or
yarn add @haitch-ui/react
```

---

## Usage

```tsx
import { Label } from '@haitch-ui/react/label';

function Example() {
    return (
        <div>
            <Label htmlFor="username">Username</Label>
            <input id="username" type="text" />
        </div>
    );
}
```

---

## API

### `<Label>`

| Prop      | Type                | Description                                 |
|-----------|---------------------|---------------------------------------------|
| `htmlFor` | `string`            | The id of the element this label is for.    |
| `asChild` | `boolean` (optional)| Render as a child component (advanced).     |
| `children`| `React.ReactNode`   | The label content.                          |
| ...props  | `React.LabelHTMLAttributes<HTMLLabelElement>` | All standard label props. |

---

## Types

Type definitions are available in [`src/types/index.tsx`](./src/types/index.tsx).

---

## Accessibility

- Uses the native `<label>` element.
- Supports `htmlFor` for associating with form controls.
- Can be composed with custom components using `asChild`.

---

## Contributing

See the [main repository README](https://github.com/haitchstubbs/haitchUI) for contribution guidelines.

---

## License

MIT © haitchstubbs