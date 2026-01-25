import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Content } from "./carousel-content"; // <-- adjust path

// ---- composeRefs mock (works with callback refs + ref objects)
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

// ---- Slot mock (clone child and attach props/ref)
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

// ---- reactChildrenToElements mock
vi.mock("@/utils/reactChildrenToElements", () => {
  return {
    reactChildrenToElements: (children: React.ReactNode) => {
      const arr = React.Children.toArray(children);
      // ensure they are ReactElements for cloneElement
      return arr.filter(React.isValidElement) as React.ReactElement[];
    },
  };
});

// ---- useCarouselContext mock
const setRealCount = vi.fn();
const setContent = vi.fn();

type EngineMock = {
  loop: boolean;
  loopClones: number;
  api: {
    setRealCount: (n: number) => void;
    setContent: (el: HTMLElement | null) => void;
  };
};

let engineMock: EngineMock;

const useCarouselContextSpy = vi.fn((_scope: string) => engineMock);

vi.mock("../carousel-context/carousel-context", () => {
  return {
    useCarouselContext: (scope: string) => useCarouselContextSpy(scope),
  };
});

describe("<Content />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    engineMock = {
      loop: false,
      loopClones: 0,
      api: {
        setRealCount,
        setContent,
      },
    };
  });

  it("calls useCarouselContext with correct scope and sets realCount based on children", () => {
    render(
      <Content>
        <div data-testid="item-0" />
        <div data-testid="item-1" />
        <div data-testid="item-2" />
      </Content>
    );

    expect(useCarouselContextSpy).toHaveBeenCalledTimes(1);
    expect(useCarouselContextSpy).toHaveBeenCalledWith("Carousel.Content");

    // effect should set count = 3
    expect(setRealCount).toHaveBeenCalledTimes(1);
    expect(setRealCount).toHaveBeenCalledWith(3);
  });

  it("updates realCount when children change", () => {
    const { rerender } = render(
      <Content>
        <div data-testid="item-0" />
        <div data-testid="item-1" />
      </Content>
    );

    expect(setRealCount).toHaveBeenCalledTimes(1);
    expect(setRealCount).toHaveBeenCalledWith(2);

    rerender(
      <Content>
        <div data-testid="item-0" />
        <div data-testid="item-1" />
        <div data-testid="item-2" />
      </Content>
    );

    expect(setRealCount).toHaveBeenCalledTimes(2);
    expect(setRealCount).toHaveBeenLastCalledWith(3);
  });

  it("composes forwardedRef with engine.api.setContent", () => {
    const ref = React.createRef<HTMLDivElement>();

    const { container } = render(
      <Content ref={ref}>
        <div />
      </Content>
    );

    const el = container.firstElementChild as HTMLDivElement;

    expect(ref.current).toBe(el);
    expect(setContent).toHaveBeenCalledTimes(1);
    expect(setContent).toHaveBeenCalledWith(el);
  });

  it("does NOT clone when loop is disabled", () => {
    engineMock.loop = false;
    engineMock.loopClones = 2;

    render(
      <Content>
        <div data-testid="item-0" />
        <div data-testid="item-1" />
        <div data-testid="item-2" />
      </Content>
    );

    // no clones
    expect(document.querySelectorAll("[data-carousel-clone]").length).toBe(0);

    // originals present
    expect(screen.getByTestId("item-0")).toBeInTheDocument();
    expect(screen.getByTestId("item-1")).toBeInTheDocument();
    expect(screen.getByTestId("item-2")).toBeInTheDocument();
  });

  it("does NOT clone when realCount <= 1 even if loop=true", () => {
    engineMock.loop = true;
    engineMock.loopClones = 2;

    render(
      <Content>
        <div data-testid="item-0" />
      </Content>
    );

    expect(document.querySelectorAll("[data-carousel-clone]").length).toBe(0);
    expect(screen.getByTestId("item-0")).toBeInTheDocument();
  });

  it("clones before and after when loop is enabled with loopClones > 0", () => {
    engineMock.loop = true;
    engineMock.loopClones = 2;

    const { container } = render(
      <Content>
        <div data-testid="item-0" />
        <div data-testid="item-1" />
        <div data-testid="item-2" />
      </Content>
    );

    // realCount = 3, loopClones = 2 => 2 before + 3 originals + 2 after = 7
    const host = container.firstElementChild as HTMLElement;
    expect(host.children.length).toBe(7);

    const clones = host.querySelectorAll("[data-carousel-clone]");
    expect(clones.length).toBe(4); // 2 before + 2 after

    // sanity: originals still exist once each by testid
    expect(host.querySelector('[data-testid="item-0"]:not([data-carousel-clone])')).toBeTruthy();
    expect(host.querySelector('[data-testid="item-1"]:not([data-carousel-clone])')).toBeTruthy();
    expect(host.querySelector('[data-testid="item-2"]:not([data-carousel-clone])')).toBeTruthy();
  });

  it("caps clones at realCount (n = min(loopClones, realCount))", () => {
    engineMock.loop = true;
    engineMock.loopClones = 999;

    const { container } = render(
      <Content>
        <div data-testid="item-0" />
        <div data-testid="item-1" />
        <div data-testid="item-2" />
      </Content>
    );

    // n = min(999, 3) = 3 => 3 before + 3 originals + 3 after = 9
    const host = container.firstElementChild as HTMLElement;
    expect(host.children.length).toBe(9);

    const clones = host.querySelectorAll("[data-carousel-clone]");
    expect(clones.length).toBe(6);
  });

  it("uses Slot when asChild=true and still wires setContent + renders cloned children inside", () => {
    engineMock.loop = true;
    engineMock.loopClones = 1;

    const ref = React.createRef<HTMLUListElement>();

    const { container } = render(
      <Content asChild ref={ref as any} data-testid="content">
        <ul />
      </Content>
    );

    const ul = container.querySelector("ul") as HTMLUListElement;
    expect(ul).toBeTruthy();

    expect(ref.current).toBe(ul);
    expect(setContent).toHaveBeenCalledTimes(1);
    expect(setContent).toHaveBeenCalledWith(ul);
    expect(ul.getAttribute("data-testid")).toBe("content");
  });
});
