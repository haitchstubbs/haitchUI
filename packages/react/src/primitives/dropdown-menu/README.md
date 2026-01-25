# Dropdown Menu Primitive

A flexible, accessible, and composable dropdown menu primitive for React, designed for building custom dropdown experiences.

## Features

- **Composable API**: Compose menus from primitives like `Root`, `Trigger`, `Content`, `Item`, `Checkbox`, `Radio`, `Group`, `Label`, `Separator`, `Shortcut`, and `SubMenu`.
- **Accessibility**: Keyboard navigation, ARIA attributes, and focus management.
- **Controlled & Uncontrolled**: Support for both controlled and uncontrolled open state.
- **Portals**: Render menu content in a React portal.
- **Customizable**: Style and extend components as needed.

## Installation

```bash
npm install @haitchui/react
```

## Usage

```tsx
import {
    DropdownMenuRoot,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuCheckbox,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuLabel,
    DropdownMenuShortcut,
    DropdownMenuSubMenu,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from '@haitchui/react/dropdown-menu';

function Example() {
    return (
        <DropdownMenuRoot>
            <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>Options</DropdownMenuLabel>
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuCheckbox checked={true}>Enable feature</DropdownMenuCheckbox>
                <DropdownMenuRadioGroup value="a">
                    <DropdownMenuRadioItem value="a">A</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="b">B</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSubMenu>
                    <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem>Sub item</DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSubMenu>
            </DropdownMenuContent>
        </DropdownMenuRoot>
    );
}
```

## API Reference

### Root

- **DropdownMenuRoot**: Provides context and manages open state.

### Trigger

- **DropdownMenuTrigger**: Element that toggles the menu.

### Content

- **DropdownMenuContent**: The menu container, supports portal rendering.

### Item

- **DropdownMenuItem**: A selectable menu item.

### Checkbox

- **DropdownMenuCheckbox**: Checkbox item with checked/unchecked state.

### Radio

- **DropdownMenuRadioGroup**: Groups radio items.
- **DropdownMenuRadioItem**: A radio menu item.

### Group

- **DropdownMenuGroup**: Groups related items.

### Label

- **DropdownMenuLabel**: Non-interactive label for grouping.

### Separator

- **DropdownMenuSeparator**: Visual separator.

### Shortcut

- **DropdownMenuShortcut**: Displays keyboard shortcuts.

### SubMenu

- **DropdownMenuSubMenu**: Nested menu.
- **DropdownMenuSubTrigger**: Triggers the submenu.
- **DropdownMenuSubContent**: Content of the submenu.

## Accessibility

- Full keyboard navigation (arrow keys, enter, escape, tab).
- Proper ARIA roles and attributes.
- Focus is managed for menu and submenu items.

## Advanced

- **Controlled State**: Use `open` and `onOpenChange` props on `DropdownMenuRoot`.
- **Custom Placement**: Positioning handled via internal utilities.

## License

MIT
