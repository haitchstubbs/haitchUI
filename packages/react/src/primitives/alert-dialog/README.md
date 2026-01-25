# Alert Dialog Primitive

A composable, accessible Alert Dialog primitive for React, designed for critical user interactions that require explicit confirmation (e.g., destructive actions). This package provides modular components and hooks to build custom alert dialogs with full keyboard and screen reader support.

## Features

- **Composable API:** Compose dialogs from modular subcomponents.
- **Accessibility:** Focus management, ARIA roles, and keyboard navigation.
- **TypeScript support:** Fully typed components and hooks.
- **Tested:** Includes unit tests for all primitives.

## Installation

```bash
npm install @haitchui/react
```

## Usage

```tsx
import {
  AlertDialogRoot,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@haitchui/react/primitives/alert-dialog';

function Example() {
  return (
    <AlertDialogRoot>
      <AlertDialogTrigger>Delete Account</AlertDialogTrigger>
      <AlertDialogPortal>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialogRoot>
  );
}
```

## API Reference

- **AlertDialogRoot:** Provides context and state for the dialog.
- **AlertDialogTrigger:** Element that opens the dialog.
- **AlertDialogPortal:** Renders dialog outside the DOM hierarchy.
- **AlertDialogOverlay:** Dimmed background overlay.
- **AlertDialogContent:** Main dialog container.
- **AlertDialogHeader:** Header section (optional).
- **AlertDialogTitle:** Dialog title (required for accessibility).
- **AlertDialogDescription:** Additional description (optional).
- **AlertDialogFooter:** Footer for actions.
- **AlertDialogCancel:** Button to dismiss dialog.
- **AlertDialogAction:** Button to confirm action.

## Accessibility

- Focus is trapped within the dialog while open.
- The first focusable element is focused on open.
- Dialog is announced by screen readers via ARIA attributes.
- Keyboard navigation is fully supported.

## Customization

All components accept standard React props and can be styled or extended as needed.

## License

MIT