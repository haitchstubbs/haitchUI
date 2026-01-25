// packages/react/carousel/src/components/next.test.tsx
import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Next } from "./carousel-button-next"; // adjust path

// ---- Slot mock (clone child and attach props/ref)
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
        <button
          {...rest}
          ref={(node) => {
            assignRef(forwardedRef, node);
          }}
        >
          {children}
        </button>
      );
    }),
  };
});

// ---- useCarouselContext mock
const scrollNext = vi.fn();

let engineMock = {
  canScrollNext: true,
  api: {
    scrollNext,
  },
};

const useCarouselContextSpy = vi.fn((_scope: string) => engineMock);

vi.mock("../carousel-context/carousel-context", () => {
  return {
    useCarouselContext: (scope: string) => useCarouselContextSpy(scope),
  };
});

describe("<Next />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    engineMock = {
      canScrollNext: true,
      api: { scrollNext },
    };
  });

  it("calls useCarouselContext with correct scope", () => {
    render(<Next />);
    expect(useCarouselContextSpy).toHaveBeenCalledTimes(1);
    expect(useCarouselContextSpy).toHaveBeenCalledWith("Carousel.Next");
  });

  it("renders a button by default with type=button and default aria-label", () => {
    render(<Next />);

    const btn = screen.getByRole("button", { name: "Next slide" });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute("type", "button");
  });

  it("uses provided aria-label when supplied", () => {
    render(<Next aria-label="Forward" />);
    expect(screen.getByRole("button", { name: "Forward" })).toBeInTheDocument();
  });

  it("is disabled by default when engine.canScrollNext is false", () => {
    engineMock.canScrollNext = false;

    render(<Next />);
    const btn = screen.getByRole("button", { name: "Next slide" }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it("disabled prop overrides engine.canScrollNext", () => {
    engineMock.canScrollNext = true;

    render(<Next disabled />);
    const btn = screen.getByRole("button", { name: "Next slide" }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);

    render(<Next disabled={false} />);
    const btn2 = screen.getAllByRole("button", { name: "Next slide" })[1] as HTMLButtonElement;
    expect(btn2.disabled).toBe(false);
  });

  it("click calls props.onClick then engine.api.scrollNext (when not prevented)", () => {
    const onClick = vi.fn();

    render(<Next onClick={onClick} />);
    const btn = screen.getByRole("button", { name: "Next slide" });

    fireEvent.click(btn);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(scrollNext).toHaveBeenCalledTimes(1);
  });

  it("does not call engine.api.scrollNext when event is defaultPrevented by user onClick", () => {
    const onClick = vi.fn((e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
    });

    render(<Next onClick={onClick} />);
    const btn = screen.getByRole("button", { name: "Next slide" });

    fireEvent.click(btn);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(scrollNext).toHaveBeenCalledTimes(0);
  });

  it("forwards ref to the underlying element", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Next ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("asChild=true uses Slot and still wires attributes/handlers onto child", () => {
    const ref = React.createRef<HTMLButtonElement>();

    render(
      <Next asChild ref={ref as any} aria-label="Next custom">
        <button type="button">X</button>
      </Next>
    );

    const btn = screen.getByRole("button", { name: "Next custom" });
    fireEvent.click(btn);

    expect(ref.current).toBe(btn);
    expect(scrollNext).toHaveBeenCalledTimes(1);
  });
});
