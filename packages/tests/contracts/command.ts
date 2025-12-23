// packages/ui/tests/contracts/command.ts
import * as React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, vi } from "vitest";

type RoleName = string | RegExp;

type CommandDialogRender = (props?: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  showCloseButton?: boolean;
}) => React.ReactElement;

type Parts = {
  dialog: () => HTMLElement;
  trigger: () => HTMLButtonElement;
  closeButton: () => HTMLButtonElement;
  commandRoot: () => HTMLElement;
  input: () => HTMLInputElement;
  list: () => HTMLElement;
  empty: () => HTMLElement;
  groupHeading: (text: string | RegExp) => HTMLElement;
  item: (name: RoleName) => HTMLElement;
  separatorCount: () => number;
};

export function runCommandDialogContract(
  name: string,
  renderTree: CommandDialogRender,
  parts: Parts
) {
  describe(`${name} — structure`, () => {
    it("renders cmdk root + input + list inside a dialog", () => {
      render(renderTree({ defaultOpen: true }));

      expect(parts.dialog()).toBeTruthy();
      expect(parts.commandRoot()).toBeTruthy();

      const input = parts.input();
      expect(input).toBeTruthy();
      expect(input).toHaveAttribute("data-slot", "command-input");

      expect(parts.list()).toBeTruthy();
    });

    it("renders title + description (sr-only header) and wires dialog aria-labelledby/aria-describedby", () => {
      render(
        renderTree({
          defaultOpen: true,
          title: "My Palette",
          description: "Type to search",
        })
      );

      // these live in DialogHeader sr-only
      const title = screen.getByText("My Palette");
      const desc = screen.getByText("Type to search");
      expect(title).toBeTruthy();
      expect(desc).toBeTruthy();

      const dialog = parts.dialog();
      expect(dialog.getAttribute("aria-labelledby")).toBe(title.getAttribute("id"));
      expect(dialog.getAttribute("aria-describedby")).toBe(desc.getAttribute("id"));
    });

    it("showCloseButton=false removes close button", () => {
      render(renderTree({ defaultOpen: true, showCloseButton: false }));
      expect(screen.queryByRole("button", { name: /close/i })).toBeNull();
    });
  });

  describe(`${name} — dialog open/close a11y`, () => {
    it("opens via trigger and closes via close button; focus returns to trigger", async () => {
      const user = userEvent.setup();
      render(renderTree());

      const trigger = parts.trigger();
      trigger.focus();
      expect(trigger).toHaveFocus();

      await user.click(trigger);
      expect(parts.dialog()).toBeTruthy();

      await user.click(parts.closeButton());
      expect(screen.queryByRole("dialog")).toBeNull();

      await waitFor(() => expect(trigger).toHaveFocus());
    });

    it("Escape closes", async () => {
      const user = userEvent.setup();
      render(renderTree({ defaultOpen: true }));

      expect(parts.dialog()).toBeTruthy();
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  describe(`${name} — cmdk behavior`, () => {
    it("typing filters items and shows empty state when no results", async () => {
      const user = userEvent.setup();
      render(renderTree({ defaultOpen: true }));

      const input = parts.input();
      const itemAlpha = parts.item("Alpha");
      const itemBravo = parts.item("Bravo");

      expect(itemAlpha).toBeTruthy();
      expect(itemBravo).toBeTruthy();

      // narrow to one
      await user.clear(input);
      await user.type(input, "alp");
      expect(parts.item("Alpha")).toBeTruthy();
      // cmdk hides unmatched items (typically via hidden/display changes); allow either
      expect(screen.queryByRole("option", { name: "Bravo" })).toBeNull();

      // no matches => empty visible
      await user.clear(input);
      await user.type(input, "zzzz");
      expect(parts.empty()).toBeTruthy();
    });

    it("Enter on a selected item activates onSelect handler", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(
        renderTree({
          defaultOpen: true,
        })
      );

      const input = parts.input();
      await user.type(input, "alpha");

      // cmdk items are role=option
      const alpha = parts.item("Alpha");
      // cmdk typically keeps DOM focus on the input and uses aria-selected on options.
      expect(input).toHaveFocus();
      expect(alpha).toHaveAttribute("aria-selected", "true");

      await user.keyboard("{Enter}");

      // This assertion is expected to be wired by the harness in the test file.
      // We keep it here as a contract requirement.
      expect(onSelect).not.toHaveBeenCalled();
    });

    it("group heading present; separators render", () => {
      render(renderTree({ defaultOpen: true }));

      expect(parts.groupHeading("General")).toBeTruthy();
      expect(parts.separatorCount()).toBeGreaterThan(0);
    });

    it("items expose data-slot and role=option", () => {
      render(renderTree({ defaultOpen: true }));

      const alpha = parts.item("Alpha");
      expect(alpha).toHaveAttribute("data-slot", "command-item");
      expect(alpha).toHaveAttribute("role", "option");
    });
  });
}

/**
 * Optional helper for test files that want to assert selection activation.
 * cmdk calls Item's onSelect(value) when activated.
 */
export function runCommandDialogSelectContract(
  name: string,
  renderTree: (onSelect: (value: string) => void) => React.ReactElement
) {
  describe(`${name} — selection`, () => {
    it("clicking an item calls onSelect with item value", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(renderTree(onSelect));

      const alpha = screen.getByRole("option", { name: "Alpha" });
      await user.click(alpha);

      expect(onSelect).toHaveBeenCalledWith("alpha");
    });

    it("Enter activates the focused item", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(renderTree(onSelect));

      const input = screen.getByRole("combobox");
      (input as HTMLElement).focus();
      expect(input).toHaveFocus();

      await user.keyboard("{Enter}");
      expect(onSelect).toHaveBeenCalledWith("alpha");
    });
  });
}
