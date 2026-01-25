import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCarousel } from "./useCarousel";

// ---- mock floating-ui autoUpdate
vi.mock("@floating-ui/dom", () => {
  return {
    autoUpdate: vi.fn((_viewport: Element, _content: Element, cb: () => void) => {
      // call immediately to simulate "layout ready"
      cb();
      // return cleanup
      return () => {};
    }),
  };
});

// ---- IntersectionObserver mock
type IOEntry = {
  target: Element;
  intersectionRatio: number;
};

let lastIO: MockIntersectionObserver | null = null;

class MockIntersectionObserver {
  private _cb: IntersectionObserverCallback;
  private _elements = new Set<Element>();

  root: Element | null;
  rootMargin: string;
  thresholds: ReadonlyArray<number>;

  constructor(cb: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this._cb = cb;
    this.root = (options?.root as Element) ?? null;
    this.rootMargin = options?.rootMargin ?? "0px";
    this.thresholds = Array.isArray(options?.threshold) ? options!.threshold : [options?.threshold ?? 0];

    lastIO = this;
  }

  observe = (el: Element) => {
    this._elements.add(el);
  };

  unobserve = (el: Element) => {
    this._elements.delete(el);
  };

  disconnect = () => {
    this._elements.clear();
  };

  // helper for tests
  trigger(entries: IOEntry[]) {
    const ioEntries = entries.map(
      (e) =>
        ({
          target: e.target,
          intersectionRatio: e.intersectionRatio,
          isIntersecting: e.intersectionRatio > 0,
          boundingClientRect: e.target.getBoundingClientRect(),
          intersectionRect: e.target.getBoundingClientRect(),
          rootBounds: this.root?.getBoundingClientRect() ?? null,
          time: performance.now(),
        }) as unknown as IntersectionObserverEntry
    );

    this._cb(ioEntries, this as unknown as IntersectionObserver);
  }
}

function setRect(el: Element, rect: Partial<DOMRect>) {
  const full: DOMRect = {
    x: rect.x ?? 0,
    y: rect.y ?? 0,
    width: rect.width ?? 0,
    height: rect.height ?? 0,
    top: rect.top ?? (rect.y ?? 0),
    left: rect.left ?? (rect.x ?? 0),
    bottom: rect.bottom ?? ((rect.y ?? 0) + (rect.height ?? 0)),
    right: rect.right ?? ((rect.x ?? 0) + (rect.width ?? 0)),
    toJSON: () => ({}),
  } as DOMRect;

  vi.spyOn(el, "getBoundingClientRect").mockReturnValue(full);
}

describe("useCarousel (IO + Floating UI)", () => {
  const OriginalIO = globalThis.IntersectionObserver;

  beforeEach(() => {
    lastIO = null;
    globalThis.IntersectionObserver = MockIntersectionObserver as any;
  });

  afterEach(() => {
    // restore global
    globalThis.IntersectionObserver = OriginalIO;
    vi.restoreAllMocks();
  });

  it("scrollToIndex uses DOMRects and calls viewport.scrollTo with the correct position", () => {
    const root = document.createElement("div");
    const viewport = document.createElement("div");
    const content = document.createElement("div");

    // assemble DOM
    root.appendChild(viewport);
    viewport.appendChild(content);

    const slide0 = document.createElement("div");
    const slide1 = document.createElement("div");
    content.appendChild(slide0);
    content.appendChild(slide1);

    // mock viewport scroll state + scrollTo
    Object.defineProperty(viewport, "scrollLeft", { value: 0, writable: true });
    const scrollTo = vi.fn();
    viewport.scrollTo = scrollTo;

    // set rects: viewport starts at left=10, target at left=110 => delta 100
    setRect(viewport, { left: 10, top: 0, width: 300, height: 100 });
    setRect(slide0, { left: 10, top: 0, width: 100, height: 100 });
    setRect(slide1, { left: 110, top: 0, width: 100, height: 100 });

    const { result } = renderHook(() =>
      useCarousel({
        axis: "x",
        loop: false,
        behavior: "smooth",
        dragMode: "snap",
      })
    );

    act(() => {
      result.current.api.setRoot(root);
      result.current.api.setViewport(viewport);
      result.current.api.setContent(content);
      result.current.api.setRealCount(2);
    });

    act(() => {
      result.current.api.scrollToIndex(1);
    });

    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith({ left: 100, behavior: "smooth" });
  });

  it("updates selectedIndex and canScrollPrev/Next based on the most visible slide (IntersectionObserver)", () => {
    const root = document.createElement("div");
    const viewport = document.createElement("div");
    const content = document.createElement("div");

    root.appendChild(viewport);
    viewport.appendChild(content);

    const slide0 = document.createElement("div");
    const slide1 = document.createElement("div");
    const slide2 = document.createElement("div");
    content.appendChild(slide0);
    content.appendChild(slide1);
    content.appendChild(slide2);

    // required rects for fallback/consistency
    setRect(viewport, { left: 0, top: 0, width: 300, height: 100 });
    setRect(slide0, { left: 0, top: 0, width: 100, height: 100 });
    setRect(slide1, { left: 100, top: 0, width: 100, height: 100 });
    setRect(slide2, { left: 200, top: 0, width: 100, height: 100 });

    const { result } = renderHook(() =>
      useCarousel({
        axis: "x",
        loop: false,
        dragMode: "snap",
      })
    );

    act(() => {
      result.current.api.setRoot(root);
      result.current.api.setViewport(viewport);
      result.current.api.setContent(content);
      result.current.api.setRealCount(3);
    });

    expect(lastIO).not.toBeNull();

    // slide1 most visible
    act(() => {
      lastIO!.trigger([
        { target: slide0, intersectionRatio: 0.2 },
        { target: slide1, intersectionRatio: 0.8 },
        { target: slide2, intersectionRatio: 0.1 },
      ]);
    });

    expect(result.current.selectedIndex).toBe(1);
    expect(result.current.canScrollPrev).toBe(true);
    expect(result.current.canScrollNext).toBe(true);

    // slide0 most visible
    act(() => {
      lastIO!.trigger([
        { target: slide0, intersectionRatio: 0.9 },
        { target: slide1, intersectionRatio: 0.1 },
        { target: slide2, intersectionRatio: 0.0 },
      ]);
    });

    expect(result.current.selectedIndex).toBe(0);
    expect(result.current.canScrollPrev).toBe(false);
    expect(result.current.canScrollNext).toBe(true);

    // slide2 most visible
    act(() => {
      lastIO!.trigger([
        { target: slide0, intersectionRatio: 0.0 },
        { target: slide1, intersectionRatio: 0.1 },
        { target: slide2, intersectionRatio: 0.95 },
      ]);
    });

    expect(result.current.selectedIndex).toBe(2);
    expect(result.current.canScrollPrev).toBe(true);
    expect(result.current.canScrollNext).toBe(false);
  });
});
