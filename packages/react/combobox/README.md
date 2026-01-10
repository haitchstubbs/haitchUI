# @haitch/react-combobox

Scaffolded primitive package.

## Usage
```tsx
import * as Combobox from "@haitch/react-combobox";

export function Example() {
  return (
    <Combobox.Root>
      <Combobox.Input placeholder="Search." />
      <Combobox.Portal>
        <Combobox.Positioner>
          <Combobox.Popup>
            <Combobox.List>
              <Combobox.Item value="apple" textValue="Apple" />
              <Combobox.Item value="banana" textValue="Banana" />
            </Combobox.List>
            <Combobox.Empty>No results.</Combobox.Empty>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
```

## Install
```sh
pnpm add @haitch/react-combobox
```
