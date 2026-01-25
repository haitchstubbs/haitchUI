// packages/react/carousel/src/components/root.test.tsx
import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { Root } from "./carousel-root"; // adjust path to where Root lives

// --- mock CarouselContext provider so we can assert value identity if needed
vi.mock("../carousel-context/carousel-context", async () => {
  const React = await import("react");
  return {
    CarouselContext: React.createContext<any>(null),
  };
});

// --- mock composeRefs to actually compose refs (so we can assert both are called)
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

// --- Slot: render children directly, pass ref down
vi.mock("@/slot/src/slot", async () => {
  const React = await import("react");
  return {
    Slot: React.forwardRef<any, any>(function Slot(props, ref) {
      // mimic Radix Slot-ish behaviour enough for tests:
      // render a div wrapper if no children (keep simple)
      const { children, ...rest } = props;
      if (React.isValidElement(children)) {
        // Only pass ref if the child is a valid ReactElement and supports ref
        return React.cloneElement(children as React.ReactElement, { ...rest, ...(ref ? { ref } : {}) });
      }
      return (
        <div ref={ref} {...rest}>
          {children}
        </div>
      );
    }),
  };
});

// --- mock useCarousel to return a stable engine object we can assert against
const setRoot = vi.fn();
const getRootProps = vi.fn((p: any) => ({
  ...p,
  "data-from-getRootProps": "yes",
  onKeyDown: p.onKeyDown,
}));

const engineMock = {
  axis: "x",
  loop: false,
  behavior: "smooth",
  dragMode: "snap",
  loopClones: 0,
  realCount: 0,
  selectedIndex: 0,
  canScrollPrev: false,
  canScrollNext: false,
  getRootProps,
  getViewportProps: (p: any) => p,
  api: {
    setRoot,
    setViewport: vi.fn(),
    setContent: vi.fn(),
    setRealCount: vi.fn(),
    scrollToIndex: vi.fn(),
    scrollPrev: vi.fn(),
    scrollNext: vi.fn(),
  },
};

const useCarouselSpy = vi.fn(() => engineMock);

vi.mock("../hooks/useCarousel", () => {
  return {
    useCarousel: (options: any) => useCarouselSpy(options),
  };
});

describe("<Root />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls useCarousel(options), calls onApi exactly once on mount, and passes engine into context", () => {
    const onApi = vi.fn();

    const { container } = render(<Root options={{ loop: true }} onApi={onApi} data-testid="root" />);

    // useCarousel gets options
    expect(useCarouselSpy).toHaveBeenCalledTimes(1);
    expect(useCarouselSpy).toHaveBeenCalledWith({ loop: true });

    // onApi called once on mount with engine.api (and not again due to prop changes)
    expect(onApi).toHaveBeenCalledTimes(1);
    expect(onApi).toHaveBeenCalledWith(engineMock.api);

    // renders a div by default
    const el = container.firstElementChild as HTMLElement;
    expect(el?.tagName.toLowerCase()).toBe("div");

    // getRootProps called with incoming props (excluding special ones)
    // NOTE: Root passes props object into getRootProps, so ensure it was called.
    expect(getRootProps).toHaveBeenCalledTimes(1);
    const passedProps = getRootProps.mock.calls[0]![0];
    expect(passedProps["data-testid"]).toBe("root");

    // returned props from getRootProps applied
    expect(el.getAttribute("data-from-getRootProps")).toBe("yes");
  });

  it("composes forwardedRef with engine.api.setRoot and calls setRoot with the DOM element", () => {
    const ref = React.createRef<HTMLDivElement>();

    const { container } = render(<Root ref={ref} data-testid="root" />);

    const el = container.firstElementChild as HTMLDivElement;

    expect(ref.current).toBe(el);
    expect(setRoot).toHaveBeenCalledTimes(1);
    expect(setRoot).toHaveBeenCalledWith(el);
  });

  it("uses Slot when asChild=true and still wires refs + getRootProps props", () => {
    const ref = React.createRef<HTMLButtonElement>();

    const { getByRole } = render(
      <Root asChild ref={ref as any} data-testid="root">
        <button type="button">Hello</button>
      </Root>
    );

    const btn = getByRole("button") as HTMLButtonElement;

    // Slot should have cloned the button and applied props/ref
    expect(ref.current).toBe(btn);
    expect(setRoot).toHaveBeenCalledWith(btn);
    expect(btn.getAttribute("data-from-getRootProps")).toBe("yes");
  });

  it("keeps latest onApi in a ref but does NOT call it again after mount", () => {
    const onApi1 = vi.fn();
    const onApi2 = vi.fn();

    const { rerender } = render(<Root onApi={onApi1} data-testid="root" />);

    expect(onApi1).toHaveBeenCalledTimes(1);
    expect(onApi2).toHaveBeenCalledTimes(0);

    // change onApi prop
    rerender(<Root onApi={onApi2} data-testid="root" />);

    // effect that calls onApi is mount-only, so should not call again
    expect(onApi1).toHaveBeenCalledTimes(1);
    expect(onApi2).toHaveBeenCalledTimes(0);
  });
});
