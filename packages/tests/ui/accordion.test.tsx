import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@haitch/ui";

// IMPORTANT: mock the Slot used by the accordion.
// This mock path must match the *import string inside the accordion file*.
// Your accordion imports Slot as: "../lib/slot"
// If your accordion file is "@ui/src/components/accordion", then "../lib/slot" resolves to "@ui/src/lib/slot".
vi.mock("@ui/src/lib/slot", () => {
  return {
    Slot: ({ children, ...props }: any) => {
      const child = React.Children.only(children);
      return React.cloneElement(child, {
        ...props,
        ...(child.props ?? {}),
        className: [props.className, child.props?.className].filter(Boolean).join(" "),
      });
    },
  };
});

function BasicAccordion(props?: Partial<React.ComponentProps<typeof Accordion>>) {
  return (
    <Accordion {...props}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Section 1</AccordionTrigger>
        <AccordionContent>Content 1</AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-2">
        <AccordionTrigger>Section 2</AccordionTrigger>
        <AccordionContent>Content 2</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

describe("Accordion (uncontrolled, single)", () => {
  it("renders container + items", () => {
    const { container } = render(<BasicAccordion />);
    expect(container.querySelector("[data-accordion]")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-accordion-item]").length).toBe(2);
  });

  it("defaultValue opens the matching item", () => {
    render(<BasicAccordion defaultValue="item-1" type="single" />);

    const content1 = screen.getByText("Content 1").closest("div")!;
    const content2 = screen.getByText("Content 2").closest("div")!;

    expect(content1).not.toHaveAttribute("hidden");
    expect(content1).toHaveAttribute("aria-hidden", "false");

    expect(content2).toHaveAttribute("hidden");
    expect(content2).toHaveAttribute("aria-hidden", "true");
  });

  it("clicking opens/closes in single mode", async () => {
    const user = userEvent.setup();
    render(<BasicAccordion type="single" />);

    const trigger1 = screen.getByRole("button", { name: "Section 1" });
    const content1 = screen.getByText("Content 1").closest("div")!;

    expect(trigger1).toHaveAttribute("aria-expanded", "false");
    expect(content1).toHaveAttribute("hidden");

    await user.click(trigger1);
    expect(trigger1).toHaveAttribute("aria-expanded", "true");
    expect(content1).not.toHaveAttribute("hidden");

    await user.click(trigger1);
    expect(trigger1).toHaveAttribute("aria-expanded", "false");
    expect(content1).toHaveAttribute("hidden");
  });

  it("opening item-2 closes item-1 in single mode", async () => {
    const user = userEvent.setup();
    render(<BasicAccordion type="single" defaultValue="item-1" />);

    const trigger1 = screen.getByRole("button", { name: "Section 1" });
    const trigger2 = screen.getByRole("button", { name: "Section 2" });
    const content1 = screen.getByText("Content 1").closest("div")!;
    const content2 = screen.getByText("Content 2").closest("div")!;

    expect(trigger1).toHaveAttribute("aria-expanded", "true");
    expect(content1).not.toHaveAttribute("hidden");

    await user.click(trigger2);

    expect(trigger2).toHaveAttribute("aria-expanded", "true");
    expect(content2).not.toHaveAttribute("hidden");

    expect(trigger1).toHaveAttribute("aria-expanded", "false");
    expect(content1).toHaveAttribute("hidden");
  });
});

describe("Accordion (uncontrolled, multiple)", () => {
  it("multiple mode allows multiple sections open", async () => {
    const user = userEvent.setup();
    render(<BasicAccordion type="multiple" defaultValue={[]} />);

    const trigger1 = screen.getByRole("button", { name: "Section 1" });
    const trigger2 = screen.getByRole("button", { name: "Section 2" });

    await user.click(trigger1);
    await user.click(trigger2);

    expect(trigger1).toHaveAttribute("aria-expanded", "true");
    expect(trigger2).toHaveAttribute("aria-expanded", "true");

    expect(screen.getByText("Content 1").closest("div")).not.toHaveAttribute("hidden");
    expect(screen.getByText("Content 2").closest("div")).not.toHaveAttribute("hidden");
  });

  it("multiple mode clicking an open item closes only that item", async () => {
    const user = userEvent.setup();
    render(<BasicAccordion type="multiple" defaultValue={["item-1", "item-2"]} />);

    const trigger1 = screen.getByRole("button", { name: "Section 1" });

    await user.click(trigger1);

    expect(trigger1).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("Content 1").closest("div")).toHaveAttribute("hidden");
    expect(screen.getByText("Content 2").closest("div")).not.toHaveAttribute("hidden");
  });
});

describe("Accordion (controlled)", () => {
  it("controlled mode calls onValueChange but doesn't change UI unless value prop changes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(<BasicAccordion type="single" value={null} onValueChange={onValueChange} />);

    await user.click(screen.getByRole("button", { name: "Section 1" }));

    expect(onValueChange).toHaveBeenCalledWith("item-1");
    // still closed because controlled value didn't update
    expect(screen.getByText("Content 1").closest("div")).toHaveAttribute("hidden");
  });

  it("controlled harness updates UI when state updates", async () => {
    const user = userEvent.setup();

    function ControlledHarness() {
      const [value, setValue] = React.useState<string | null>(null);
      return (
        <BasicAccordion
          type="single"
          value={value}
          onValueChange={(next) => setValue(next as string | null)}
        />
      );
    }

    render(<ControlledHarness />);

    await user.click(screen.getByRole("button", { name: "Section 1" }));
    expect(screen.getByText("Content 1").closest("div")).not.toHaveAttribute("hidden");
  });
});

describe("Disabled behavior", () => {
  it("Accordion disabled prevents interaction", async () => {
    const user = userEvent.setup();
    render(<BasicAccordion type="single" disabled />);

    const trigger1 = screen.getByRole("button", { name: "Section 1" });
    expect(trigger1).toBeDisabled();

    await user.click(trigger1);
    expect(screen.getByText("Content 1").closest("div")).toHaveAttribute("hidden");
  });

  it("AccordionItem disabled blocks only that item", async () => {
    const user = userEvent.setup();

    render(
      <Accordion type="single">
        <AccordionItem value="item-1" disabled>
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>Section 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger1 = screen.getByRole("button", { name: "Section 1" });
    const trigger2 = screen.getByRole("button", { name: "Section 2" });

    expect(trigger1).toBeDisabled();
    expect(trigger2).not.toBeDisabled();

    await user.click(trigger1);
    expect(screen.getByText("Content 1").closest("div")).toHaveAttribute("hidden");

    await user.click(trigger2);
    expect(screen.getByText("Content 2").closest("div")).not.toHaveAttribute("hidden");
  });
});

describe("ARIA wiring", () => {
  it("aria-controls matches content id; content uses aria-hidden/hidden", async () => {
    const user = userEvent.setup();
    render(<BasicAccordion type="single" />);

    const trigger1 = screen.getByRole("button", { name: "Section 1" });
    const controls = trigger1.getAttribute("aria-controls");
    expect(controls).toBeTruthy();

    const content1 = screen.getByText("Content 1").closest("div")!;
    expect(content1).toHaveAttribute("id", controls!);

    // closed
    expect(content1).toHaveAttribute("aria-hidden", "true");
    expect(content1).toHaveAttribute("hidden");

    await user.click(trigger1);

    // open
    expect(content1).toHaveAttribute("aria-hidden", "false");
    expect(content1).not.toHaveAttribute("hidden");
  });
});

describe("asChild behavior", () => {
  it("AccordionTrigger asChild applies button props to child element", async () => {
    const user = userEvent.setup();

    render(
      <Accordion type="single">
        <AccordionItem value="item-1">
          <AccordionTrigger asChild>
            <button data-testid="child-trigger">Child Trigger</button>
          </AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const child = screen.getByTestId("child-trigger");
    expect(child).toHaveAttribute("type", "button");
    expect(child).toHaveAttribute("aria-expanded", "false");

    await user.click(child);
    expect(child).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Content 1").closest("div")).not.toHaveAttribute("hidden");
  });

  it("AccordionContent asChild applies content props to child element", async () => {
    const user = userEvent.setup();

    render(
      <Accordion type="single" defaultValue={null}>
        <AccordionItem value="item-1">
          <AccordionTrigger>Open</AccordionTrigger>
          <AccordionContent asChild>
            <div data-testid="child-content">Child Content</div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByRole("button", { name: "Open" });
    const childContent = screen.getByTestId("child-content");

    expect(childContent).toHaveAttribute("aria-hidden", "true");
    expect(childContent).toHaveAttribute("hidden");

    await user.click(trigger);

    expect(childContent).toHaveAttribute("aria-hidden", "false");
    expect(childContent).not.toHaveAttribute("hidden");
  });
});
