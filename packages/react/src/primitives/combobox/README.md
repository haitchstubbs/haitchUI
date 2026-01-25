# Combobox Primitive

A fully accessible, customizable Combobox primitive for React, designed for building autocomplete, select, and multi-select experiences. Part of the `haitchUI` component library.

---

## Features

- **Accessible**: Keyboard navigation, ARIA attributes, and screen reader support.
- **Composable**: Build custom comboboxes using modular components.
- **Controlled/Uncontrolled**: Supports both controlled and uncontrolled usage.
- **Multi-select**: Optional chips for multi-value selection.
- **Custom Filtering**: Plug in your own filtering logic.
- **Portals & Positioning**: Popup rendered in a portal with smart positioning.
- **Theming**: Style with your design system.

---

## Installation

```bash
npm install @haitchui/react
```

---

## Anatomy

See [ANATOMY.md](./ANATOMY.md) for a breakdown of all available components and their relationships.

---

## Usage

### Basic Example

```tsx
import {
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxInput,
  ComboboxList,
  ComboboxItem,
  ComboboxValue,
} from '@haitchui/react/combobox';

function Example() {
  const items = ['Apple', 'Banana', 'Orange'];
  return (
    <ComboboxRoot>
      <ComboboxTrigger>
        <ComboboxInput placeholder="Select a fruit..." />
      </ComboboxTrigger>
      <ComboboxList>
        {items.map(item => (
          <ComboboxItem key={item} value={item}>
            {item}
          </ComboboxItem>
        ))}
      </ComboboxList>
      <ComboboxValue />
    </ComboboxRoot>
  );
}
```

---

## Component API

See [API_REFERENCE.md](./API_REFERENCE.md) for detailed props and events.

---

## Component List

- `ComboboxRoot`
- `ComboboxTrigger`
- `ComboboxInput`
- `ComboboxList`
- `ComboboxItem`
- `ComboboxValue`
- `ComboboxChip`, `ComboboxChips`, `ComboboxChipRemove`
- `ComboboxClear`
- `ComboboxArrow`
- `ComboboxBackdrop`
- `ComboboxPopup`
- `ComboboxPortal`
- `ComboboxPositioner`
- `ComboboxSeparator`
- `ComboboxStatus`
- `ComboboxGroup`, `ComboboxGroupLabel`
- `ComboboxEmpty`
- `ComboboxItemIndicator`
- `ComboboxRow`
- ...and more

---

## Customization

- **Filtering**: Use the `useFilter` hook or provide your own.
- **Controlled State**: Use `value` and `onValueChange` props.
- **Multi-select**: Use chips components for multiple values.
- **Styling**: All components accept `className` and style props.

---

## Accessibility

- Full keyboard support (arrow keys, enter, escape, etc.)
- Proper ARIA roles and attributes.
- Screen reader announcements for status and selection.

---

## License

MIT

---

For more details, see the source code and the [API reference](./API_REFERENCE.md).