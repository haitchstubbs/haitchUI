import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { composeRefs } from "@haitch-ui/ui"; // or relative path if not exported

describe("composeRefs", () => {
	it("writes to object refs", () => {
		const a = React.createRef<HTMLDivElement>();
		const b = React.createRef<HTMLDivElement>();

		const node = document.createElement("div");
		const ref = composeRefs<HTMLDivElement>(a, b);

		ref(node as any);

		expect(a.current).toBe(node);
		expect(b.current).toBe(node);
	});

	it("calls function refs", () => {
		const fn1 = vi.fn();
		const fn2 = vi.fn();

		const node = document.createElement("div");
		const ref = composeRefs<HTMLDivElement>(fn1, fn2);

		ref(node as any);

		expect(fn1).toHaveBeenCalledTimes(1);
		expect(fn2).toHaveBeenCalledTimes(1);
		expect(fn1).toHaveBeenCalledWith(node);
		expect(fn2).toHaveBeenCalledWith(node);
	});

	it("supports mixed object + function refs and skips undefined", () => {
		const obj = React.createRef<HTMLDivElement>();
		const fn = vi.fn();

		const node = document.createElement("div");
		const ref = composeRefs<HTMLDivElement>(undefined, obj, fn, undefined);

		ref(node as any);

		expect(obj.current).toBe(node);
		expect(fn).toHaveBeenCalledWith(node);
	});

	it("handles null (unmount)", () => {
		const obj = React.createRef<HTMLDivElement>();
		const fn = vi.fn();
		const ref = composeRefs<HTMLDivElement>(obj, fn);

		ref(null);

		expect(obj.current).toBe(null);
		expect(fn).toHaveBeenCalledWith(null);
	});
});
