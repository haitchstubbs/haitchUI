// packages/react/carousel/src/components/viewport.test.tsx
import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { Viewport } from "./carousel-viewport"; // adjust import path

// ---- mock composeRefs to actually compose refs
vi.mock("@/compose-refs/src", () => {
  return {
    composeRefs:
      (...refs: any[]) =>
      (node: any) => {
        for (const ref of refs) {
          if (!ref) continue;
          if (typeof ref === "function") ref(node);
          else ref.current = node;
        }
      },
  };
});

// ---- Slot mock (clone child)
vi.mock("@/slot/src", async () => {
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

// ---- mock useCarouselContext to return an engine
const setViewport = vi.fn();
const getViewportProps = vi.fn((p: any) => ({
  ...p,
  "data-from-getViewportProps": "yes",
}));

const engineMock = {
  getViewportProps,
  api: {
    setViewport,
  },
};

const useCarouselContextSpy = vi.fn((_scope: string) => engineMock);

vi.mock("../carousel-context/carousel-context", () => {
  return {
    useCarouselContext: (scope: string) => useCarouselContextSpy(scope),
  };
});

describe("<Viewport />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls useCarouselContext with the correct scope and spreads getViewportProps onto the element", () => {
    const { container } = render(<Viewport data-testid="vp" />);

    expect(useCarouselContextSpy).toHaveBeenCalledTimes(1);
    expect(useCarouselContextSpy).toHaveBeenCalledWith("Carousel.Viewport");

    expect(getViewportProps).toHaveBeenCalledTimes(1);
    const passed = getViewportProps.mock.calls[0]![0];
    expect(passed["data-testid"]).toBe("vp");

    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName.toLowerCase()).toBe("div");
    expect(el.getAttribute("data-from-getViewportProps")).toBe("yes");
  });

  it("composes forwardedRef with engine.api.setViewport and calls setViewport with the DOM element", () => {
    const ref = React.createRef<HTMLDivElement>();

    const { container } = render(<Viewport ref={ref} />);

    const el = container.firstElementChild as HTMLDivElement;

    expect(ref.current).toBe(el);
    expect(setViewport).toHaveBeenCalledTimes(1);
    expect(setViewport).toHaveBeenCalledWith(el);
  });

  it("uses Slot when asChild=true and still wires refs + getViewportProps props", () => {
    const ref = React.createRef<HTMLButtonElement>();

    const { getByRole } = render(
      <Viewport asChild ref={ref as any} data-testid="vp">
        <button type="button">Inside</button>
      </Viewport>
    );

    const btn = getByRole("button") as HTMLButtonElement;

    expect(ref.current).toBe(btn);
    expect(setViewport).toHaveBeenCalledTimes(1);
    expect(setViewport).toHaveBeenCalledWith(btn);
    expect(btn.getAttribute("data-from-getViewportProps")).toBe("yes");
    expect(btn.getAttribute("data-testid")).toBe("vp");
  });
});
