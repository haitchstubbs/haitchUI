import * as React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, vi } from "vitest";

type RoleName = string | RegExp;

type AccordionRender = (props?: {
  type?: "single" | "multiple";
  defaultValue?: any;
  value?: any;
  onValueChange?: (next: any) => void;
  disabled?: boolean;
}) => React.ReactElement;

type Parts = {
  trigger: (name: RoleName) => HTMLButtonElement;
  contentByText: (text: string | RegExp) => HTMLElement;
  itemCount: () => number;
  root: () => HTMLElement;
};

export function runAccordionContract(
  name: string,
  renderAccordion: AccordionRender,
  parts: Parts
) {
  describe(`${name} — base structure`, () => {
    it("renders container + items", () => {
      render(renderAccordion());
      expect(parts.root()).toBeTruthy();
      expect(parts.itemCount()).toBeGreaterThan(0);
    });
  });

  describe(`${name} — uncontrolled single`, () => {
    it("defaultValue opens the matching item", () => {
      render(renderAccordion({ type: "single", defaultValue: "item-1" }));

      const content1 = parts.contentByText("Content 1");
      const content2 = parts.contentByText("Content 2");

      const trigger1 = parts.trigger("Section 1");

      expect(content1).not.toHaveAttribute("hidden");
      expect(content1).toHaveAttribute("aria-hidden", "false");

      expect(content2).toHaveAttribute("hidden");
      expect(content2).toHaveAttribute("aria-hidden", "true");

      expect(content1).toHaveAttribute("aria-labelledby", trigger1.getAttribute("id"));

    });

    it("clicking toggles in single mode", async () => {
      const user = userEvent.setup();
      render(renderAccordion({ type: "single" }));

      const t1 = parts.trigger("Section 1");
      const c1 = parts.contentByText("Content 1");

      expect(t1).toHaveAttribute("aria-expanded", "false");
      expect(c1).toHaveAttribute("hidden");

      await user.click(t1);
      expect(t1).toHaveAttribute("aria-expanded", "true");
      expect(c1).not.toHaveAttribute("hidden");

      await user.click(t1);
      expect(t1).toHaveAttribute("aria-expanded", "false");
      expect(c1).toHaveAttribute("hidden");
    });

    it("opening item-2 closes item-1 in single mode", async () => {
      const user = userEvent.setup();
      render(renderAccordion({ type: "single", defaultValue: "item-1" }));

      const t1 = parts.trigger("Section 1");
      const t2 = parts.trigger("Section 2");
      const c1 = parts.contentByText("Content 1");
      const c2 = parts.contentByText("Content 2");

      expect(t1).toHaveAttribute("aria-expanded", "true");
      expect(c1).not.toHaveAttribute("hidden");

      await user.click(t2);

      expect(t2).toHaveAttribute("aria-expanded", "true");
      expect(c2).not.toHaveAttribute("hidden");

      expect(t1).toHaveAttribute("aria-expanded", "false");
      expect(c1).toHaveAttribute("hidden");
    });
  });

  describe(`${name} — uncontrolled multiple`, () => {
    it("allows multiple sections open", async () => {
      const user = userEvent.setup();
      render(renderAccordion({ type: "multiple", defaultValue: [] }));

      const t1 = parts.trigger("Section 1");
      const t2 = parts.trigger("Section 2");

      await user.click(t1);
      await user.click(t2);

      expect(t1).toHaveAttribute("aria-expanded", "true");
      expect(t2).toHaveAttribute("aria-expanded", "true");

      expect(parts.contentByText("Content 1")).not.toHaveAttribute("hidden");
      expect(parts.contentByText("Content 2")).not.toHaveAttribute("hidden");
    });

    it("clicking an open item closes only that item", async () => {
      const user = userEvent.setup();
      render(renderAccordion({ type: "multiple", defaultValue: ["item-1", "item-2"] }));

      const t1 = parts.trigger("Section 1");

      await user.click(t1);

      expect(t1).toHaveAttribute("aria-expanded", "false");
      expect(parts.contentByText("Content 1")).toHaveAttribute("hidden");
      expect(parts.contentByText("Content 2")).not.toHaveAttribute("hidden");
    });
  });

  describe(`${name} — controlled`, () => {
    it("calls onValueChange but UI does not change unless value prop changes", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();

      render(renderAccordion({ type: "single", value: null, onValueChange }));

      await user.click(parts.trigger("Section 1"));

      expect(onValueChange).toHaveBeenCalledWith("item-1");
      expect(parts.contentByText("Content 1")).toHaveAttribute("hidden");
    });

    it("controlled harness updates UI when state updates", async () => {
      const user = userEvent.setup();

      function Harness() {
        const [value, setValue] = React.useState<string | null>(null);
        return renderAccordion({
          type: "single",
          value,
          onValueChange: (next) => setValue(next as string | null),
        });
      }

      render(<Harness />);

      await user.click(parts.trigger("Section 1"));
      expect(parts.contentByText("Content 1")).not.toHaveAttribute("hidden");
    });
  });

  describe(`${name} — disabled`, () => {
    it("Accordion disabled prevents interaction", async () => {
      const user = userEvent.setup();
      render(renderAccordion({ type: "single", disabled: true }));

      const t1 = parts.trigger("Section 1");
      expect(t1).toBeDisabled();

      await user.click(t1);
      expect(parts.contentByText("Content 1")).toHaveAttribute("hidden");
    });
  });

  describe(`${name} — ARIA wiring`, () => {
    it("aria-controls matches content id; content uses aria-hidden + hidden", async () => {
      const user = userEvent.setup();
      render(renderAccordion({ type: "single" }));

      const t1 = parts.trigger("Section 1");
      const controls = t1.getAttribute("aria-controls");
      expect(controls).toBeTruthy();

      const c1 = parts.contentByText("Content 1");
      expect(c1).toHaveAttribute("id", controls!);

      // closed
      expect(c1).toHaveAttribute("aria-hidden", "true");
      expect(c1).toHaveAttribute("hidden");

      await user.click(t1);

      // open
      expect(c1).toHaveAttribute("aria-hidden", "false");
      expect(c1).not.toHaveAttribute("hidden");
    });
  });
}

/**
 * Separate contract for per-item disabled and asChild wiring,
 * because the render differs from the basic accordion.
 */
function getAccordionRootFor(el: HTMLElement): HTMLElement {
  const root = el.closest("[data-accordion]") as HTMLElement | null;
  expect(root).toBeTruthy();
  return root!;
}

export function runAccordionItemAndAsChildContract(
  name: string,
  renderTree: () => React.ReactElement
) {
  describe(`${name} — AccordionItem disabled`, () => {
    it("disables only that item's trigger", async () => {
      const user = userEvent.setup();
      render(renderTree());

      const t1 = screen.getByRole("button", { name: "Section 1" }) as HTMLButtonElement;
      const t2 = screen.getByRole("button", { name: "Section 2" }) as HTMLButtonElement;

      // Scope to the accordion that contains Section 1/2 (the first accordion in renderTree)
      const root = getAccordionRootFor(t1);
      const q = within(root);

      expect(t1).toBeDisabled();
      expect(t2).not.toBeDisabled();

      await user.click(t1);
      // content 1 should still be hidden
      const c1 = q.getByText("Content 1").closest("div") as HTMLElement;
      expect(c1).toHaveAttribute("hidden");

      await user.click(t2);
      const c2 = q.getByText("Content 2").closest("div") as HTMLElement;
      expect(c2).not.toHaveAttribute("hidden");
    });
  });

  describe(`${name} — asChild behavior`, () => {
    it("AccordionTrigger asChild applies props to child element", async () => {
      const user = userEvent.setup();
      render(renderTree());

      const child = screen.getByTestId("child-trigger") as HTMLButtonElement;
      const root = getAccordionRootFor(child);
      const q = within(root);

      expect(child).toHaveAttribute("type", "button");
      expect(child).toHaveAttribute("aria-expanded", "false");

      await user.click(child);

      expect(child).toHaveAttribute("aria-expanded", "true");

      // Content 1 assertion scoped to this accordion instance only
      const c1 = q.getByText("Content 1").closest("div") as HTMLElement;
      expect(c1).not.toHaveAttribute("hidden");
    });

    it("AccordionContent asChild applies content props to child element", async () => {
      const user = userEvent.setup();
      render(renderTree());

      const trigger = screen.getByRole("button", { name: "Open" }) as HTMLButtonElement;
      const root = getAccordionRootFor(trigger);
      const q = within(root);

      const childContent = q.getByTestId("child-content") as HTMLElement;

      expect(childContent).toHaveAttribute("aria-hidden", "true");
      expect(childContent).toHaveAttribute("hidden");

      await user.click(trigger);

      expect(childContent).toHaveAttribute("aria-hidden", "false");
      expect(childContent).not.toHaveAttribute("hidden");
    });
  });
}