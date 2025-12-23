import "@testing-library/jest-dom/vitest";
import "vitest-axe/extend-expect";
import * as matchers from "vitest-axe/matchers";
import { expect } from "vitest";

expect.extend(matchers);



/**
 * Silence JSDOM "Not implemented: HTMLCanvasElement.getContext"
 * Some libs/probes call it even if you aren't testing canvas.
 */
Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  value: function getContext() {
    // Return a minimal mock object (not null) to satisfy code paths that expect a context.
    // Add methods as needed if a dependency uses them.
    return {
      canvas: this,
      fillRect: () => {},
      clearRect: () => {},
      getImageData: () => ({ data: new Uint8ClampedArray() }),
      putImageData: () => {},
      createImageData: () => ({ data: new Uint8ClampedArray() }),
      setTransform: () => {},
      drawImage: () => {},
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      stroke: () => {},
      translate: () => {},
      scale: () => {},
      rotate: () => {},
      arc: () => {},
      fill: () => {},
      measureText: () => ({ width: 0 }),
      transform: () => {},
      rect: () => {},
      clip: () => {},
      getComputedStyle: () => {},
    };
  },
});

/**
 * Silence JSDOM navigation warnings like:
 * "Not implemented: navigation to another Document"
 *
 * Your tests should generally prevent default on <a> clicks anyway.
 * This stub makes accidental navigations a no-op.
 */
Object.defineProperty(window, "location", {
  value: {
    ...window.location,
    assign: () => {},
    replace: () => {},
    reload: () => {},
  },
});

const _getComputedStyle = window.getComputedStyle.bind(window);

window.getComputedStyle = ((elt: Element, pseudoElt?: string | null) => {
  if (pseudoElt) {
    const base = _getComputedStyle(elt);
    // Create a proxy-like object that behaves like CSSStyleDeclaration enough for common reads
    return new Proxy(base, {
      get(target, prop) {
        if (prop === "content") return '""';
        return (target as any)[prop];
      },
    }) as unknown as CSSStyleDeclaration;
  }
  return _getComputedStyle(elt);
}) as typeof window.getComputedStyle;