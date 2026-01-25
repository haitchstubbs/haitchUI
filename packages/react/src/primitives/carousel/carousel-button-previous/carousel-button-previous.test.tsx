// packages/react/carousel/src/components/previous.test.tsx
import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Previous } from "./carousel-button-previous"; // adjust path

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
const scrollPrev = vi.fn();

let engineMock = {
  canScrollPrev: true,
  api: {
    scrollPrev,
  },
};

const useCarouselContextSpy = vi.fn((_scope: string) => engineMock);

vi.mock("../carousel-context/carousel-context", () => {
  return {
    useCarouselContext: (scope: string) => useCarouselContextSpy(scope),
  };
});

describe("<Previous />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    engineMock = {
      canScrollPrev: true,
      api: { scrollPrev },
    };
  });

  it("calls useCarouselContext with correct scope", () => {
    render(<Previous />);
    expect(useCarouselContextSpy).toHaveBeenCalledTimes(1);
    expect(useCarouselContextSpy).toHaveBeenCalledWith("Carousel.Previous");
  });

  it("renders a button by default with type=button and default aria-label", () => {
    render(<Previous />);

    const btn = screen.getByRole("button", { name: "Previous slide" });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute("type", "button");
  });

  it("uses provided aria-label when supplied", () => {
    render(<Previous aria-label="Back" />);
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
  });

  it("is disabled by default when engine.canScrollPrev is false", () => {
    engineMock.canScrollPrev = false;

    render(<Previous />);
    const btn = screen.getByRole("button", { name: "Previous slide" }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it("disabled prop overrides engine.canScrollPrev", () => {
    engineMock.canScrollPrev = true;

    render(<Previous disabled />);
    const btn = screen.getByRole("button", { name: "Previous slide" }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);

    render(<Previous disabled={false} />);
    const btn2 = screen.getAllByRole("button", { name: "Previous slide" })[1] as HTMLButtonElement;
    expect(btn2.disabled).toBe(false);
  });

  it("click calls props.onClick then engine.api.scrollPrev (when not prevented)", () => {
    const onClick = vi.fn();

    render(<Previous onClick={onClick} />);
    const btn = screen.getByRole("button", { name: "Previous slide" });

    fireEvent.click(btn);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(scrollPrev).toHaveBeenCalledTimes(1);
  });

  it("does not call engine.api.scrollPrev when event is defaultPrevented by user onClick", () => {
    const onClick = vi.fn((e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
    });

    render(<Previous onClick={onClick} />);
    const btn = screen.getByRole("button", { name: "Previous slide" });

    fireEvent.click(btn);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(scrollPrev).toHaveBeenCalledTimes(0);
  });

  it("forwards ref to the underlying element", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Previous ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("asChild=true uses Slot and still wires attributes/handlers onto child", () => {
    const ref = React.createRef<HTMLButtonElement>();

    render(
      <Previous asChild ref={ref as any} aria-label="Prev custom">
        <button type="button">X</button>
      </Previous>
    );

    const btn = screen.getByRole("button", { name: "Prev custom" });
    fireEvent.click(btn);

    expect(ref.current).toBe(btn);
    expect(scrollPrev).toHaveBeenCalledTimes(1);
  });
});
