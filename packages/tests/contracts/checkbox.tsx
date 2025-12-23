import * as React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, vi } from "vitest";

type Parts = {
  input: HTMLInputElement;
  visual: HTMLButtonElement;
  root: HTMLElement;
};

export type CheckboxContractRender = (props?: {
  id?: string;
  disabled?: boolean;
  defaultChecked?: boolean;
  checked?: boolean;
  onCheckedChange?: (v: boolean) => void;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  name?: string;
  value?: string;
  form?: string;
  required?: boolean;
  autoFocus?: boolean;
  "aria-label"?: string;
  // passthrough to visual button
  "data-foo"?: string;
}) => React.ReactElement;

export type CheckboxContractGetParts = () => Parts;

function expectVisualState(visual: HTMLElement, checked: boolean) {
  expect(visual).toHaveAttribute("data-state", checked ? "checked" : "unchecked");
}

export function runCheckboxDomContract(
  name: string,
  renderCheckbox: CheckboxContractRender,
  getParts: CheckboxContractGetParts
) {
  describe(`${name} — DOM + a11y structure`, () => {
    it("renders an accessible native input + separate visual button surface", () => {
      render(renderCheckbox({ "aria-label": "Accept Terms" }));

      const { input, visual, root } = getParts();

      // input semantics
      expect(input.tagName.toLowerCase()).toBe("input");
      expect(input.type).toBe("checkbox");
      expect(input).toHaveClass("peer");
      expect(input).toHaveClass("sr-only");

      // visual is not in a11y tree
      expect(visual.tagName.toLowerCase()).toBe("button");
      expect(visual).toHaveAttribute("aria-hidden", "true");
      expect(visual).toHaveAttribute("tabindex", "-1");

      // root wrapper
      expect(root).toHaveAttribute("data-slot", "checkbox-root");

      // only one accessible checkbox
      expect(screen.getAllByRole("checkbox", { name: /accept terms/i })).toHaveLength(1);
    });

    it("forwards arbitrary button props onto the visual button", () => {
      render(renderCheckbox({ "aria-label": "Accept Terms", "data-foo": "bar" }));
      const { visual } = getParts();
      expect(visual).toHaveAttribute("data-foo", "bar");
    });

    it("autoFocus focuses the input (not the visual button)", () => {
      render(renderCheckbox({ "aria-label": "Accept Terms", autoFocus: true }));
      const { input, visual } = getParts();
      expect(input).toHaveFocus();
      expect(visual).not.toHaveFocus();
    });
  });
}

export function runCheckboxInteractionParityContract(
  name: string,
  renderCheckbox: CheckboxContractRender,
  getParts: CheckboxContractGetParts
) {
  describe(`${name} — interaction parity`, () => {
    it("starts unchecked; visual reflects", () => {
      render(renderCheckbox({ "aria-label": "Accept Terms" }));
      const { input, visual } = getParts();
      expect(input).not.toBeChecked();
      expectVisualState(visual, false);
    });

    it("respects defaultChecked (uncontrolled initial)", () => {
      render(renderCheckbox({ "aria-label": "Accept Terms", defaultChecked: true }));
      const { input, visual } = getParts();
      expect(input).toBeChecked();
      expectVisualState(visual, true);
    });

    it("toggles via visual click (uncontrolled)", async () => {
      const user = userEvent.setup();
      render(renderCheckbox({ "aria-label": "Accept Terms" }));
      const { input, visual } = getParts();

      await user.click(visual);
      expect(input).toBeChecked();
      expectVisualState(visual, true);

      await user.click(visual);
      expect(input).not.toBeChecked();
      expectVisualState(visual, false);
    });

    it("toggles via input click (uncontrolled)", async () => {
      const user = userEvent.setup();
      render(renderCheckbox({ "aria-label": "Accept Terms" }));
      const { input, visual } = getParts();

      await user.click(input);
      expect(input).toBeChecked();
      expectVisualState(visual, true);

      await user.click(input);
      expect(input).not.toBeChecked();
      expectVisualState(visual, false);
    });

    it("keyboard parity: Space toggles when input focused", async () => {
      const user = userEvent.setup();
      render(renderCheckbox({ "aria-label": "Accept Terms" }));
      const { input, visual } = getParts();

      input.focus();
      expect(input).toHaveFocus();

      await user.keyboard("[Space]");
      expect(input).toBeChecked();
      expectVisualState(visual, true);

      await user.keyboard("[Space]");
      expect(input).not.toBeChecked();
      expectVisualState(visual, false);
    });

    it("does not toggle when disabled (input + visual)", async () => {
      const user = userEvent.setup();
      render(renderCheckbox({ "aria-label": "Accept Terms", disabled: true }));
      const { input, visual } = getParts();

      expect(input).toBeDisabled();
      expect(visual).toBeDisabled();

      await user.click(input);
      expect(input).not.toBeChecked();

      await user.click(visual);
      expect(input).not.toBeChecked();
    });

    it("button onClick can prevent toggling via preventDefault()", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn((e: any) => e.preventDefault());

      render(renderCheckbox({ "aria-label": "Accept Terms", onClick }));
      const { input, visual } = getParts();

      await user.click(visual);
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(input).not.toBeChecked();
      expectVisualState(visual, false);
    });
  });
}

export function runCheckboxControlledContract(
  name: string,
  renderCheckbox: CheckboxContractRender,
  getParts: CheckboxContractGetParts
) {
  describe(`${name} — controlled vs uncontrolled`, () => {
    it("controlled: clicks call onCheckedChange but DOM does not change unless parent updates", async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();

      render(
        renderCheckbox({
          "aria-label": "Accept Terms",
          checked: false,
          onCheckedChange,
        })
      );

      const { input, visual } = getParts();
      expect(input).not.toBeChecked();
      expectVisualState(visual, false);

      await user.click(visual);
      expect(onCheckedChange).toHaveBeenCalledWith(true);
      expect(input).not.toBeChecked();
      expectVisualState(visual, false);
    });

    it("controlled: parent update reflects in input + visual", async () => {
      const user = userEvent.setup();

      function Harness() {
        const [checked, setChecked] = React.useState(false);
        return (
          <div>
            {renderCheckbox({
              "aria-label": "Accept Terms",
              checked,
              onCheckedChange: setChecked,
            })}
            <div data-testid="state">{checked ? "yes" : "no"}</div>
          </div>
        );
      }

      render(<Harness />);

      const { input, visual } = getParts();
      expect(screen.getByTestId("state")).toHaveTextContent("no");

      await user.click(visual);
      expect(screen.getByTestId("state")).toHaveTextContent("yes");
      expect(input).toBeChecked();
      expectVisualState(visual, true);
    });

    it("fires onCheckedChange exactly once per visual click", async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();

      render(renderCheckbox({ "aria-label": "Accept Terms", onCheckedChange }));
      const { visual } = getParts();

      await user.click(visual);
      expect(onCheckedChange).toHaveBeenCalledTimes(1);
      expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    });
  });
}

export function runCheckboxFormContract(
  name: string,
  renderCheckbox: CheckboxContractRender
) {
  describe(`${name} — form behavior`, () => {
    it("appears in FormData only when checked (defaults value to 'on')", async () => {
      const user = userEvent.setup();

      const onSubmit = vi.fn((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        expect(fd.get("cb")).toBe("on");
      });

      render(
        <form onSubmit={onSubmit}>
          {renderCheckbox({
            id: "cb",
            name: "cb",
            "aria-label": "Accept Terms",
            defaultChecked: true,
          })}
          <button type="submit">Submit</button>
        </form>
      );

      await user.click(screen.getByRole("button", { name: /submit/i }));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it("custom value is used in FormData when checked", async () => {
      const user = userEvent.setup();

      const onSubmit = vi.fn((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        expect(fd.get("cb")).toBe("yes");
      });

      render(
        <form onSubmit={onSubmit}>
          {renderCheckbox({
            id: "cb",
            name: "cb",
            value: "yes",
            "aria-label": "Accept Terms",
            defaultChecked: true,
          })}
          <button type="submit">Submit</button>
        </form>
      );

      await user.click(screen.getByRole("button", { name: /submit/i }));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it("unchecked checkbox does not appear in FormData", async () => {
      const user = userEvent.setup();

      const onSubmit = vi.fn((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        expect(fd.has("cb")).toBe(false);
      });

      render(
        <form onSubmit={onSubmit}>
          {renderCheckbox({
            id: "cb",
            name: "cb",
            "aria-label": "Accept Terms",
          })}
          <button type="submit">Submit</button>
        </form>
      );

      await user.click(screen.getByRole("button", { name: /submit/i }));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it("supports form attribute (control outside form still submits)", async () => {
      const user = userEvent.setup();

      const onSubmit = vi.fn((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        expect(fd.get("cb")).toBe("on");
      });

      render(
        <div>
          <form id="the-form" onSubmit={onSubmit}>
            <button type="submit">Submit</button>
          </form>

          {renderCheckbox({
            form: "the-form",
            name: "cb",
            "aria-label": "Accept Terms",
            defaultChecked: true,
          })}
        </div>
      );

      await user.click(screen.getByRole("button", { name: /submit/i }));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it("required behaves like native (checkValidity false when unchecked)", async () => {
      render(
        <form>
          {renderCheckbox({
            id: "cb",
            name: "cb",
            "aria-label": "Accept Terms",
            required: true,
          })}
          <button type="submit">Submit</button>
        </form>
      );

      const form = screen.getByRole("button", { name: /submit/i }).closest("form") as HTMLFormElement;
      expect(form.checkValidity()).toBe(false);

      // Use user-event (avoids act warnings vs raw input.click())
      const user = userEvent.setup();
      await user.click(screen.getByRole("checkbox", { name: /accept terms/i }));
      expect(form.checkValidity()).toBe(true);
    });
  });
}

export function runCheckboxLabelContract(
  name: string,
  renderCheckbox: CheckboxContractRender,
  getParts: CheckboxContractGetParts
) {
  describe(`${name} — label association`, () => {
    it("label htmlFor/id toggles via label text click (uncontrolled)", async () => {
      const user = userEvent.setup();

      render(
        <div>
          <label htmlFor="cb">Accept Terms</label>
          {renderCheckbox({ id: "cb" })}
        </div>
      );

      const input = screen.getByRole("checkbox", { name: /accept terms/i }) as HTMLInputElement;
      expect(input).not.toBeChecked();

      await user.click(screen.getByText(/accept terms/i));
      expect(input).toBeChecked();
    });

    it("wrapping <label> toggles via label text click (uncontrolled)", async () => {
      const user = userEvent.setup();

      render(
        <label>
          <span>Accept Terms</span>
          {renderCheckbox({})}
        </label>
      );

      const input = screen.getByRole("checkbox", { name: /accept terms/i }) as HTMLInputElement;
      expect(input).not.toBeChecked();

      await user.click(screen.getByText(/accept terms/i));
      expect(input).toBeChecked();
    });

    it("does not double-toggle when clicking the visual surface inside a wrapping label (uncontrolled)", async () => {
      const user = userEvent.setup();

      render(
        <label>
          <span>Accept Terms</span>
          {renderCheckbox({})}
        </label>
      );

      const { input, visual } = getParts();
      expect(input).not.toBeChecked();
      expect(visual).toHaveAttribute("data-state", "unchecked");

      // should toggle exactly once
      await user.click(visual);
      expect(input).toBeChecked();
      expect(visual).toHaveAttribute("data-state", "checked");

      await user.click(visual);
      expect(input).not.toBeChecked();
      expect(visual).toHaveAttribute("data-state", "unchecked");
    });

    it("clicking the input inside a wrapping label toggles exactly once (uncontrolled)", async () => {
      const user = userEvent.setup();

      render(
        <label>
          <span>Accept Terms</span>
          {renderCheckbox({})}
        </label>
      );

      const input = screen.getByRole("checkbox", { name: /accept terms/i }) as HTMLInputElement;
      expect(input).not.toBeChecked();

      await user.click(input);
      expect(input).toBeChecked();

      await user.click(input);
      expect(input).not.toBeChecked();
    });
  });
}

export function runCheckboxControlledClickContract(
  name: string,
  renderCheckbox: CheckboxContractRender,
  getParts: CheckboxContractGetParts
) {
  describe(`${name} — controlled click semantics`, () => {
    it("controlled: clicking visual calls onCheckedChange and does NOT change DOM checked without parent update", async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();

      render(
        renderCheckbox({
          checked: false,
          onCheckedChange,
          "aria-label": "Accept Terms",
        })
      );

      const { input, visual } = getParts();
      expect(input).not.toBeChecked();
      expect(visual).toHaveAttribute("data-state", "unchecked");

      await user.click(visual);

      expect(onCheckedChange).toHaveBeenCalledTimes(1);
      expect(onCheckedChange).toHaveBeenCalledWith(true);

      // Since parent didn't update `checked`, DOM remains false
      expect(input).not.toBeChecked();
      expect(visual).toHaveAttribute("data-state", "unchecked");
    });

    it("controlled: clicking the INPUT calls onCheckedChange and input remains synced to prop", async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();

      render(
        renderCheckbox({
          checked: false,
          onCheckedChange,
          "aria-label": "Accept Terms",
        })
      );

      const { input } = getParts();
      expect(input).not.toBeChecked();

      await user.click(input);

      expect(onCheckedChange).toHaveBeenCalledTimes(1);
      expect(onCheckedChange).toHaveBeenCalledWith(true);

      // still controlled false without parent update
      expect(input).not.toBeChecked();
    });
  });
}

export function runCheckboxA11yTreeContract(
  name: string,
  renderCheckbox: CheckboxContractRender,
  getParts: CheckboxContractGetParts
) {
  describe(`${name} — a11y tree contract`, () => {
    it("exposes exactly one accessible checkbox and the visual button is not discoverable by role", () => {
      render(renderCheckbox({ "aria-label": "Accept Terms" }));

      const { input, visual } = getParts();

      // Visible surface is explicitly removed from the a11y tree
      expect(visual).toHaveAttribute("aria-hidden", "true");
      expect(visual).toHaveAttribute("tabindex", "-1");

      // Only the input should be discoverable as a checkbox
      const checkboxes = screen.getAllByRole("checkbox", { name: /accept terms/i });
      expect(checkboxes).toHaveLength(1);
      expect(checkboxes[0]).toBe(input);

      // The visual button should NOT be discoverable as a button (even though it's a <button>)
      expect(screen.queryByRole("button", { name: /accept terms/i })).toBeNull();

      // And there should be no other focusable/button-ish controls introduced by this component alone.
      // (If you render this in a form with a submit button, this assertion should be in the component-only render.)
      const allButtons = screen.queryAllByRole("button");
      // We expect 0 here because the visual is aria-hidden and has no accessible name,
      // and there are no other buttons in this render.
      expect(allButtons).toHaveLength(0);
    });

    it("visual button remains undiscoverable even when it contains an icon", () => {
      render(renderCheckbox({ "aria-label": "Accept Terms", defaultChecked: true }));

      // If the icon ever adds text / title / aria-label accidentally, this catches it.
      expect(screen.getAllByRole("checkbox", { name: /accept terms/i })).toHaveLength(1);
      expect(screen.queryByRole("button")).toBeNull();
    });
  });
}