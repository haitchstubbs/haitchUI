// packages/ui/tests/contracts/collapsible.ts
import * as React from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, vi } from "vitest";

type CollapsibleRender = (props?: {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}) => React.ReactElement;

type Parts = {
  root: () => HTMLElement;
  trigger: () => HTMLButtonElement;
  content: () => HTMLElement;
};

export function runCollapsibleContract(
  name: string,
  renderCollapsible: CollapsibleRender,
  parts: Parts
) {
  describe(`${name} — base structure`, () => {
    it("renders root + trigger, and content is present/hidden when force mounted", () => {
      render(renderCollapsible());
      expect(parts.root()).toBeTruthy();
      expect(parts.trigger()).toBeTruthy();
      const content = parts.content();
      expect(content).toBeTruthy();
      expect(content).toHaveAttribute("hidden");
      expect(content).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe(`${name} — uncontrolled`, () => {
    it("defaultOpen true shows content", () => {
      render(renderCollapsible({ defaultOpen: true }));
      const t = parts.trigger();
      const c = parts.content();

      expect(t).toHaveAttribute("aria-expanded", "true");
      expect(c).not.toHaveAttribute("hidden");
      expect(c).toHaveAttribute("aria-hidden", "false");
    });

    it("click toggles open/closed", async () => {
      const user = userEvent.setup();
      render(renderCollapsible());

      const t = parts.trigger();
      const c = parts.content();

      expect(t).toHaveAttribute("aria-expanded", "false");
      expect(c).toHaveAttribute("hidden");

      await user.click(t);
      expect(t).toHaveAttribute("aria-expanded", "true");
      expect(c).not.toHaveAttribute("hidden");

      await user.click(t);
      expect(t).toHaveAttribute("aria-expanded", "false");
      expect(c).toHaveAttribute("hidden");
    });

    it("Enter/Space activates trigger", async () => {
      const user = userEvent.setup();
      render(renderCollapsible());

      const t = parts.trigger();
      const c = parts.content();

      t.focus();
      expect(t).toHaveFocus();

      await user.keyboard("{Enter}");
      expect(t).toHaveAttribute("aria-expanded", "true");
      expect(c).not.toHaveAttribute("hidden");

      await user.keyboard(" ");
      expect(t).toHaveAttribute("aria-expanded", "false");
      expect(c).toHaveAttribute("hidden");
    });
  });

  describe(`${name} — controlled`, () => {
    it("calls onOpenChange but UI does not change unless open prop changes", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(renderCollapsible({ open: false, onOpenChange }));

      await user.click(parts.trigger());

      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(parts.content()).toHaveAttribute("hidden");
      expect(parts.trigger()).toHaveAttribute("aria-expanded", "false");
    });

    it("controlled harness updates UI when state updates", async () => {
      const user = userEvent.setup();

      function Harness() {
        const [open, setOpen] = React.useState<boolean>(false);
        return renderCollapsible({ open, onOpenChange: setOpen });
      }

      render(<Harness />);

      await user.click(parts.trigger());
      expect(parts.content()).not.toHaveAttribute("hidden");
      expect(parts.trigger()).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe(`${name} — disabled`, () => {
    it("disabled prevents interaction", async () => {
      const user = userEvent.setup();
      render(renderCollapsible({ disabled: true }));

      const t = parts.trigger();
      expect(t).toBeDisabled();

      await user.click(t);
      expect(parts.content()).toHaveAttribute("hidden");
      expect(t).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe(`${name} — ARIA wiring`, () => {
    it("aria-controls matches content id; content is region + labelledby trigger id", async () => {
      const user = userEvent.setup();
      render(renderCollapsible());

      const t = parts.trigger();
      const c = parts.content();

      const controls = t.getAttribute("aria-controls");
      expect(controls).toBeTruthy();
      expect(c).toHaveAttribute("id", controls!);

      const triggerId = t.getAttribute("id");
      expect(triggerId).toBeTruthy();
      expect(c).toHaveAttribute("aria-labelledby", triggerId!);

      expect(c).toHaveAttribute("role", "region");
      expect(c).toHaveAttribute("aria-hidden", "true");
      expect(c).toHaveAttribute("hidden");

      await user.click(t);

      expect(c).toHaveAttribute("aria-hidden", "false");
      expect(c).not.toHaveAttribute("hidden");
    });
  });
}
