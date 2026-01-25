# Navigation Menu

A flexible, accessible, and customizable navigation menu primitive for React, designed for use in the `haitchUI` component library.

## Features

- **Accessible**: Keyboard navigation and ARIA attributes for screen readers.
- **Composable**: Build complex navigation structures with simple components.
- **Customizable**: Style and extend to fit your design system.

## Installation

```bash
npm install @haitchui/react
```

## Usage

```tsx
import { NavigationMenu } from '@haitchui/react/navigation-menu';

function App() {
    return (
        <NavigationMenu>
            {/* Add your navigation items here */}
        </NavigationMenu>
    );
}
```

## API Reference

### `<NavigationMenu>`

The root component for your navigation menu.

#### Props

| Prop      | Type     | Description                        |
|-----------|----------|------------------------------------|
| children  | ReactNode| Navigation items or groups          |
| ...rest   | any      | Additional props passed to the root |

### Example

```tsx
<NavigationMenu>
    <NavigationMenu.Item>
        <NavigationMenu.Link href="/">Home</NavigationMenu.Link>
    </NavigationMenu.Item>
    <NavigationMenu.Item>
        <NavigationMenu.Link href="/about">About</NavigationMenu.Link>
    </NavigationMenu.Item>
</NavigationMenu>
```

## Accessibility

- Fully keyboard navigable.
- Uses appropriate ARIA roles and attributes.

## Customization

Style the menu using your preferred CSS-in-JS solution or plain CSS. The component exposes class names for targeting.

## License

MIT © haitchstubbs