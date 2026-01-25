// packages/react/carousel/src/components/item.test.tsx
import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Item } from "./carousel-item"; // adjust path

// Slot mock (clone child and attach props/ref)
vi.mock("@/slot/src/slot", async () => {
  const React = await import("react");

  function assignRef(r: any, node: any) {
    if (!r) return;
    if (typeof r === "function") r(node);
    else r.current = node;
  }

  return {
    Slot: React.forwardRef<any, any>(function Slot(props, forwardedRef) {
      const { children, ...rest } = props;

      if (React.isValidElement(children)) {
        const child: any = children;
        const childRef = child.ref;

        return React.cloneElement(child, {
          ...rest,
          ref: (node: any) => {
            assignRef(childRef, node);
            assignRef(forwardedRef, node);
          },
        });
      }

      return (
        <div
          {...rest}
          ref={(node) => {
            assignRef(forwardedRef, node);
          }}
        >
          {children}
        </div>
      );
    }),
  };
});

describe("<Item />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a div by default and forwards props", () => {
    const { container } = render(<Item data-testid="item" aria-label="Item" />);

    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName.toLowerCase()).toBe("div");
    expect(el.getAttribute("data-testid")).toBe("item");
    expect(el.getAttribute("aria-label")).toBe("Item");
  });

  it("forwards ref to the div by default", () => {
    const ref = React.createRef<HTMLDivElement>();
    const { container } = render(<Item ref={ref} data-testid="item" />);

    const el = container.firstElementChild as HTMLDivElement;
    expect(ref.current).toBe(el);
  });

  it("uses Slot when asChild=true and forwards ref + props to the child element", () => {
    const ref = React.createRef<HTMLButtonElement>();

    render(
      <Item asChild ref={ref as any} data-testid="item" aria-label="ItemButton">
        <button type="button">Click</button>
      </Item>
    );

    const btn = screen.getByRole("button") as HTMLButtonElement;

    expect(ref.current).toBe(btn);
    expect(btn.getAttribute("data-testid")).toBe("item");
    expect(btn.getAttribute("aria-label")).toBe("ItemButton");
  });
});
