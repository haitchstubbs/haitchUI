# Code Block Primitive

A flexible, accessible, and themeable code block component for React, designed for use in the `haitchUI` design system.

## Features

- **Syntax highlighting** via `highlight()`
- **Copy to clipboard** support
- **Accessible**: keyboard navigation and ARIA attributes
- **Composable**: context-based API for advanced use
- **Server-side rendering** support

## Installation

```bash
npm install @haitchui/react
```

## Usage

```tsx
import { CodeBlock } from '@haitchui/code-block';

<CodeBlock language="typescript">
    {`const hello = "world";`}
</CodeBlock>
```

### With Copy Button

```tsx
import { CodeBlock } from '@haitchui/code-block';

<CodeBlock language="js" showCopy>
    {`console.log("Copy me!");`}
</CodeBlock>
```

## API

### `<CodeBlock />`

| Prop         | Type      | Description                                 |
|--------------|-----------|---------------------------------------------|
| `language`   | `string`  | Language for syntax highlighting            |
| `children`   | `string`  | Code content                                |
| `showCopy`   | `boolean` | Show copy-to-clipboard button (optional)    |
| `className`  | `string`  | Custom class names (optional)               |
| `...props`   | `any`     | Other props passed to the root element      |

### Context API

For advanced composition, use the context from `context/context.tsx`:

```tsx
import { CodeBlockProvider, useCodeBlock } from '@haitchui/react/code-block';

<CodeBlockProvider>
    {/* Custom code block composition */}
</CodeBlockProvider>
```

## Server-side Rendering

Use the `server.ts` utilities to render highlighted code on the server.

## Customization

- **Themes**: Style using your own CSS or override the default styles.
- **Highlight.js**: Extend supported languages via `lib/highlight.ts`.

## File Structure

```
code-block/
    index.ts
    README.md
    server.ts
    block/
        component.tsx
        index.ts
    context/
        context.tsx
        index.ts
    lib/
        highlight.ts
```

## License

MIT © haitchstubbs