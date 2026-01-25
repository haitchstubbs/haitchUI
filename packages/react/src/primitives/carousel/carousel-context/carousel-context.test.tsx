// packages/react/carousel/src/carousel-context/carousel-context.test.tsx
import * as React from "react";
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { CarouselContext, useCarouselContext } from "./carousel-context"; // adjust path
import type { CarouselContextType } from "../types"; // adjust path

describe("CarouselContext / useCarouselContext", () => {
  it("throws a helpful error when used outside provider", () => {
    expect(() => renderHook(() => useCarouselContext("Carousel.Viewport"))).toThrowError(
      "Carousel.Viewport must be used within Carousel.Root"
    );
  });

  it("returns the provided context value when used inside provider", () => {
    const value = {
      axis: "x",
      loop: false,
      behavior: "smooth",
      dragMode: "snap",
      loopClones: 0,
      realCount: 3,
      selectedIndex: 1,
      canScrollPrev: true,
      canScrollNext: true,
      getRootProps: <P extends React.HTMLAttributes<HTMLElement>>(p: P) => p,
      getViewportProps: <P extends React.HTMLAttributes<HTMLElement>>(p: P) => p,
      api: {
        setRoot: () => {},
        setViewport: () => {},
        setContent: () => {},
        setRealCount: () => {},
        scrollToIndex: () => {},
        scrollPrev: () => {},
        scrollNext: () => {},
      },
    } satisfies CarouselContextType;

    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <CarouselContext.Provider value={value}>{children}</CarouselContext.Provider>
    );

    const { result } = renderHook(() => useCarouselContext("Carousel.Viewport"), { wrapper });

    expect(result.current).toBe(value);
    expect(result.current.selectedIndex).toBe(1);
  });
});
