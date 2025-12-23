import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, vi } from "vitest";
import { expectNoA11yViolations } from "../lib/a11y";

type Role = "button" | "link";

type BaseProps = {
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
};

type Variant = {
  /** A human-friendly label for test output */
  label: string;
  /** Render function for this variant */
  render: (props: BaseProps) => React.ReactElement;
  /** Expected ARIA role */
  role: Role;
  /** Accessible name matcher (defaults to /button/i) */
  name?: RegExp;
  /**
   * Whether keyboard activation is expected (Enter/Space).
   * Links should generally NOT be tested for Space-to-click like buttons.
   */
  keyboardActivates?: boolean;
  /**
   * How "disabled" should behave for this variant.
   * - "native": uses disabled attribute (button)
   * - "aria": uses aria-disabled=true (common for links)
   * - "none": no disabled concept
   */
  disabledMode?: "native" | "aria" | "none";
};

export function runButtonLikeContract(
  componentName: string,
  variants: Variant[],
  opts?: {
    /** Defaults to /button/i */
    defaultName?: RegExp;
    /** Run axe checks (default true) */
    a11y?: boolean;
  }
) {
  const defaultName = opts?.defaultName ?? /button/i;
  const runA11y = opts?.a11y ?? true;

  describe(`${componentName} — button-like contract`, () => {
    for (const v of variants) {
      const name = v.name ?? defaultName;
      const keyboardActivates = v.keyboardActivates ?? (v.role === "button");
      const disabledMode = v.disabledMode ?? (v.role === "button" ? "native" : "none");

      describe(v.label, () => {
        it(`is discoverable by role=${v.role} and accessible name`, async () => {
          const { container } = render(v.render({}));
          const el = screen.getByRole(v.role, { name });
          expect(el).toBeTruthy();

          if (runA11y) {
            await expectNoA11yViolations(container);
          }
        });

        it("activates via mouse click", async () => {
          const user = userEvent.setup();
          const onClick = vi.fn();

          render(v.render({ onClick }));
          const el = screen.getByRole(v.role, { name });

          await user.click(el);
          expect(onClick).toHaveBeenCalledTimes(1);
        });

        if (keyboardActivates) {
          it("activates via keyboard Enter and Space when focused", async () => {
            const user = userEvent.setup();
            const onClick = vi.fn();

            render(v.render({ onClick }));
            const el = screen.getByRole(v.role, { name }) as HTMLElement;

            el.focus();
            expect(el).toHaveFocus();

            await user.keyboard("{Enter}");
            await user.keyboard("[Space]");
            expect(onClick).toHaveBeenCalledTimes(2);
          });
        } else {
          it("does not require button-like keyboard activation semantics", async () => {
            // We *intentionally* skip Enter/Space activation tests for links by default.
            // Links have different keyboard expectations (Enter activates; Space scrolls).
            render(v.render({}));
            const el = screen.getByRole(v.role, { name }) as HTMLElement;
            el.focus();
            expect(el).toHaveFocus();
          });
        }

        if (disabledMode !== "none") {
          it("does not activate when disabled", async () => {
            const user = userEvent.setup();
            const onClick = vi.fn();

            render(v.render({ disabled: true, onClick }));
            const el = screen.getByRole(v.role, { name });

            // native: <button disabled> blocks click + focus
            // aria: aria-disabled should block your handler (consumer code / component logic)
            await user.click(el);
            expect(onClick).toHaveBeenCalledTimes(0);

            if (disabledMode === "native") {
              expect(el).toHaveAttribute("disabled");
            }

            if (disabledMode === "aria") {
              expect(el).toHaveAttribute("aria-disabled", "true");
            }
          });
        }
      });
    }
  });
}
