# Context Menu Primitive

A flexible, accessible, and composable context menu primitive for React, designed for building custom context menus with keyboard navigation, focus management, and advanced features.

## Features

- **Composable API**: Build custom context menus using modular components.
- **Accessibility**: Full keyboard navigation, ARIA roles, and focus management.
- **Portals**: Render menus in portals for correct stacking and positioning.
- **Submenus**: Support for nested context menus.
- **Radio & Checkbox Items**: Built-in support for selectable menu items.
- **Customizable**: Style and extend components as needed.

## Installation

```bash
npm install @haitchui/react
```

## Usage

```tsx
import {
    ContextMenu,
    ContextMenuTrigger,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuCheckboxItem,
    ContextMenuRadioGroup,
    ContextMenuRadioItem,
    ContextMenuSub,
    ContextMenuSubTrigger,
    ContextMenuSubContent,
    ContextMenuLabel,
    ContextMenuShortcut,
    ContextMenuGroup,
} from '@haitchui/react/context-menu';

function Example() {
    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <button>Right click me</button>
            </ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem>Cut</ContextMenuItem>
                <ContextMenuItem>Copy</ContextMenuItem>
                <ContextMenuItem>Paste</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuCheckboxItem checked={true}>Show Line Numbers</ContextMenuCheckboxItem>
                <ContextMenuRadioGroup value="asc">
                    <ContextMenuRadioItem value="asc">Sort Ascending</ContextMenuRadioItem>
                    <ContextMenuRadioItem value="desc">Sort Descending</ContextMenuRadioItem>
                </ContextMenuRadioGroup>
                <ContextMenuSub>
                    <ContextMenuSubTrigger>More</ContextMenuSubTrigger>
                    <ContextMenuSubContent>
                        <ContextMenuItem>Sub Action</ContextMenuItem>
                    </ContextMenuSubContent>
                </ContextMenuSub>
            </ContextMenuContent>
        </ContextMenu>
    );
}
```

## API Reference

### Root

- `ContextMenu`: Provides context for the menu.
- `ContextMenuTrigger`: Element that opens the menu on right-click.
- `ContextMenuContent`: The menu container.

### Items

- `ContextMenuItem`: Standard menu item.
- `ContextMenuCheckboxItem`: Checkbox menu item.
- `ContextMenuRadioGroup`: Group for radio items.
- `ContextMenuRadioItem`: Radio menu item.
- `ContextMenuSeparator`: Visual separator.
- `ContextMenuLabel`: Non-interactive label.
- `ContextMenuShortcut`: Shortcut hint.
- `ContextMenuGroup`: Groups related items.

### Submenus

- `ContextMenuSub`: Submenu container.
- `ContextMenuSubTrigger`: Triggers submenu.
- `ContextMenuSubContent`: Submenu content.

## Accessibility

- Uses appropriate ARIA roles and attributes.
- Keyboard navigation: arrow keys, Enter, Space, Escape, Tab.
- Focus is managed automatically.

## Customization

All components accept `className` and other standard props for styling and extension.

## Advanced

- **Controlled State**: Use hooks like `useControllableState` for advanced control.
- **Context**: Access menu state via context hooks for custom logic.

## License

MIT

---
Part of [haitchUI](https://github.com/haitchstubbs/haitchUI)