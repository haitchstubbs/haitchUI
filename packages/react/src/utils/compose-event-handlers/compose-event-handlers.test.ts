import { describe, it, expect, vi } from "vitest";
import { composeEventHandlers } from "./compose-event-handlers";

describe("composeEventHandlers", () => {
  it("calls both handlers when not prevented", () => {
    const theirHandler = vi.fn();
    const ourHandler = vi.fn();

    const handler = composeEventHandlers(theirHandler, ourHandler);
    const event = { defaultPrevented: false };

    handler(event);

    expect(theirHandler).toHaveBeenCalledTimes(1);
    expect(ourHandler).toHaveBeenCalledTimes(1);
  });

  it("skips our handler when defaultPrevented is true", () => {
    const theirHandler = vi.fn((event: { defaultPrevented?: boolean }) => {
      event.defaultPrevented = true;
    });
    const ourHandler = vi.fn();

    const handler = composeEventHandlers(theirHandler, ourHandler);
    const event = { defaultPrevented: false };

    handler(event);

    expect(theirHandler).toHaveBeenCalledTimes(1);
    expect(ourHandler).toHaveBeenCalledTimes(0);
  });

  it("works when their handler is undefined", () => {
    const ourHandler = vi.fn();
    const handler = composeEventHandlers(undefined, ourHandler);

    handler({ defaultPrevented: false });

    expect(ourHandler).toHaveBeenCalledTimes(1);
  });
});
