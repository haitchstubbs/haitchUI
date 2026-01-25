# Portal Primitives

This package provides low-level React primitives for creating and managing portals, including advanced positioning, focus management, and accessibility features. It is designed to be a flexible foundation for building overlays, modals, tooltips, and other floating UI components.

## Features

- **Portal Rendering**: Render children into a DOM node outside the parent hierarchy.
- **Positioning**: Utilities for calculating and updating portal position relative to a trigger element.
- **Focus Management**: Trap and restore focus for accessibility.
- **Hide Portal**: Automatically hide portals on outside interaction or escape key.
- **Safe Polygon**: Prevent accidental closure when moving the pointer between trigger and portal.
- **Hooks & Context**: Composable hooks and context for managing portal state and behavior.

## File Structure

```
portal/
├── index.ts
├── README.md
└── src/
    ├── internal/
    │   ├── arrow.ts
    │   ├── focusManager.ts
    │   ├── hidePortal.ts
    │   ├── hooks.ts
    │   ├── placement.ts
    │   ├── portalSize.ts
    │   ├── position.ts
    │   ├── runtime.ts
    │   ├── safePolygon.ts
    │   ├── types.ts
    │   └── useInline.ts
    └── public/
        ├── portal.ts
        ├── context/
        │   └── portalContext.tsx
        ├── hooks/
        │   └── useTrigger.ts
        └── managers/
            └── dom.ts
```

## Usage

```tsx
import { Portal } from './portal';

function Example() {
  return (
    <Portal>
      <div>Content rendered in a portal!</div>
    </Portal>
  );
}
```

### Positioning Example

```tsx
import { useTrigger } from './hooks/useTrigger';

function Tooltip({ children, content }) {
  const { triggerRef, portalRef, position } = useTrigger();

  return (
    <>
      <button ref={triggerRef}>Hover me</button>
      <Portal ref={portalRef} style={position}>
        {content}
      </Portal>
    </>
  );
}
```

## API Overview

- **Portal**: Main component for rendering children into a portal.
- **useTrigger**: Hook for managing trigger and portal refs, and calculating position.
- **portalContext**: React context for sharing portal state.
- **focusManager**: Utility for managing focus within the portal.
- **hidePortal**: Handles hiding logic for portals.
- **safePolygon**: Prevents accidental closure on pointer movement.

## Accessibility

- Focus is managed automatically when the portal opens and closes.
- Escape key and outside click handling are built-in for dismissing portals.
- Designed to be composable with other accessibility primitives.

## License

MIT
