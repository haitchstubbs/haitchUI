# `@haitchUI/react-core`

Core primitives for building floating UI components in React. This package provides foundational components, hooks, services, types, and utilities to support advanced floating UI patterns such as portals, focus management, and dynamic placement.

---

## Features

- **Floating Focus Management**  
    Manage focus within floating elements for accessibility and keyboard navigation.

- **Portal Support**  
    Render floating elements outside the DOM hierarchy using React portals.

- **Placement Services**  
    Utilities for dynamic positioning of floating elements (e.g., tooltips, popovers).

- **Composable Hooks**  
    Hooks for managing floating UI state and behaviors.

- **TypeScript Support**  
    Fully typed APIs for safety and autocompletion.

---

## Directory Structure

```
core/
├── index.ts
├── README.md
└── src/
        ├── components/
        │   ├── FloatingFocusManager.ts
        │   ├── FloatingPortal.ts
        │   └── index.ts
        ├── hooks/
        │   ├── floating.hooks.ts
        │   └── index.ts
        ├── services/
        │   ├── index.ts
        │   ├── menufocus.service.ts
        │   └── placement.service.ts
        ├── types/
        │   ├── index.ts
        │   └── portal.types.ts
        └── util/
                ├── floating.util.ts
                ├── index.ts
                ├── internal/
                │   ├── getSingleChildElement.ts
                │   ├── isIgnorableChild.ts
                │   └── isWhitespaceText.ts
                └── public/
                        └── resolveRenderTarget.tsx
```

---

## Usage

Import the core primitives to build custom floating UI components:

```tsx
import { FloatingPortal, FloatingFocusManager } from '@haitchUI/react-core';
import { useFloating } from '@haitchUI/react-core';

function MyPopover() {
    const floating = useFloating();

    return (
        <FloatingPortal>
            <FloatingFocusManager>
                <div ref={floating.refs.setFloating}>
                    {/* Floating content */}
                </div>
            </FloatingFocusManager>
        </FloatingPortal>
    );
}
```

---

## API Overview

### Components

- **FloatingPortal**  
    Renders children into a React portal.

- **FloatingFocusManager**  
    Manages focus within floating elements for accessibility.

### Hooks

- **useFloating**  
    Hook for managing floating element state and positioning.

### Services

- **menufocus.service**  
    Handles keyboard navigation and focus for menu-like components.

- **placement.service**  
    Calculates and manages dynamic placement of floating elements.

### Utilities

- **floating.util**  
    Helper functions for floating UI logic.

- **resolveRenderTarget**  
    Utility to resolve the target DOM node for rendering portals.

---

## Types

Type definitions for all core APIs are available in the `types/` directory.

---

## Contributing

Contributions are welcome! Please open issues or pull requests on the [main repository](https://github.com/haitchstubbs/haitchUI).

---

## License

MIT