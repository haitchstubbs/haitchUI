import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, vi } from "vitest";

type RenderAsChild = (args: {
  className?: string;
  style?: React.CSSProperties;

  // slot-level handlers/props
  onClick?: React.MouseEventHandler;
  "data-x"?: string;
  "aria-label"?: string;
  ref?: React.Ref<HTMLElement>;

  // child-level hooks so the contract can prove composition order
  childOnClick?: React.MouseEventHandler;
  childRef?: React.Ref<HTMLElement>;
}) => React.ReactElement;

export function runSlotContract(
  name: string,
  renderAsChild: RenderAsChild,
  opts?: { role?: "link" | "button"; label?: RegExp }
) {
  const role = opts?.role ?? "link";
  const label = opts?.label ?? /button/i;

  describe(`${name} — Slot/asChild contract`, () => {
    it("merges className (child first, then slot)", () => {
      render(renderAsChild({ className: "slot-class" }));

      const el = screen.getByRole(role, { name: label });
      expect(el).toHaveClass("child-class");
      expect(el).toHaveClass("slot-class");

      const classAttr = el.getAttribute("class") ?? "";
      expect(classAttr).toMatch(/child-class.*slot-class/);
    });

    it("merges style with slot overriding child keys", () => {
      render(renderAsChild({ style: { opacity: 0.5, paddingLeft: "24px" } }));

      const el = screen.getByRole(role, { name: label }) as HTMLElement;
      expect(el).toHaveStyle({ opacity: "0.5" });
      expect(el).toHaveStyle({ paddingLeft: "24px" });
    });

    it("composes onClick (child first, then slot)", async () => {
      const user = userEvent.setup();
      const calls: string[] = [];

      const childClick = vi.fn(() => calls.push("child"));
      const slotClick = vi.fn(() => calls.push("slot"));

      render(
        renderAsChild({
          childOnClick: childClick,
          onClick: slotClick,
        })
      );

      const el = screen.getByRole(role, { name: label });
      await user.click(el);

      expect(childClick).toHaveBeenCalledTimes(1);
      expect(slotClick).toHaveBeenCalledTimes(1);
      expect(calls).toEqual(["child", "slot"]);
    });

    it("passes through arbitrary props (data-* and aria-*)", () => {
      render(
        renderAsChild({
          "data-x": "123",
          "aria-label": "Button",
        })
      );

      const el = screen.getByRole(role, { name: /button/i });
      expect(el).toHaveAttribute("data-x", "123");
      expect(el).toHaveAttribute("aria-label", "Button");
    });

    it("composes refs (child ref + forwarded ref both receive the node)", () => {
      const childRef = React.createRef<HTMLElement>();
      const slotRef = React.createRef<HTMLElement>();

      render(renderAsChild({ ref: slotRef, childRef }));

      expect(childRef.current).toBeTruthy();
      expect(slotRef.current).toBeTruthy();
      expect(childRef.current).toBe(slotRef.current);
    });
  });
}
