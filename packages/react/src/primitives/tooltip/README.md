# Tooltip Primitive

A flexible and accessible Tooltip primitive for React, designed for use in the `haitchUI` component library.

```txt
tooltip/
├── index.ts
├── README.md
├── src/
│   ├── tooltip.tsx
│   ├── lib/
│   │   ├── defaults.ts
│   │   ├── index.ts
│   │   ├── interactions.ts
│   │   ├── middleware.ts
│   │   ├── types.ts
│   │   ├── useControllableOpen.ts
│   │   ├── useRuntimeOptions.ts
│   │   └── useTooltip.ts
│   └── portal/
│       ├── component.tsx
│       └── index.ts
```

## Features

- **Accessible**: Keyboard and screen reader friendly.
- **Customizable**: Easily configure appearance, behavior, and positioning.
- **Composable**: Built with hooks and components for maximum flexibility.
- **Portaled**: Tooltip content is rendered in a React portal for correct stacking.

## Installation

```bash
npm install @haitchui/react
```

## Usage

```tsx
import { Tooltip } from "@haitchui/react/tooltip";

function Example() {
 return (
  <Tooltip content="This is a tooltip">
   <button>Hover me</button>
  </Tooltip>
 );
}
```

## API Reference

### `<Tooltip>`

| Prop           | Type                                     | Default | Description                                       |
| -------------- | ---------------------------------------- | ------- | ------------------------------------------------- |
| `content`      | `ReactNode`                              | —       | Tooltip content to display.                       |
| `open`         | `boolean`                                | —       | Control tooltip visibility (controlled).          |
| `defaultOpen`  | `boolean`                                | `false` | Initial open state (uncontrolled).                |
| `onOpenChange` | `(open: boolean) => void`                | —       | Callback when open state changes.                 |
| `placement`    | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Tooltip position.                                 |
| ...            |                                          |         | See [types.ts](./src/lib/types.ts) for full list. |

### Hooks

- `useTooltip`: Core hook for tooltip state and positioning.
- `useControllableOpen`: Manage controlled/uncontrolled open state.
- `useRuntimeOptions`: Merge runtime options with defaults.

## File Structure

```txt
tooltip/
├── index.ts
├── README.md
├── src/
│   ├── tooltip.tsx
│   ├── lib/
│   │   ├── defaults.ts
│   │   ├── index.ts
│   │   ├── interactions.ts
│   │   ├── middleware.ts
│   │   ├── types.ts
│   │   ├── useControllableOpen.ts
│   │   ├── useRuntimeOptions.ts
│   │   └── useTooltip.ts
│   └── portal/
│       ├── component.tsx
│       └── index.ts
```

- **tooltip.tsx**: Main Tooltip component.
- **lib/**: Internal logic, types, and hooks.
- **portal/**: Portal implementation for rendering tooltips outside the DOM hierarchy.

## Customization

You can customize tooltip behavior and appearance via props or by extending the component. For advanced use, use the provided hooks directly.

## Accessibility

- Follows [WAI-ARIA Tooltip Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/).
- Keyboard accessible and screen reader friendly.

## License

MIT
