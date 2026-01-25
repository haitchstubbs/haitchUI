# DataTable

A flexible and accessible React data table component for displaying tabular data with ease.

## Features

- **TypeScript support** for strong typing and autocompletion.
- **Composable API** for custom table layouts.
- **Accessible**: Proper ARIA roles and keyboard navigation.
- **Custom cell rendering** via render props.
- **Lightweight**: No external dependencies.

## Installation

```bash
npm install @haitchui/react
```

## Usage

```tsx
import { DataTable } from '@haitchui/react/data-table';

const columns = [
    { key: 'name', header: 'Name' },
    { key: 'age', header: 'Age' },
];

const data = [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
];

<DataTable columns={columns} data={data} />
```

## Props

| Prop      | Type                | Description                        |
|-----------|---------------------|------------------------------------|
| `columns` | `Array<Column>`     | Column definitions (see below)     |
| `data`    | `Array<object>`     | Array of row data                  |
| `rowKey?` | `(row) => string`   | Optional function for row keys     |
| `renderCell?` | `(cell, row, col) => ReactNode` | Custom cell renderer |

### Column Definition

```ts
type Column = {
    key: string;
    header: React.ReactNode;
    // ...other optional properties
};
```

## Custom Cell Rendering

```tsx
<DataTable
    columns={columns}
    data={data}
    renderCell={(cell, row, col) => (
        col.key === 'age' ? <strong>{cell}</strong> : cell
    )}
/>
```

## Accessibility

- Uses semantic table elements (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<td>`, `<th>`).
- Supports keyboard navigation.

## License

MIT

---
For more details, see the [source code](./src/data-table.tsx).