# @haitch-ui/react

A modern, accessible, and customizable React component library designed for building high-quality UIs with speed and consistency.

## Features

- **Accessible**: Components follow WAI-ARIA guidelines and best practices.
- **Composable**: Build complex UIs from simple, composable primitives.
- **Customizable**: Style with your own CSS or utility frameworks.
- **TypeScript-first**: Fully typed APIs for safety and autocompletion.
- **Modular**: Import only what you need for optimal bundle size.

## Installation

```bash
npm install @haitch-ui/react
# or
yarn add @haitch-ui/react
```

## Usage

Import and use components in your React app:

```tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@haitch-ui/react/primitives/accordion';

function Example() {
    return (
        <Accordion>
            <AccordionItem>
                <AccordionTrigger>Section 1</AccordionTrigger>
                <AccordionContent>Content for section 1</AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
```

## Components

- **Primitives**: Accordion, Alert Dialog, Aspect Ratio, Avatar, Carousel, Code Block, Collapsible, Combobox, Context Menu, Core, Data Table, Dialog, Dropdown Menu, Hover Card, Label, Menubar, Navigation Menu, Overlay, Popover, Portal, Progress, Radio Group, Rect, Scroll Area, Select, Slider, Slot, Switch, Tabs, Toast, Toggle, Toggle Group, Tooltip, Tree, and more.
- **Hooks**: Utilities for state management and accessibility.
- **Utils**: Helpers for event handling, refs, context, and more.

See the [virtual-element documentation](./src/virtual-element/README.md) for advanced usage.

## Documentation

- [Component API Reference](#)
- [Getting Started Guide](#)
- [Theming & Customization](#)
- [Accessibility](#)

## Contributing

Contributions are welcome! Please see the [contributing guidelines](../../CONTRIBUTING.md) for details.

## License

This project is licensed under the terms of the [MIT license](./LICENSE.md).

---

© haitchstubbs. Built with ❤️ for modern React apps.
