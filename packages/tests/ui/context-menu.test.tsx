// file: packages/ui/tests/context-menu.test.tsx
import * as React from "react";
import { describe } from "vitest";
import { runContextMenuContract } from "../contracts/context-menu";

import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuLabel,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "@haitch/ui";

function BasicContextMenu() {
  const [bold, setBold] = React.useState(false);
  const [sort, setSort] = React.useState<"asc" | "desc">("asc");

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button type="button" data-testid="cm-trigger">
          Trigger
        </button>
      </ContextMenuTrigger>

      <ContextMenuContent aria-label="Example context menu">
        <ContextMenuItem data-label="Open">
          Open
          <ContextMenuShortcut>⌘O</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuItem data-label="Rename">Rename</ContextMenuItem>

        <ContextMenuItem data-label="Disabled Item" disabled>
          Disabled Item
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuLabel inset>Formatting</ContextMenuLabel>

        <ContextMenuCheckboxItem checked={bold} onCheckedChange={setBold} data-label="Bold">
          Bold
        </ContextMenuCheckboxItem>

        <ContextMenuSeparator />

        <ContextMenuLabel inset>Sort</ContextMenuLabel>

        <ContextMenuRadioGroup value={sort} onValueChange={(v) => setSort(v as "asc" | "desc")}>
          <ContextMenuRadioItem value="asc" data-label="Sort: Asc">
            Sort: Asc
          </ContextMenuRadioItem>
          <ContextMenuRadioItem value="desc" data-label="Sort: Desc">
            Sort: Desc
          </ContextMenuRadioItem>
        </ContextMenuRadioGroup>

        <ContextMenuSeparator />

        <ContextMenuSub>
          <ContextMenuSubTrigger data-label="More Tools">More Tools</ContextMenuSubTrigger>
          <ContextMenuSubContent aria-label="More Tools submenu">
            <ContextMenuItem data-label="Save Page...">Save Page...</ContextMenuItem>
            <ContextMenuItem data-label="Developer Tools">Developer Tools</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        <ContextMenuItem data-label="Delete" variant="destructive">
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function DefaultTriggerContextMenu() {
  const [bold, setBold] = React.useState(false);
  const [sort, setSort] = React.useState<"asc" | "desc">("asc");

  return (
    <ContextMenu>
      <ContextMenuTrigger
        data-testid="cm-trigger"
        tabIndex={0}
        className="flex h-10 w-40 items-center justify-center rounded-md border border-dashed text-sm"
      >
        Right click here
      </ContextMenuTrigger>

      <ContextMenuContent aria-label="Example context menu">
        <ContextMenuItem data-label="Open">
          Open
          <ContextMenuShortcut>⌘O</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuItem data-label="Rename">Rename</ContextMenuItem>

        <ContextMenuItem data-label="Disabled Item" disabled>
          Disabled Item
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuLabel inset>Formatting</ContextMenuLabel>

        <ContextMenuCheckboxItem checked={bold} onCheckedChange={setBold} data-label="Bold">
          Bold
        </ContextMenuCheckboxItem>

        <ContextMenuSeparator />

        <ContextMenuLabel inset>Sort</ContextMenuLabel>

        <ContextMenuRadioGroup value={sort} onValueChange={(v) => setSort(v as "asc" | "desc")}>
          <ContextMenuRadioItem value="asc" data-label="Sort: Asc">
            Sort: Asc
          </ContextMenuRadioItem>
          <ContextMenuRadioItem value="desc" data-label="Sort: Desc">
            Sort: Desc
          </ContextMenuRadioItem>
        </ContextMenuRadioGroup>

        <ContextMenuSeparator />

        <ContextMenuSub>
          <ContextMenuSubTrigger data-label="More Tools">More Tools</ContextMenuSubTrigger>
          <ContextMenuSubContent aria-label="More Tools submenu">
            <ContextMenuItem data-label="Save Page...">Save Page...</ContextMenuItem>
            <ContextMenuItem data-label="Developer Tools">Developer Tools</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        <ContextMenuItem data-label="Delete" variant="destructive">
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

describe("ContextMenu", () => {
  runContextMenuContract("ContextMenu", () => <BasicContextMenu />);
  runContextMenuContract("ContextMenu (default trigger)", () => <DefaultTriggerContextMenu />);
});
