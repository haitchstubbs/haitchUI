# Tree Primitives

This directory contains the implementation of the `Tree` component and its supporting utilities for the `haitchUI` React package. The `Tree` primitive provides accessible, keyboard-navigable tree views, suitable for file explorers, menus, and other hierarchical data displays.

## Structure

- **index.ts**  
    Entry point for the tree primitives.

- **tree.tsx**  
    Main React component implementing the tree view.

- **tree.hooks.ts**  
    Custom React hooks for tree state and behavior.

- **tree.types.ts**  
    TypeScript types for tree components and utilities.

- **utils/**  
  Utility functions and helpers, organized by domain:
  - **dom/**  
    DOM-related utilities (e.g., finding tree items, focus management, visibility checks).
  - **events/**  
    Event handling utilities (e.g., toggle listeners).
  - **typeahead/**  
    Utilities for typeahead navigation and text normalization.

Each utility is organized in its own folder, often with an `index.ts`, implementation, and corresponding tests.

## Features

- **Accessible tree navigation** with keyboard support.
- **Typeahead search** for quick navigation.
- **Expandable/collapsible nodes** with event handling.
- **Comprehensive test coverage** for all utilities.

## Usage

Import the `Tree` component and use it to render hierarchical data:

```tsx
import { Tree } from './tree';

<Tree>
{/*
    Example tree data:
    [
        { id: '1', label: 'Root', children: [
            { id: '2', label: 'Child 1' },
            { id: '3', label: 'Child 2', children: [
                { id: '4', label: 'Grandchild' }
            ]}
        ]}
    ]
*/}

<Tree
    data={[
        {
            id: '1',
            label: 'Root',
            children: [
                { id: '2', label: 'Child 1' },
                {
                    id: '3',
                    label: 'Child 2',
                    children: [{ id: '4', label: 'Grandchild' }]
                }
            ]
        }
    ]}
    // Optionally, provide handlers and props for selection, expansion, etc.
    onSelect={id => console.log('Selected:', id)}
    onToggle={id => console.log('Toggled:', id)}
/>
</Tree>
```

Refer to the source code and tests for advanced usage and customization.

## Testing

All utilities and components include unit tests. Run tests from the package root:

```sh
npm test
```

## Contributing

- Follow the project coding standards.
- Add or update tests for any changes.
- Document new features in this README.

## Licence

MIT
