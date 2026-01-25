# Menubar Primitive

A flexible, accessible menubar component for React, designed for building custom navigation and menu interfaces.

## Features

- **Accessible**: Keyboard navigation and ARIA roles for screen readers.
- **Composable**: Build custom menubars, menus, and menu items.
- **Unstyled**: Bring your own styles or use with your design system.
- **TypeScript**: Fully typed API for safety and autocompletion.

## Installation

```bash
npm install @haitchui/react
```

## Usage

```tsx
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } from '@haitchui/react/menubar';

function Example() {
    return (
        <Menubar>
            <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem>New File</MenubarItem>
                    <MenubarItem>Open...</MenubarItem>
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem>Undo</MenubarItem>
                    <MenubarItem>Redo</MenubarItem>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    );
}
```

## API Reference

### `<Menubar>`

Root menubar container. Handles keyboard navigation and ARIA roles.

### `<MenubarMenu>`

Wraps a trigger and its associated menu content.

### `<MenubarTrigger>`

Button that opens the menu.

### `<MenubarContent>`

Container for menu items.

### `<MenubarItem>`

A selectable menu item.

## Accessibility

- Uses proper ARIA roles (`menubar`, `menu`, `menuitem`).
- Supports keyboard navigation: arrow keys, Enter, Space, Escape.

## Customization

- No styles are applied by default.
- Add your own classes or style props as needed.

## License

MIT