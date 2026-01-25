import { describe, it, expect, vi } from "vitest";
import { focusEl } from "./focusEl.js";
describe("focusEl", () => {
    it("calls focus on the element when it is not null", () => {
        const el = document.createElement("div");
        el.focus = vi.fn();
        focusEl(el);
        expect(el.focus).toHaveBeenCalled();
    });

    it("does not throw when the element is null", () => {
        expect(() => focusEl(null)).not.toThrow();
    });

    it("does not throw when the element does not have a focus method", () => {
        const el = document.createElement("div");
        expect(() => focusEl(el)).not.toThrow();
    });
});