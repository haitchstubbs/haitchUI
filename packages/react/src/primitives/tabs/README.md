# Tabs Primitive

A flexible and accessible Tabs primitive component for React, designed for easy integration and customization.

## Features

- **Accessible**: Keyboard navigation and ARIA attributes for screen readers.
- **Composable**: Easily compose with other components.
- **Uncontrolled & Controlled**: Supports both usage patterns.
- **Customizable**: Style and extend as needed.

## Installation

```bash
npm install @haitchui/react
# or
yarn add @haitchui/react
```

## Usage

```tsx
import { Tabs, TabList, Tab, TabPanel } from '@haitchui/react/tabs';

function Example() {
    return (
        <Tabs defaultValue="tab1">
            <TabList>
                <Tab value="tab1">Tab 1</Tab>
                <Tab value="tab2">Tab 2</Tab>
            </TabList>
            <TabPanel value="tab1">
                Content for Tab 1
            </TabPanel>
            <TabPanel value="tab2">
                Content for Tab 2
            </TabPanel>
        </Tabs>
    );
}
```

## API Reference

### `<Tabs>`

| Prop            | Type                      | Description                                 |
|-----------------|---------------------------|---------------------------------------------|
| `value`         | `string`                  | (Controlled) The active tab value.          |
| `defaultValue`  | `string`                  | (Uncontrolled) The initial active tab.      |
| `onValueChange` | `(value: string) => void` | Callback when tab changes.                  |
| `children`      | `ReactNode`               | TabList and TabPanel components.            |

### `<TabList>`

Wraps your `<Tab>` components.

### `<Tab>`

| Prop       | Type        | Description               |
|------------|-------------|---------------------------|
| `value`    | `string`    | The value for this tab.   |
| `children` | `ReactNode` | Tab label.                |

### `<TabPanel>`

| Prop       | Type        | Description                       |
|------------|-------------|-----------------------------------|
| `value`    | `string`    | The value this panel shows for.   |
| `children` | `ReactNode` | Panel content.                    |

## Accessibility

- Tabs are focusable and navigable via keyboard (Arrow keys, Home/End).
- Proper ARIA roles and attributes are applied.

## Customization

Style using your preferred CSS-in-JS solution or plain CSS. All components forward refs and accept standard HTML props.

## License

MIT
