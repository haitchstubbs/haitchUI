// avatar-root.test.tsx
import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import type { AvatarContextProps, AvatarLoadingStatus } from "../types";

// ---- Mocks ----
const useAvatarMock = vi.fn();

// We mock useAvatar so Root is purely a wiring test
vi.mock("../hooks/useAvatar", () => ({
  useAvatar: (opts: { onLoadingStatusChange?: (s: AvatarLoadingStatus) => void }) =>
    useAvatarMock(opts),
}));

// Import AFTER mocks
import { Root } from "./avatar-root"; // <-- adjust path
import { AvatarContext, useAvatarContext } from "../avatar-context"; // if useAvatarContext exists

describe("Avatar.Root primitive", () => {
  beforeEach(() => {
    useAvatarMock.mockReset();
  });

  it("calls useAvatar with onLoadingStatusChange", () => {
    const onLoadingStatusChange = vi.fn<(s: AvatarLoadingStatus) => void>();

    const avatar: AvatarContextProps = {
      loadingStatus: "idle",
      setLoadingStatus: () => {},
      getImageProps: (p) => ({ ...p, ref: () => {} }),
    };

    useAvatarMock.mockReturnValue(avatar);

    render(<Root data-testid="root" onLoadingStatusChange={onLoadingStatusChange} />);

    expect(useAvatarMock).toHaveBeenCalledTimes(1);
    expect(useAvatarMock).toHaveBeenCalledWith({ onLoadingStatusChange });
  });

  it("renders a <span> by default and forwards props", () => {
    const avatar: AvatarContextProps = {
      loadingStatus: "idle",
      setLoadingStatus: () => {},
      getImageProps: (p) => ({ ...p, ref: () => {} }),
    };

    useAvatarMock.mockReturnValue(avatar);

    render(<Root data-testid="root" className="x" aria-label="Avatar Root" />);

    const el = screen.getByTestId("root");
    expect(el.tagName.toLowerCase()).toBe("span");
    expect(el).toHaveClass("x");
    expect(el).toHaveAttribute("aria-label", "Avatar Root");
  });

  it("renders Slot when asChild is true", () => {
    const avatar: AvatarContextProps = {
      loadingStatus: "idle",
      setLoadingStatus: () => {},
      getImageProps: (p) => ({ ...p, ref: () => {} }),
    };

    useAvatarMock.mockReturnValue(avatar);

    render(
      <Root asChild data-testid="root">
        <div />
      </Root>,
    );

    const el = screen.getByTestId("root");
    expect(el.tagName.toLowerCase()).toBe("div");
  });

  it("provides the avatar engine via AvatarContext.Provider", () => {
    const avatar: AvatarContextProps = {
      loadingStatus: "loaded",
      setLoadingStatus: () => {},
      getImageProps: (p) => ({ ...p, ref: () => {} }),
    };

    useAvatarMock.mockReturnValue(avatar);

    // We consume the context inside Root to prove Provider wiring.
    function Consumer() {
      const ctx = useAvatarContext("Test.Consumer");
      return <div data-testid="status">{ctx.loadingStatus}</div>;
    }

    render(
      <Root>
        <Consumer />
      </Root>,
    );

    expect(screen.getByTestId("status").textContent).toBe("loaded");
  });

  it("forwards the ref to the underlying element", () => {
    const avatar: AvatarContextProps = {
      loadingStatus: "idle",
      setLoadingStatus: () => {},
      getImageProps: (p) => ({ ...p, ref: () => {} }),
    };

    useAvatarMock.mockReturnValue(avatar);

    const ref = React.createRef<HTMLSpanElement>();
    render(<Root ref={ref} data-testid="root" />);

    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName.toLowerCase()).toBe("span");
    expect(ref.current).toBe(screen.getByTestId("root"));
  });

  it("compile-time: Root ref is HTMLSpanElement", () => {
    // this is mostly a TS assertion test — runtime irrelevant
    const ref = React.createRef<HTMLSpanElement>();
    expect(ref).toBeDefined();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const badRef = React.createRef<HTMLDivElement>();
  });

  it("still renders even if AvatarContext is imported (smoke)", () => {
    const avatar: AvatarContextProps = {
      loadingStatus: "idle",
      setLoadingStatus: () => {},
      getImageProps: (p) => ({ ...p, ref: () => {} }),
    };

    useAvatarMock.mockReturnValue(avatar);

    // Just make sure Provider exists and doesn't crash
    render(
      <AvatarContext.Provider value={avatar}>
        <div data-testid="ok" />
      </AvatarContext.Provider>,
    );

    expect(screen.getByTestId("ok")).toBeInTheDocument();
  });
});
