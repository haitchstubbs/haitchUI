# Toast Primitive

A simple, customizable Toast notification primitive for React, part of the `haitchUI` component library.

## Folder Structure

```txt
toast/
├── index.tsx           # Main Toast component export
├── README.md           # Documentation (this file)
└── src/
    └── stringToCSS.ts  # Utility for converting strings to CSS
```

## Usage

Import the Toast component in your React project:

```tsx
import { Toast } from '@haitchUI/react/toast';

function App() {
  return (
    <Toast message="This is a toast notification!" />
  );
}
```

## Features

- Lightweight and customizable toast notifications.
- Utility for dynamic CSS generation (`stringToCSS.ts`).
- Designed for easy integration with other `haitchUI` primitives.

## Customization

You can customize the appearance and behavior of the Toast by passing props or extending the component.

## Development

- **index.tsx**: Main entry point for the Toast component.
- **src/stringToCSS.ts**: Utility function to convert string values to valid CSS.

## License

MIT © haitchstubbs
