import * as React from "react";
import { describe, it, expect } from "vitest";
import { reactChildrenToElements } from "./reactChildrenToElements";

describe("reactChildrenToElements", () => {
  it("returns only valid React elements", () => {
    const children = [
      React.createElement("div"),
      "text",
      123,
      null,
      undefined,
      React.createElement("span"),
    ];

    const result = reactChildrenToElements(children);

    expect(result).toHaveLength(2);
    expect(result[0]?.type).toBe("div");
    expect(result[1]?.type).toBe("span");
  });

  it("returns an empty array when there are no elements", () => {
    const result = reactChildrenToElements(["", 0, null, undefined]);
    expect(result).toHaveLength(0);
  });
});
