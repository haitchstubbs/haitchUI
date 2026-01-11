// file: packages/ui/tests/contracts/context-menu.tsx
import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import axe from "axe-core";

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@haitch-ui/ui";

type RenderContextMenu = () => React.ReactElement;

export function runContextMenuContract(name: string, renderMenu: RenderContextMenu) {
  describe(`${name} — structure & a11y`, () => {
    it("has no obvious a11y violations when opened", async () => {
      const { container } = render(renderMenu());

      const trigger = screen.getByTestId("cm-trigger");
      fireEvent.contextMenu(trigger);

      expect(screen.getByRole("menu")).toBeTruthy();

      const results = await axe.run(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe(`${name} — opening/closing`, () => {
    it("opens on right click (contextmenu) and focuses the first enabled item", async () => {
      render(renderMenu());

      const trigger = screen.getByTestId("cm-trigger");
      fireEvent.contextMenu(trigger);

      expect(screen.getByRole("menu")).toBeTruthy();

      const firstItem = screen.getByRole("menuitem", { name: /^Open/ });
      await waitFor(() => expect(firstItem).toHaveFocus());
    });

    it("opens on keyboard (Shift+F10) and closes with Escape, returning focus to trigger", async () => {
      const user = userEvent.setup();
      render(renderMenu());

      const trigger = screen.getByTestId("cm-trigger");
      trigger.focus();
      expect(trigger).toHaveFocus();

      await user.keyboard("{Shift>}{F10}{/Shift}");
      expect(screen.getByRole("menu")).toBeTruthy();

      await user.keyboard("{Escape}");
      expect(screen.queryByRole("menu")).toBeNull();
      expect(trigger).toHaveFocus();
    });

    it("closes on outside click", async () => {
      const user = userEvent.setup();
      render(
        <div>
          {renderMenu()}
          <button type="button">Outside</button>
        </div>
      );

      const trigger = screen.getByTestId("cm-trigger");
      fireEvent.contextMenu(trigger);
      expect(screen.getByRole("menu")).toBeTruthy();

      await user.click(screen.getByRole("button", { name: "Outside" }));
      expect(screen.queryByRole("menu")).toBeNull();
    });
  });

  describe(`${name} — keyboard navigation`, () => {
    it("ArrowDown/ArrowUp roves focus across enabled items (skipping disabled)", async () => {
      const user = userEvent.setup();
      render(renderMenu());

      const trigger = screen.getByTestId("cm-trigger");
      fireEvent.contextMenu(trigger);

      const open = screen.getByRole("menuitem", { name: /^Open/ });
      const rename = screen.getByRole("menuitem", { name: "Rename" });
      const bold = screen.getByRole("menuitemcheckbox", { name: "Bold" });

      await waitFor(() => expect(open).toHaveFocus());

      await user.keyboard("{ArrowDown}");
      expect(rename).toHaveFocus();

      await user.keyboard("{ArrowDown}");
      // "Disabled Item" is skipped, next enabled is the checkbox item.
      expect(bold).toHaveFocus();

      await user.keyboard("{ArrowUp}");
      expect(rename).toHaveFocus();
    });

    it("Home focuses the first enabled item", async () => {
      const user = userEvent.setup();
      render(renderMenu());

      const trigger = screen.getByTestId("cm-trigger");
      fireEvent.contextMenu(trigger);

      const open = screen.getByRole("menuitem", { name: /^Open/ });
      const rename = screen.getByRole("menuitem", { name: "Rename" });

      await waitFor(() => expect(open).toHaveFocus());

      await user.keyboard("{ArrowDown}");
      expect(rename).toHaveFocus();

      await user.keyboard("{Home}");
      expect(open).toHaveFocus();
    });

    it("typeahead focuses the first matching item label", async () => {
      const user = userEvent.setup();
      render(renderMenu());

      const trigger = screen.getByTestId("cm-trigger");
      fireEvent.contextMenu(trigger);

      await user.keyboard("d");
      expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
    });
  });

  describe(`${name} — selection semantics`, () => {
    it("clicking an item calls onSelect and closes", async () => {
      const user = userEvent.setup();
      const onOpen = vi.fn();

      const Menu = renderMenuWithHandlers({ onOpen });
      render(<Menu />);

      const trigger = screen.getByTestId("cm-trigger");
      fireEvent.contextMenu(trigger);

      await user.click(screen.getByRole("menuitem", { name: /^Open/ }));
      expect(onOpen).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole("menu")).toBeNull();
    });

    it("disabled item does not call onSelect", async () => {
      const user = userEvent.setup();
      const onDisabled = vi.fn();

      const Menu = renderMenuWithHandlers({ onDisabled });
      render(<Menu />);

      const trigger = screen.getByTestId("cm-trigger");
      fireEvent.contextMenu(trigger);

      const disabled = screen.getByRole("menuitem", { name: "Disabled Item" });
      expect(disabled).toHaveAttribute("aria-disabled", "true");

      await user.click(disabled);
      expect(onDisabled).toHaveBeenCalledTimes(0);
    });

    it("checkbox item uses role=menuitemcheckbox and toggles aria-checked", async () => {
      const user = userEvent.setup();
      render(renderMenu());

      const trigger = screen.getByTestId("cm-trigger");
      fireEvent.contextMenu(trigger);

      const bold = screen.getByRole("menuitemcheckbox", { name: "Bold" });
      expect(bold).toHaveAttribute("aria-checked", "false");

      await user.click(bold);

      // menu closes after select; reopen to assert state changed
      fireEvent.contextMenu(trigger);
      const bold2 = screen.getByRole("menuitemcheckbox", { name: "Bold" });
      expect(bold2).toHaveAttribute("aria-checked", "true");
    });

    it("radio items use role=menuitemradio and update aria-checked within group", async () => {
      const user = userEvent.setup();
      render(renderMenu());

      const trigger = screen.getByTestId("cm-trigger");
      fireEvent.contextMenu(trigger);

      const asc = screen.getByRole("menuitemradio", { name: "Sort: Asc" });
      const desc = screen.getByRole("menuitemradio", { name: "Sort: Desc" });

      expect(asc).toHaveAttribute("aria-checked", "true");
      expect(desc).toHaveAttribute("aria-checked", "false");

      await user.click(desc);

      fireEvent.contextMenu(trigger);
      const asc2 = screen.getByRole("menuitemradio", { name: "Sort: Asc" });
      const desc2 = screen.getByRole("menuitemradio", { name: "Sort: Desc" });

      expect(asc2).toHaveAttribute("aria-checked", "false");
      expect(desc2).toHaveAttribute("aria-checked", "true");
    });
  });

  describe(`${name} — submenu primitives`, () => {
    it("opens submenu on mouse enter of sub trigger", async () => {
      const user = userEvent.setup();
      render(renderMenuWithSubmenu());

      const trigger = screen.getByTestId("cm-trigger");
      fireEvent.contextMenu(trigger);

      const moreTools = screen.getByRole("menuitem", { name: "More Tools" });
      await user.hover(moreTools);

      // submenu should appear and contain items
      expect(screen.getByRole("menuitem", { name: "Save Page..." })).toBeTruthy();
      expect(screen.getByRole("menuitem", { name: "Developer Tools" })).toBeTruthy();
    });

    it("opens submenu with ArrowRight and closes with ArrowLeft (returning focus to sub trigger)", async () => {
      const user = userEvent.setup();
      render(renderMenuWithSubmenu());

      const trigger = screen.getByTestId("cm-trigger");
      fireEvent.contextMenu(trigger);

      const moreTools = screen.getByRole("menuitem", { name: "More Tools" });
      moreTools.focus();
      expect(moreTools).toHaveFocus();

      await user.keyboard("{ArrowRight}");
      expect(screen.getByRole("menuitem", { name: "Save Page..." })).toBeTruthy();

      await user.keyboard("{ArrowLeft}");
      await waitFor(() => expect(moreTools).toHaveFocus());
    });
  });
}

type Handlers = {
  onOpen?: () => void;
  onDisabled?: () => void;
};

function renderMenuWithHandlers(handlers: Handlers) {
  // eslint-disable-next-line react/no-unstable-nested-components
  return function Menu() {
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
          <ContextMenuItem data-label="Open" onSelect={handlers.onOpen}>
            Open
            <ContextMenuShortcut>⌘O</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuItem data-label="Rename">Rename</ContextMenuItem>

          <ContextMenuItem data-label="Disabled Item" disabled onSelect={handlers.onDisabled}>
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

          <ContextMenuItem data-label="Delete" variant="destructive">
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  };
}

function renderMenuWithSubmenu() {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button type="button" data-testid="cm-trigger">
          Trigger
        </button>
      </ContextMenuTrigger>

      <ContextMenuContent aria-label="Example context menu">
        <ContextMenuItem data-label="Open">Open</ContextMenuItem>

        <ContextMenuSub>
          <ContextMenuSubTrigger data-label="More Tools">More Tools</ContextMenuSubTrigger>
          <ContextMenuSubContent aria-label="More Tools submenu">
            <ContextMenuItem data-label="Save Page...">Save Page...</ContextMenuItem>
            <ContextMenuItem data-label="Developer Tools">Developer Tools</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  );
}
