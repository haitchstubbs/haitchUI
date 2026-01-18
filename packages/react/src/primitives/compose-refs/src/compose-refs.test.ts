import { describe, it, expect, vi } from "vitest";
import * as React from "react";
import { composeRefs } from "./compose-refs"; // adjust path

describe("composeRefs", () => {
  it("calls function refs with the node", () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();

    const setRef = composeRefs<HTMLDivElement>(fn1, fn2);

    const node = document.createElement("div");
    setRef(node);

    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn1).toHaveBeenCalledWith(node);
    expect(fn2).toHaveBeenCalledTimes(1);
    expect(fn2).toHaveBeenCalledWith(node);
  });

  it("sets .current on object refs", () => {
    const ref1 = { current: null as HTMLDivElement | null };
    const ref2 = React.createRef<HTMLDivElement>();

    const setRef = composeRefs<HTMLDivElement>(ref1, ref2);

    const node = document.createElement("div");
    setRef(node);

    expect(ref1.current).toBe(node);
    expect(ref2.current).toBe(node);
  });

  it("ignores undefined refs", () => {
    const fn = vi.fn();
    const ref = { current: null as HTMLDivElement | null };

    const setRef = composeRefs<HTMLDivElement>(undefined, fn, undefined, ref);

    const node = document.createElement("div");
    setRef(node);

    expect(fn).toHaveBeenCalledWith(node);
    expect(ref.current).toBe(node);
  });

  it("passes null through to all refs (cleanup)", () => {
    const fn = vi.fn();
    const ref = { current: document.createElement("div") as HTMLDivElement | null };

    const setRef = composeRefs<HTMLDivElement>(fn, ref);

    setRef(null);

    expect(fn).toHaveBeenCalledWith(null);
    expect(ref.current).toBe(null);
  });

  it("swallows errors when assigning to a non-writable ref object", () => {
    // Create an object that will throw on assignment to `current`
    const badRef = Object.defineProperty({}, "current", {
      get: () => null,
      set: () => {
        throw new Error("nope");
      },
      configurable: true,
    }) as unknown as React.MutableRefObject<HTMLDivElement | null>;

    const goodFn = vi.fn();
    const goodRef = { current: null as HTMLDivElement | null };

    const setRef = composeRefs<HTMLDivElement>(badRef, goodFn, goodRef);

    const node = document.createElement("div");
    expect(() => setRef(node)).not.toThrow();

    // still continues to the other refs
    expect(goodFn).toHaveBeenCalledWith(node);
    expect(goodRef.current).toBe(node);
  });
});
