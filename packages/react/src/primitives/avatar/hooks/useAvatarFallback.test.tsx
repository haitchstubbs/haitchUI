// useAvatarFallbackVisible.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

import type { AvatarLoadingStatus } from "../types";
import { useAvatarFallbackVisible } from "./useAvatarFallback"; // adjust path

describe("useAvatarFallbackVisible", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns false when loadingStatus is 'loaded' (regardless of delay)", () => {
    type Props = { status: AvatarLoadingStatus; delay?: number };

    const { result, rerender } = renderHook(
      ({ status, delay }: Props) => useAvatarFallbackVisible(status, delay),
      { initialProps: { status: "loaded", delay: undefined } },
    );

    expect(result.current).toBe(false);

    rerender({ status: "loaded", delay: 0 });
    expect(result.current).toBe(false);

    rerender({ status: "loaded", delay: 250 });
    expect(result.current).toBe(false);
  });

  it("when not loaded and delayMs is undefined, returns true immediately", () => {
    type Props = { status: AvatarLoadingStatus; delay?: number };

    const { result, rerender } = renderHook(
      ({ status, delay }: Props) => useAvatarFallbackVisible(status, delay),
      { initialProps: { status: "idle", delay: undefined } },
    );

    expect(result.current).toBe(true);

    rerender({ status: "loading", delay: undefined });
    expect(result.current).toBe(true);
  });

  it("when not loaded and delayMs is provided, returns false until delay elapses", () => {
    const { result } = renderHook(() => useAvatarFallbackVisible("idle", 200));

    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(199);
    });
    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe(true);
  });

  it("clears timer when delayMs changes before it fires", () => {
    const clearSpy = vi.spyOn(window, "clearTimeout");

    type Props = { delay: number };
    const { rerender } = renderHook(
      ({ delay }: Props) => useAvatarFallbackVisible("idle", delay),
      { initialProps: { delay: 200 } },
    );

    rerender({ delay: 300 });
    expect(clearSpy).toHaveBeenCalledTimes(1);

    clearSpy.mockRestore();
  });

  it("becomes false immediately when status transitions to 'loaded'", () => {
    type Props = { status: AvatarLoadingStatus; delay?: number };

    const { result, rerender } = renderHook(
      ({ status, delay }: Props) => useAvatarFallbackVisible(status, delay),
      { initialProps: { status: "idle", delay: 200 } },
    );

    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe(true);

    rerender({ status: "loaded", delay: 200 });
    expect(result.current).toBe(false);
  });

  it("if status becomes 'loaded' before delay elapses, it stays false", () => {
    type Props = { status: AvatarLoadingStatus; delay?: number };

    const { result, rerender } = renderHook(
      ({ status, delay }: Props) => useAvatarFallbackVisible(status, delay),
      { initialProps: { status: "idle", delay: 200 } },
    );

    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ status: "loaded", delay: 200 });
    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe(false);
  });

  it("if delayMs is removed while not loaded, it becomes visible immediately", () => {
    type Props = { status: AvatarLoadingStatus; delay?: number };

    const { result, rerender } = renderHook(
      ({ status, delay }: Props) => useAvatarFallbackVisible(status, delay),
      { initialProps: { status: "idle", delay: 200 } },
    );

    expect(result.current).toBe(false);

    rerender({ status: "idle", delay: undefined });
    expect(result.current).toBe(true);
  });

  it("guard: visible state can't make it true when loaded", () => {
    type Props = { status: AvatarLoadingStatus; delay?: number };

    const { result, rerender } = renderHook(
      ({ status, delay }: Props) => useAvatarFallbackVisible(status, delay),
      { initialProps: { status: "idle", delay: 0 } },
    );

    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(result.current).toBe(true);

    rerender({ status: "loaded", delay: 0 });
    expect(result.current).toBe(false);
  });
});
