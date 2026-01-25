// Fallback.test.tsx
import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// --- Mocks ---
const useAvatarContextMock = vi.fn();
const useAvatarFallbackVisibleMock = vi.fn();

// Mock the context hook module
vi.mock("../avatar-context", () => ({
  useAvatarContext: (component: string) => useAvatarContextMock(component),
}));

// Mock the fallback visibility hook module
vi.mock("../hooks/useAvatarFallback", () => ({
  useAvatarFallbackVisible: (status: unknown, delayMs?: number) =>
    useAvatarFallbackVisibleMock(status, delayMs),
}));

// Import AFTER mocks
import { Fallback } from "./avatar-fallback"; // <-- adjust path to where Fallback is exported

describe("Avatar.Fallback primitive", () => {
  beforeEach(() => {
    useAvatarContextMock.mockReset();
    useAvatarFallbackVisibleMock.mockReset();

    // default engine
    useAvatarContextMock.mockReturnValue({ loadingStatus: "idle" });
  });

  it("calls useAvatarContext with 'Avatar.Fallback' and passes status + delayMs to useAvatarFallbackVisible", () => {
    useAvatarFallbackVisibleMock.mockReturnValue(true);

    render(<Fallback delayMs={250} data-testid="fb" />);

    expect(useAvatarContextMock).toHaveBeenCalledWith("Avatar.Fallback");
    expect(useAvatarFallbackVisibleMock).toHaveBeenCalledWith("idle", 250);
  });

  it("returns null when not visible", () => {
    useAvatarFallbackVisibleMock.mockReturnValue(false);

    const { container } = render(<Fallback data-testid="fb" />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByTestId("fb")).toBeNull();
  });

  it("renders a <span> when visible and asChild is false", () => {
    useAvatarFallbackVisibleMock.mockReturnValue(true);

    render(
      <Fallback
        data-testid="fb"
        aria-label="fallback"
        className="x"
        title="t"
      />,
    );

    const el = screen.getByTestId("fb");
    expect(el.tagName.toLowerCase()).toBe("span");
    expect(el).toHaveAttribute("aria-label", "fallback");
    expect(el).toHaveClass("x");
    expect(el).toHaveAttribute("title", "t");
  });

  it("forwards the ref to the rendered element (span)", () => {
    useAvatarFallbackVisibleMock.mockReturnValue(true);

    const ref = React.createRef<HTMLSpanElement>();
    render(<Fallback ref={ref} data-testid="fb" />);

    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName.toLowerCase()).toBe("span");
    expect(ref.current).toBe(screen.getByTestId("fb"));
  });

  it("renders Slot when asChild is true (and is visible)", () => {
    useAvatarFallbackVisibleMock.mockReturnValue(true);

    render(
      <Fallback asChild data-testid="fb">
        <span />
      </Fallback>,
    );

    const el = screen.getByTestId("fb");
    expect(el.tagName.toLowerCase()).toBe("span");
  });

  it("forwards the ref through Slot when asChild is true", () => {
    useAvatarFallbackVisibleMock.mockReturnValue(true);

    const ref = React.createRef<HTMLSpanElement>();
    render(
      <Fallback asChild ref={ref} data-testid="fb">
        <span />
      </Fallback>,
    );

    expect(ref.current).not.toBeNull();
    expect(ref.current).toBe(screen.getByTestId("fb"));
  });

  it("uses the engine loadingStatus returned from useAvatarContext", () => {
    useAvatarContextMock.mockReturnValue({ loadingStatus: "error" });
    useAvatarFallbackVisibleMock.mockReturnValue(true);

    render(<Fallback delayMs={123} data-testid="fb" />);

    expect(useAvatarFallbackVisibleMock).toHaveBeenCalledWith("error", 123);
  });
});
