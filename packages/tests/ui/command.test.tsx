// packages/ui/tests/components/command.test.tsx
import * as React from "react";
import { describe, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@haitch/ui";

import {
  runCommandDialogContract,
  runCommandDialogSelectContract,
} from "../contracts/command";

function BasicCommandDialog(
  props?: Partial<React.ComponentProps<typeof CommandDialog>>
) {
  return (
    <CommandDialog {...props}>
      <CommandInput placeholder="Search..." />
      <CommandList>
        <CommandEmpty>No results</CommandEmpty>

        <CommandGroup heading="General">
          <CommandItem value="alpha">
            Alpha <CommandShortcut>⌘A</CommandShortcut>
          </CommandItem>
          <CommandItem value="bravo">Bravo</CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Other">
          <CommandItem value="charlie">Charlie</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

function TriggeredHarness(
  props?: Partial<React.ComponentProps<typeof CommandDialog>>
) {
  const [open, setOpen] = React.useState<boolean>(props?.defaultOpen ?? false);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  return (
    <div>
      <button type="button" ref={triggerRef} onClick={() => setOpen(true)}>
        Open Palette
      </button>

      <CommandDialog
        {...props}
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) queueMicrotask(() => triggerRef.current?.focus());
        }}
        title={props?.title}
        description={props?.description}
        showCloseButton={props?.showCloseButton}
      >
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandEmpty>No results</CommandEmpty>

          <CommandGroup heading="General">
            <CommandItem value="alpha">Alpha</CommandItem>
            <CommandItem value="bravo">Bravo</CommandItem>
          </CommandGroup>

          <CommandSeparator />
        </CommandList>
      </CommandDialog>
    </div>
  );
}

const parts = {
  dialog: () => screen.getByRole("dialog") as HTMLElement,
  trigger: () => screen.getByRole("button", { name: "Open Palette" }) as HTMLButtonElement,
  closeButton: () => screen.getByRole("button", { name: /close/i }) as HTMLButtonElement,
  commandRoot: () => {
    const el = document.querySelector('[data-slot="command"]') as HTMLElement | null;
    expect(el).toBeTruthy();
    return el!;
  },
  input: () => screen.getByRole("combobox") as HTMLInputElement,
  list: () => {
    const el = document.querySelector('[data-slot="command-list"]') as HTMLElement | null;
    expect(el).toBeTruthy();
    return el!;
  },
  empty: () => {
    const el = document.querySelector('[data-slot="command-empty"]') as HTMLElement | null;
    expect(el).toBeTruthy();
    return el!;
  },
  groupHeading: (text: string | RegExp) => screen.getByText(text) as HTMLElement,
  item: (name: string | RegExp) => screen.getByRole("option", { name }) as HTMLElement,
  separatorCount: () => document.querySelectorAll('[data-slot="command-separator"]').length,
};

describe("CommandDialog", () => {
  runCommandDialogContract("CommandDialog", (p) => <TriggeredHarness {...p} />, parts);

  runCommandDialogSelectContract("CommandDialog", (onSelect) => (
    <CommandDialog defaultOpen>
      <CommandInput placeholder="Search..." />
      <CommandList>
        <CommandEmpty>No results</CommandEmpty>

        <CommandGroup heading="General">
          <CommandItem value="alpha" onSelect={onSelect}>
            Alpha
          </CommandItem>
          <CommandItem value="bravo" onSelect={onSelect}>
            Bravo
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  ));

  it("Command (standalone) renders with data-slot", () => {
    render(<BasicCommandDialog defaultOpen />);
    const root = document.querySelector('[data-slot="command"]') as HTMLElement | null;
    expect(root).toBeTruthy();
  });
});
