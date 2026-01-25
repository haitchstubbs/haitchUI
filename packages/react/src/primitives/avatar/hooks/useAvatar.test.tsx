// useAvatar.test.tsx
import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

import type { AvatarLoadingStatus } from "../types";
import { useAvatar } from "./useAvatar"; // adjust path

describe("useAvatar (fixed)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes with loadingStatus = 'idle' and stable function shapes", () => {
    const { result } = renderHook(() => useAvatar());

    expect(result.current.loadingStatus).toBe("idle");
    expect(typeof result.current.setLoadingStatus).toBe("function");
    expect(typeof result.current.getImageProps).toBe("function");
  });

  it("keeps getImageProps stable across re-renders (even if options handler changes)", () => {
    type Props = { cb?: (s: AvatarLoadingStatus) => void };

    const { result, rerender } = renderHook(
      ({ cb }: Props) => useAvatar({ onLoadingStatusChange: cb }),
      { initialProps: {} as Props },
    );

    const first = result.current.getImageProps;

    rerender({ cb: () => {} });
    expect(result.current.getImageProps).toBe(first);

    rerender({ cb: () => {} });
    expect(result.current.getImageProps).toBe(first);
  });

  it("calls both per-image and default handlers on onLoad", () => {
    const defaultHandler = vi.fn<(s: AvatarLoadingStatus) => void>();
    const perImageHandler = vi.fn<(s: AvatarLoadingStatus) => void>();

    const { result } = renderHook(() =>
      useAvatar({ onLoadingStatusChange: defaultHandler }),
    );

    const imgProps = result.current.getImageProps({
      src: "/x.png",
      onLoadingStatusChange: perImageHandler,
    });

    // simulate ref attachment so per-node mapping is registered
    const img = document.createElement("img");
    act(() => {
      imgProps.ref(img);
    });

    act(() => {
      imgProps.onLoad?.({ currentTarget: img } as any);
    });

    expect(result.current.loadingStatus).toBe("loaded");
    expect(perImageHandler).toHaveBeenCalledWith("loaded");
    expect(defaultHandler).toHaveBeenCalledWith("loaded");
  });

  it("calls both per-image and default handlers on onError", () => {
    const defaultHandler = vi.fn<(s: AvatarLoadingStatus) => void>();
    const perImageHandler = vi.fn<(s: AvatarLoadingStatus) => void>();

    const { result } = renderHook(() =>
      useAvatar({ onLoadingStatusChange: defaultHandler }),
    );

    const imgProps = result.current.getImageProps({
      src: "/x.png",
      onLoadingStatusChange: perImageHandler,
    });

    const img = document.createElement("img");
    act(() => {
      imgProps.ref(img);
    });

    act(() => {
      imgProps.onError?.({ currentTarget: img } as any);
    });

    expect(result.current.loadingStatus).toBe("error");
    expect(perImageHandler).toHaveBeenCalledWith("error");
    expect(defaultHandler).toHaveBeenCalledWith("error");
  });

  it("preserves user onLoad/onError handlers (calls user handlers first)", () => {
    const onLoad = vi.fn();
    const onError = vi.fn();

    const { result } = renderHook(() => useAvatar());

    const imgProps = result.current.getImageProps({
      src: "/x.png",
      onLoad,
      onError,
    });

    const img = document.createElement("img");
    act(() => {
      imgProps.ref(img);
    });

    act(() => {
      imgProps.onLoad?.({ currentTarget: img } as any);
    });

    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(result.current.loadingStatus).toBe("loaded");

    act(() => {
      imgProps.onError?.({ currentTarget: img } as any);
    });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(result.current.loadingStatus).toBe("error");
  });

  it("does not pass onLoadingStatusChange down to DOM props", () => {
    const perImageHandler = vi.fn<(s: AvatarLoadingStatus) => void>();
    const { result } = renderHook(() => useAvatar());

    const imgProps = result.current.getImageProps({
      src: "/x.png",
      onLoadingStatusChange: perImageHandler,
    });

    // Should be stripped (otherwise React warns about unknown event)
    expect((imgProps as any).onLoadingStatusChange).toBeUndefined();
  });

  it("ref fast-path: no src emits 'idle'", () => {
    const { result } = renderHook(() => useAvatar());

    const imgProps = result.current.getImageProps({
      // no src
      alt: "x",
    });

    const img = document.createElement("img");

    act(() => {
      imgProps.ref(img);
    });

    expect(result.current.loadingStatus).toBe("idle");
  });

  it("ref fast-path: non-HTMLImageElement node emits 'loading' when src is present", () => {
    const { result } = renderHook(() => useAvatar());

    const imgProps = result.current.getImageProps({
      src: "/x.png",
    });

    const div = document.createElement("div");

    act(() => {
      imgProps.ref(div as any);
    });

    expect(result.current.loadingStatus).toBe("loading");
  });

  it("ref fast-path: HTMLImageElement complete + naturalWidth > 0 emits 'loaded'", () => {
    const { result } = renderHook(() => useAvatar());

    const imgProps = result.current.getImageProps({
      src: "/x.png",
    });

    const img = document.createElement("img");
    Object.defineProperty(img, "complete", { value: true, configurable: true });
    Object.defineProperty(img, "naturalWidth", { value: 10, configurable: true });

    act(() => {
      imgProps.ref(img);
    });

    expect(result.current.loadingStatus).toBe("loaded");
  });

  it("ref fast-path: HTMLImageElement complete + naturalWidth === 0 emits 'error'", () => {
    const { result } = renderHook(() => useAvatar());

    const imgProps = result.current.getImageProps({
      src: "/x.png",
    });

    const img = document.createElement("img");
    Object.defineProperty(img, "complete", { value: true, configurable: true });
    Object.defineProperty(img, "naturalWidth", { value: 0, configurable: true });

    act(() => {
      imgProps.ref(img);
    });

    expect(result.current.loadingStatus).toBe("error");
  });

  it("ref fast-path: HTMLImageElement not complete emits 'loading'", () => {
    const { result } = renderHook(() => useAvatar());

    const imgProps = result.current.getImageProps({
      src: "/x.png",
    });

    const img = document.createElement("img");
    Object.defineProperty(img, "complete", { value: false, configurable: true });

    act(() => {
      imgProps.ref(img);
    });

    expect(result.current.loadingStatus).toBe("loading");
  });

  it("default handler ref updates when options handler changes", () => {
    const cb1 = vi.fn<(s: AvatarLoadingStatus) => void>();
    const cb2 = vi.fn<(s: AvatarLoadingStatus) => void>();

    type Props = { cb?: (s: AvatarLoadingStatus) => void };

    const { result, rerender } = renderHook(
      ({ cb }: Props) => useAvatar({ onLoadingStatusChange: cb }),
      { initialProps: { cb: cb1 } },
    );

    const imgProps1 = result.current.getImageProps({ src: "/x.png" });
    const img = document.createElement("img");

    act(() => {
      imgProps1.ref(img);
      imgProps1.onLoad?.({ currentTarget: img } as any);
    });

    expect(cb1).toHaveBeenCalledWith("loaded");

    rerender({ cb: cb2 });

    const imgProps2 = result.current.getImageProps({ src: "/x.png" });

    act(() => {
      // attach again to ensure per-node mapping sees latest handler values
      imgProps2.ref(img);
      imgProps2.onError?.({ currentTarget: img } as any);
    });

    expect(cb2).toHaveBeenCalledWith("error");
  });

  it("returns a stable ref callback (composeRefs output) per call and can accept function and object refs", () => {
    const { result } = renderHook(() => useAvatar());

    const fnRef = vi.fn();
    const objRef = React.createRef<HTMLImageElement>();

    const imgProps = result.current.getImageProps({
      src: "/x.png",
      ref: (node) => {
        fnRef(node);
        // also forward to object ref to simulate composition
        (objRef as any).current = node;
      },
    });

    const img = document.createElement("img");
    act(() => {
      imgProps.ref(img);
    });

    expect(fnRef).toHaveBeenCalledWith(img);
    expect(objRef.current).toBe(img);
  });
});
