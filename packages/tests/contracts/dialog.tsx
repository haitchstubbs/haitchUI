// packages/ui/tests/contracts/dialog.ts
import * as React from "react";
import { render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, vi } from "vitest";

type DialogRender = (props?: {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  modal?: boolean;
}) => React.ReactElement;

type Parts = {
  root: () => HTMLElement;
  trigger: () => HTMLButtonElement;
  overlay: () => HTMLElement;
  content: () => HTMLElement;
  title: () => HTMLElement;
  description: () => HTMLElement;
  closeButton: () => HTMLButtonElement;
};

export function runDialogContract(name: string, renderDialog: DialogRender, parts: Parts) {
  describe(`${name} — base structure`, () => {
    it("renders root + trigger", () => {
      render(renderDialog());
      expect(parts.root()).toBeTruthy();
      expect(parts.trigger()).toBeTruthy();
    });
  });

  describe(`${name} — uncontrolled`, () => {
    it("defaultOpen opens and wires aria", () => {
      render(renderDialog({ defaultOpen: true }));

      const trigger = parts.trigger();
      const content = parts.content();
      const title = parts.title();
      const description = parts.description();

      expect(trigger).toHaveAttribute("aria-expanded", "true");
      expect(trigger.getAttribute("aria-controls")).toBe(content.getAttribute("id"));

      expect(content).toHaveAttribute("role", "dialog");
      expect(content).toHaveAttribute("aria-modal", "true");
      expect(content).not.toHaveAttribute("hidden");
      expect(content).toHaveAttribute("aria-hidden", "false");

      expect(title.getAttribute("id")).toBeTruthy();
      expect(description.getAttribute("id")).toBeTruthy();

      expect(content).toHaveAttribute("aria-labelledby", title.getAttribute("id"));
      expect(content).toHaveAttribute("aria-describedby", description.getAttribute("id"));
    });

    it("click trigger opens; close button closes; focus restores to trigger", async () => {
      const user = userEvent.setup();
      render(renderDialog());

      const trigger = parts.trigger();
      trigger.focus();
      expect(trigger).toHaveFocus();

      await user.click(trigger);

      const content = parts.content();
      expect(content).not.toHaveAttribute("hidden");
      expect(document.activeElement).not.toBe(trigger);

      await user.click(parts.closeButton());

      expect(content).toHaveAttribute("hidden");
      expect(trigger).toHaveFocus();
    });

    it("Escape closes", async () => {
      const user = userEvent.setup();
      render(renderDialog({ defaultOpen: true }));

      const content = parts.content();
      expect(content).not.toHaveAttribute("hidden");

      await user.keyboard("{Escape}");
      expect(content).toHaveAttribute("hidden");
    });

    it("overlay click closes (clicking overlay only)", async () => {
      const user = userEvent.setup();
      render(renderDialog({ defaultOpen: true }));

      const overlay = parts.overlay();
      const content = parts.content();

      expect(content).not.toHaveAttribute("hidden");

      await user.click(overlay);
      expect(content).toHaveAttribute("hidden");
    });

    it("Tab cycles within dialog (basic focus trap)", async () => {
      const user = userEvent.setup();
      render(renderDialog({ defaultOpen: true }));

      const content = parts.content();
      const q = within(content);

      const first = q.getByRole("button", { name: "First" }) as HTMLButtonElement;
      const last = q.getByRole("button", { name: "Last" }) as HTMLButtonElement;
      const close = q.getByRole("button", { name: /close/i }) as HTMLButtonElement;

      first.focus();
      expect(first).toHaveFocus();

      await user.tab();
      expect(last).toHaveFocus();

      await user.tab();
      expect(close).toHaveFocus();

      // next tab should wrap to first because modal focus trap
      await user.tab();
      expect(first).toHaveFocus();

      await user.tab({ shift: true });
      expect(close).toHaveFocus();
    });
  });

  describe(`${name} — controlled`, () => {
    it("calls onOpenChange but UI does not change unless open prop changes", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(renderDialog({ open: false, onOpenChange }));

      await user.click(parts.trigger());

      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(() => parts.content()).toThrowError();
    });

    it("controlled harness updates UI when state updates", async () => {
      const user = userEvent.setup();

      function Harness() {
        const [open, setOpen] = React.useState<boolean>(false);
        return renderDialog({ open, onOpenChange: setOpen });
      }

      render(<Harness />);

      await user.click(parts.trigger());
      expect(parts.content()).toBeTruthy();
      expect(parts.content()).not.toHaveAttribute("hidden");
    });
  });

  describe(`${name} — disabled`, () => {
    it("disabled prevents opening/closing (trigger, overlay, escape, close)", async () => {
      const user = userEvent.setup();
      render(renderDialog({ disabled: true }));

      await user.click(parts.trigger());
      expect(() => parts.content()).toThrowError();
    });

    it("disabled prevents closing when already open", async () => {
      const user = userEvent.setup();
      render(renderDialog({ disabled: true, defaultOpen: true }));

      const content = parts.content();
      expect(content).not.toHaveAttribute("hidden");

      await user.keyboard("{Escape}");
      expect(content).not.toHaveAttribute("hidden");

      await user.click(parts.overlay());
      expect(content).not.toHaveAttribute("hidden");

      await user.click(parts.closeButton());
      expect(content).not.toHaveAttribute("hidden");
    });
  });

  describe(`${name} — non-modal`, () => {
    it("modal={false} removes overlay and aria-modal; does not wrap Tab", async () => {
      const user = userEvent.setup();
      render(renderDialog({ defaultOpen: true, modal: false }));

      const content = parts.content();
      expect(content).not.toHaveAttribute("aria-modal", "true");
      expect(() => parts.overlay()).toThrowError();

      const q = within(content);
      const first = q.getByRole("button", { name: "First" }) as HTMLButtonElement;
      const last = q.getByRole("button", { name: "Last" }) as HTMLButtonElement;
      const close = q.getByRole("button", { name: /close/i }) as HTMLButtonElement;

      first.focus();
      expect(first).toHaveFocus();

      await user.tab();
      expect(last).toHaveFocus();

      // moves through dialog controls; no wrap back to first
      await user.tab();
      expect(close).toHaveFocus();

      await user.tab();
      expect(first).not.toHaveFocus();
    });
  });
}
