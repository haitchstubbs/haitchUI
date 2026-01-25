# Dialog Primitive

A flexible, accessible dialog (modal) primitive for React, designed for building custom dialogs and modals in your UI.

## Features

- **Accessible**: Keyboard navigation and ARIA attributes for screen readers.
- **Composable**: Build custom dialogs with your own styles and structure.
- **Focus Management**: Automatically manages focus when opened/closed.
- **Portal Support**: Renders dialogs outside the DOM hierarchy for better stacking.

## Installation

```sh
npm install @haitchui/react
```

## Usage

```tsx
import { Dialog } from '@haitchui/react/primitives/dialog';

function Example() {
    const [open, setOpen] = React.useState(false);

    return (
        <>
            <button onClick={() => setOpen(true)}>Open Dialog</button>
            <Dialog open={open} onOpenChange={setOpen}>
                <Dialog.Overlay />
                <Dialog.Content>
                    <Dialog.Title>Dialog Title</Dialog.Title>
                    <Dialog.Description>
                        Dialog description goes here.
                    </Dialog.Description>
                    <button onClick={() => setOpen(false)}>Close</button>
                </Dialog.Content>
            </Dialog>
        </>
    );
}
```

## API Reference

### `<Dialog>`

| Prop           | Type      | Description                                 |
|----------------|-----------|---------------------------------------------|
| `open`         | boolean   | Controls the open state of the dialog.      |
| `onOpenChange` | function  | Callback when open state changes.           |
| `children`     | ReactNode | Dialog content and subcomponents.           |

### Subcomponents

- `Dialog.Overlay`: Renders a backdrop behind the dialog.
- `Dialog.Content`: The main dialog container.
- `Dialog.Title`: Title element for the dialog.
- `Dialog.Description`: Description for accessibility.

## Accessibility

- Focus is trapped within the dialog when open.
- Pressing `Escape` closes the dialog.
- Proper ARIA roles and attributes are applied.

## Customization

Style the dialog and its parts using your preferred CSS-in-JS solution or plain CSS.

## License

MIT
