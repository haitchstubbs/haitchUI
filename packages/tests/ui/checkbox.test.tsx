import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

import { Checkbox } from "@haitch/ui";
// If ShadowRootHost is also exported from your library use that import.
// Otherwise import from wherever it lives in your repo.
import { ShadowRootHost } from "@haitch/ui";

function getParts() {
  const input = screen.getByRole("checkbox", { name: /accept terms/i }) as HTMLInputElement;
  const visual = document.querySelector('[data-slot="checkbox"]') as HTMLButtonElement | null;
  const root = document.querySelector('[data-slot="checkbox-root"]') as HTMLElement | null;

  expect(input).toBeTruthy();
  expect(root).toBeTruthy();
  expect(visual).toBeTruthy();

  return { input, visual: visual!, root: root! };
}

function expectVisualState(visual: HTMLElement, checked: boolean) {
  expect(visual).toHaveAttribute("data-state", checked ? "checked" : "unchecked");
}

describe("Checkbox (haitch) — DOM + a11y parity with native checkbox behavior", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("renders an accessible native checkbox input (role=checkbox) and a separate visual button surface", () => {
    render(<Checkbox aria-label="Accept Terms" />);

    const { input, visual, root } = getParts();

    // Input is the accessible control
    expect(input.tagName.toLowerCase()).toBe("input");
    expect(input.type).toBe("checkbox");
    expect(input).toHaveClass("peer");
    expect(input).toHaveClass("sr-only");

    // Visual surface exists and is NOT the accessible node
    expect(visual.tagName.toLowerCase()).toBe("button");
    expect(visual).toHaveAttribute("aria-hidden", "true");
    expect(visual).toHaveAttribute("tabindex", "-1");

    // Root wrapper exists
    expect(root).toHaveAttribute("data-slot", "checkbox-root");
  });

  it("starts unchecked by default and visual reflects that", () => {
    render(<Checkbox aria-label="Accept Terms" />);

    const { input, visual } = getParts();
    expect(input).not.toBeChecked();
    expectVisualState(visual, false);
  });

  it("respects defaultChecked (uncontrolled initial state)", () => {
    render(<Checkbox aria-label="Accept Terms" defaultChecked />);

    const { input, visual } = getParts();
    expect(input).toBeChecked();
    expectVisualState(visual, true);
  });

  it("toggles when clicking the visual button (uncontrolled)", async () => {
    const user = userEvent.setup();
    render(<Checkbox aria-label="Accept Terms" />);

    const { input, visual } = getParts();

    await user.click(visual);
    expect(input).toBeChecked();
    expectVisualState(visual, true);

    await user.click(visual);
    expect(input).not.toBeChecked();
    expectVisualState(visual, false);
  });

  it("toggles when clicking the input directly (uncontrolled)", async () => {
    const user = userEvent.setup();
    render(<Checkbox aria-label="Accept Terms" />);

    const { input, visual } = getParts();

    await user.click(input);
    expect(input).toBeChecked();
    expectVisualState(visual, true);

    await user.click(input);
    expect(input).not.toBeChecked();
    expectVisualState(visual, false);
  });

  it("toggles when clicking a label using htmlFor=id", async () => {
    const user = userEvent.setup();

    render(
      <div>
        <label htmlFor="cb">Accept Terms</label>
        <Checkbox id="cb" aria-label="Accept Terms" />
      </div>
    );

    const input = screen.getByRole("checkbox", { name: /accept terms/i }) as HTMLInputElement;
    const visual = document.querySelector('[data-slot="checkbox"]') as HTMLButtonElement;
    const label = screen.getByText(/accept terms/i);

    await user.click(label);
    expect(input).toBeChecked();
    expectVisualState(visual, true);

    await user.click(label);
    expect(input).not.toBeChecked();
    expectVisualState(visual, false);
  });

  it("does NOT double-toggle from a single label click (wrapping label)", async () => {
    const user = userEvent.setup();

    render(
      <label className="flex items-center gap-2">
        <Checkbox aria-label="Accept Terms" />
        <span>Accept Terms</span>
      </label>
    );

    const { input } = getParts();
    const label = screen.getByText(/accept terms/i);

    await user.click(label);
    expect(input).toBeChecked(); // if it double-toggled, it would end unchecked
  });

  it("keyboard parity: Space toggles when input is focused", async () => {
    const user = userEvent.setup();
    render(<Checkbox aria-label="Accept Terms" />);

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

  it("does not toggle when disabled (input click, visual click, label click)", async () => {
    const user = userEvent.setup();

    render(
      <div>
        <label htmlFor="cb">Accept Terms</label>
        <Checkbox id="cb" aria-label="Accept Terms" disabled />
      </div>
    );

    const input = screen.getByRole("checkbox", { name: /accept terms/i }) as HTMLInputElement;
    const visual = document.querySelector('[data-slot="checkbox"]') as HTMLButtonElement;
    const label = screen.getByText(/accept terms/i);

    expect(input).toBeDisabled();
    expect(visual).toBeDisabled();

    await user.click(input);
    expect(input).not.toBeChecked();

    await user.click(visual);
    expect(input).not.toBeChecked();

    await user.click(label);
    expect(input).not.toBeChecked();
  });

  it("controlled: visual/input clicks call onCheckedChange with next value but DOM checked does not change unless parent updates", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    render(<Checkbox aria-label="Accept Terms" checked={false} onCheckedChange={onCheckedChange} />);

    const { input, visual } = getParts();
    expect(input).not.toBeChecked();
    expectVisualState(visual, false);

    await user.click(visual);
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(input).not.toBeChecked();
    expectVisualState(visual, false);

    await user.click(input);
    expect(onCheckedChange).toHaveBeenCalledTimes(2);
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    expect(input).not.toBeChecked();
    expectVisualState(visual, false);
  });

  it("controlled: parent can update and visual/input reflect new checked", async () => {
    const user = userEvent.setup();

    function Harness() {
      const [checked, setChecked] = React.useState(false);
      return (
        <div>
          <Checkbox aria-label="Accept Terms" checked={checked} onCheckedChange={setChecked} />
          <div data-testid="state">{checked ? "yes" : "no"}</div>
        </div>
      );
    }

    render(<Harness />);
    const { input, visual } = getParts();
    const state = screen.getByTestId("state");

    expect(state).toHaveTextContent("no");
    expect(input).not.toBeChecked();
    expectVisualState(visual, false);

    await user.click(visual);
    expect(state).toHaveTextContent("yes");
    expect(input).toBeChecked();
    expectVisualState(visual, true);

    await user.click(visual);
    expect(state).toHaveTextContent("no");
    expect(input).not.toBeChecked();
    expectVisualState(visual, false);
  });

  it("fires onCheckedChange exactly once per user click on visual (no double events)", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    render(<Checkbox aria-label="Accept Terms" onCheckedChange={onCheckedChange} />);

    const { visual } = getParts();
    await user.click(visual);

    expect(onCheckedChange).toHaveBeenCalledTimes(1);
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
  });

  it("button onClick runs and can prevent toggling by calling event.preventDefault()", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault());

    render(<Checkbox aria-label="Accept Terms" onClick={onClick} />);

    const { input, visual } = getParts();

    await user.click(visual);
    expect(onClick).toHaveBeenCalledTimes(1);

    // because consumer prevented default, component should not toggle
    expect(input).not.toBeChecked();
    expectVisualState(visual, false);
  });

  it("prop passthrough: name/value appear in FormData only when checked (defaults value to 'on' if not provided)", async () => {
    const user = userEvent.setup();

    const onSubmit = vi.fn((e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      expect(fd.get("cb")).toBe("on");
    });

    render(
      <form onSubmit={onSubmit}>
        <Checkbox id="cb" name="cb" aria-label="Accept Terms" defaultChecked />
        <button type="submit">Submit</button>
      </form>
    );

    await user.click(screen.getByRole("button", { name: /submit/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("prop passthrough: custom value is used in FormData when checked", async () => {
    const user = userEvent.setup();

    const onSubmit = vi.fn((e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      expect(fd.get("cb")).toBe("yes");
    });

    render(
      <form onSubmit={onSubmit}>
        <Checkbox id="cb" name="cb" value="yes" aria-label="Accept Terms" defaultChecked />
        <button type="submit">Submit</button>
      </form>
    );

    await user.click(screen.getByRole("button", { name: /submit/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("prop passthrough: unchecked checkbox does not appear in FormData", async () => {
    const user = userEvent.setup();

    const onSubmit = vi.fn((e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      expect(fd.has("cb")).toBe(false);
    });

    render(
      <form onSubmit={onSubmit}>
        <Checkbox id="cb" name="cb" aria-label="Accept Terms" />
        <button type="submit">Submit</button>
      </form>
    );

    await user.click(screen.getByRole("button", { name: /submit/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("supports form attribute: checkbox can live outside the form and still submit", async () => {
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

        <Checkbox form="the-form" name="cb" aria-label="Accept Terms" defaultChecked />
      </div>
    );

    await user.click(screen.getByRole("button", { name: /submit/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("required behaves like native (form will be invalid when unchecked)", async () => {
    // JSDOM doesn't fully block submit, but checkValidity/reportValidity exist.
    render(
      <form>
        <Checkbox id="cb" name="cb" aria-label="Accept Terms" required />
        <button type="submit">Submit</button>
      </form>
    );

    const form = screen.getByRole("button", { name: /submit/i }).closest("form") as HTMLFormElement;
    expect(form).toBeTruthy();

    // Unchecked required checkbox => invalid
    expect(form.checkValidity()).toBe(false);

    // Now check it and validity should pass
    const input = screen.getByRole("checkbox", { name: /accept terms/i }) as HTMLInputElement;
    input.click();
    expect(form.checkValidity()).toBe(true);
  });

  it("autoFocus focuses the input (not the button)", () => {
    render(<Checkbox aria-label="Accept Terms" autoFocus />);
    const { input, visual } = getParts();
    expect(input).toHaveFocus();
    expect(visual).not.toHaveFocus();
  });

  it("forwards arbitrary button props onto the visual button (e.g. data attrs)", () => {
    render(<Checkbox aria-label="Accept Terms" data-foo="bar" />);
    const { visual } = getParts();
    expect(visual).toHaveAttribute("data-foo", "bar");
  });

  it("does not leak button into accessibility tree (only one role=checkbox element)", () => {
    render(<Checkbox aria-label="Accept Terms" />);
    const checkboxes = screen.getAllByRole("checkbox", { name: /accept terms/i });
    expect(checkboxes).toHaveLength(1);
  });

  it("multiple checkboxes operate independently", async () => {
    const user = userEvent.setup();

    render(
      <div>
        <Checkbox aria-label="Accept Terms" />
        <Checkbox aria-label="Accept Terms 2" />
      </div>
    );

    const a = screen.getByRole("checkbox", { name: /accept terms$/i }) as HTMLInputElement;
    const b = screen.getByRole("checkbox", { name: /accept terms 2/i }) as HTMLInputElement;

    expect(a).not.toBeChecked();
    expect(b).not.toBeChecked();

    await user.click(a);
    expect(a).toBeChecked();
    expect(b).not.toBeChecked();

    await user.click(b);
    expect(a).toBeChecked();
    expect(b).toBeChecked();
  });

  it("id + htmlFor pairing works even when checkbox is visually hidden (label targets input)", async () => {
    const user = userEvent.setup();

    render(
      <div>
        <label htmlFor="cb">Accept Terms</label>
        <Checkbox id="cb" aria-label="Accept Terms" />
      </div>
    );

    const input = screen.getByRole("checkbox", { name: /accept terms/i }) as HTMLInputElement;
    expect(input.id).toBe("cb");

    await user.click(screen.getByText(/accept terms/i));
    expect(input).toBeChecked();
  });
});

describe("Checkbox — Shadow DOM compatibility", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("works inside a shadow root: label wrapping toggles input and visual updates", async () => {
    const user = userEvent.setup();

    render(
      <ShadowRootHost cssText={""}>
        <label className="flex items-center gap-2">
          <Checkbox aria-label="Accept Terms" />
          <span>Accept Terms</span>
        </label>
      </ShadowRootHost>
    );

    // Querying: Testing Library won't automatically pierce shadow roots via screen.*
    // So we locate the host and use its shadowRoot.
    const host = document.body.firstElementChild as HTMLElement;
    expect(host).toBeTruthy();

    const shadow = (host as any).shadowRoot as ShadowRoot | null;
    expect(shadow).toBeTruthy();

    const input = shadow!.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
    const visual = shadow!.querySelector('[data-slot="checkbox"]') as HTMLButtonElement | null;
    const labelText = shadow!.querySelector("span") as HTMLSpanElement | null;

    expect(input).toBeTruthy();
    expect(visual).toBeTruthy();
    expect(labelText).toBeTruthy();

    expect(input!).not.toBeChecked();
    expect(visual!).toHaveAttribute("data-state", "unchecked");

    await user.click(labelText!);
    expect(input!).toBeChecked();
    expect(visual!).toHaveAttribute("data-state", "checked");
  });

  it("works inside a shadow root: htmlFor + id works when label and input share the same shadow root", async () => {
    const user = userEvent.setup();

    render(
      <ShadowRootHost>
        <div>
          <label htmlFor="cb">Accept Terms</label>
          <Checkbox id="cb" aria-label="Accept Terms" />
        </div>
      </ShadowRootHost>
    );

    const host = document.body.firstElementChild as HTMLElement;
    const shadow = (host as any).shadowRoot as ShadowRoot;

    const label = shadow.querySelector('label[for="cb"]') as HTMLLabelElement;
    const input = shadow.querySelector('input#cb[type="checkbox"]') as HTMLInputElement;
    const visual = shadow.querySelector('[data-slot="checkbox"]') as HTMLButtonElement;

    expect(label).toBeTruthy();
    expect(input).toBeTruthy();
    expect(visual).toBeTruthy();

    await user.click(label);
    expect(input).toBeChecked();
    expect(visual).toHaveAttribute("data-state", "checked");
  });

  it("does not crash when ShadowRootHost injects styles (inheritDocumentStyles + cssText)", () => {
    render(
      <ShadowRootHost inheritDocumentStyles cssText={":host { display:block; }"}>
        <Checkbox aria-label="Accept Terms" />
      </ShadowRootHost>
    );

    const host = document.body.firstElementChild as HTMLElement;
    const shadow = (host as any).shadowRoot as ShadowRoot;

    // Ensure owned styles are injected
    const owned = shadow.querySelectorAll("[data-shadow-owned='true']");
    expect(owned.length).toBeGreaterThanOrEqual(1);

    // Ensure checkbox is present
    const input = shadow.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(input).toBeTruthy();
  });
});
