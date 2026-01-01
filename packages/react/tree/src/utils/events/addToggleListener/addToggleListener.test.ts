// addToggleListener.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { addToggleListener, toggleEventName } from "./addToggleListener.js"; // adjust path if needed

describe("addToggleListener", () => {
	let el: HTMLElement;

	beforeEach(() => {
		el = document.createElement("div");
	});

	it("adds an event listener for the toggle event name", () => {
		const listener = vi.fn();

		addToggleListener(el, listener);

		el.dispatchEvent(new Event(toggleEventName));

		expect(listener).toHaveBeenCalledTimes(1);
	});

	it("passes the event object to the listener", () => {
		const listener = vi.fn<(ev: Event) => void>();

		addToggleListener(el, listener);

		const ev = new Event(toggleEventName);
		el.dispatchEvent(ev);

		expect(listener).toHaveBeenCalledWith(ev);
	});

	it("returns a cleanup function that removes the listener", () => {
		const listener = vi.fn();

		const remove = addToggleListener(el, listener);

		// First dispatch → should fire
		el.dispatchEvent(new Event(toggleEventName));
		expect(listener).toHaveBeenCalledTimes(1);

		// Remove listener
		remove();

		// Second dispatch → should NOT fire
		el.dispatchEvent(new Event(toggleEventName));
		expect(listener).toHaveBeenCalledTimes(1);
	});

	it("supports multiple listeners independently", () => {
		const a = vi.fn();
		const b = vi.fn();

		const removeA = addToggleListener(el, a);
		const removeB = addToggleListener(el, b);

		el.dispatchEvent(new Event(toggleEventName));

		expect(a).toHaveBeenCalledTimes(1);
		expect(b).toHaveBeenCalledTimes(1);

		removeA();

		el.dispatchEvent(new Event(toggleEventName));

		expect(a).toHaveBeenCalledTimes(1); // unchanged
		expect(b).toHaveBeenCalledTimes(2);

		removeB();

		el.dispatchEvent(new Event(toggleEventName));

		expect(a).toHaveBeenCalledTimes(1);
		expect(b).toHaveBeenCalledTimes(2);
	});

	it("does not throw if cleanup is called multiple times", () => {
		const listener = vi.fn();
		const remove = addToggleListener(el, listener);

		expect(() => {
			remove();
			remove();
		}).not.toThrow();
	});
});
