// Slot.test.tsx
// Vitest + React Testing Library tests for Slot
//
// Assumes:
// - test environment is jsdom
// - you have @testing-library/react + @testing-library/user-event installed
// - Slot is exported from "./Slot" (adjust import as needed)

import React from "react";
import { fireEvent, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Slot } from "./slot";

describe("Slot", () => {
	it("throws if there is no non-whitespace child", () => {
		expect(() =>
			render(
				<Slot>
					{"   "}
					{"\n"}
					{"\t"}
				</Slot>
			)
		).toThrowError(/Received 0 non-whitespace children/i);
	});

	it("ignores whitespace-only text nodes when counting children", () => {
		expect(() =>
			render(
				<Slot data-testid="x">
					{"\n  "}
					<button type="button">ok</button>
					{"  \n"}
				</Slot>
			)
		).not.toThrow();
	});

	it("throws if there are multiple non-whitespace children", () => {
		expect(() =>
			render(
				<Slot>
					{"\n"}
					<button type="button">one</button>
					{"\n"}
					<button type="button">two</button>
					{"\n"}
				</Slot>
			)
		).toThrowError(/Received 2 non-whitespace children/i);
	});

	it("throws if the single non-whitespace child is not a valid React element (e.g. string)", () => {
		expect(() => render(<Slot>{"hello"}</Slot>)).toThrowError(/expects a single valid React element child/i);
	});

	it("throws if the single non-whitespace child is not a valid React element (e.g. number)", () => {
		expect(() => render(<Slot>{123}</Slot>)).toThrowError(/expects a single valid React element child/i);
	});

	it("throws if the child is a React.Fragment", () => {
		expect(() =>
			render(
				<Slot>
					<>
						<span>nope</span>
					</>
				</Slot>
			)
		).toThrowError(/must be a single element, not a React\.Fragment/i);
	});

	it("merges props with slotProps winning by default", () => {
		const { getByTestId } = render(
			<Slot id="slot-id" data-testid="el" aria-label="slot-label">
				<button id="child-id" aria-label="child-label" type="button">
					ok
				</button>
			</Slot>
		);

		const el = getByTestId("el");
		expect(el).toHaveAttribute("id", "slot-id");
		expect(el).toHaveAttribute("aria-label", "slot-label");
	});

	it("merges className by concatenating child + slot", () => {
		const { getByTestId } = render(
			<Slot className="slot" data-testid="el">
				<button className="child" type="button">
					ok
				</button>
			</Slot>
		);

		expect(getByTestId("el").className).toBe("child slot");
	});

	it("uses whichever className exists if only one side provides it", () => {
		const { getByTestId: getA } = render(
			<Slot data-testid="a">
				<button className="child" type="button">
					ok
				</button>
			</Slot>
		);
		expect(getA("a").className).toBe("child");

		const { getByTestId: getB } = render(
			<Slot className="slot" data-testid="b">
				<button type="button">ok</button>
			</Slot>
		);
		expect(getB("b").className).toBe("slot");
	});

	it("merges style shallowly with slot style winning on conflicts", () => {
		const { getByTestId } = render(
			<Slot data-testid="el" style={{ color: "red", padding: "10px" }}>
				<button type="button" style={{ color: "blue", margin: "4px" }}>
					ok
				</button>
			</Slot>
		);

		const el = getByTestId("el") as HTMLElement;
		// JSDOM style string order can vary; check specific properties.
		expect(el.style.color).toBe("red"); // slot wins
		expect(el.style.padding).toBe("10px"); // from slot
		expect(el.style.margin).toBe("4px"); // from child
	});

	it("composes event handlers (child runs first, then slot)", async () => {
		const user = userEvent.setup();
		const calls: string[] = [];

		const onChildClick = vi.fn(() => calls.push("child"));
		const onSlotClick = vi.fn(() => calls.push("slot"));

		const { getByRole } = render(
			<Slot onClick={onSlotClick}>
				<button onClick={onChildClick} type="button">
					ok
				</button>
			</Slot>
		);

		await user.click(getByRole("button"));

		expect(onChildClick).toHaveBeenCalledTimes(1);
		expect(onSlotClick).toHaveBeenCalledTimes(1);
		expect(calls).toEqual(["child", "slot"]);
	});

	it("does not override event handler if only one side provides it", () => {
		const onChildClick = vi.fn();
		const onSlotClick = vi.fn();

		const { getByRole: getA, unmount } = render(
			<Slot>
				<button onClick={onChildClick} type="button">
					ok
				</button>
			</Slot>
		);

		fireEvent.click(getA("button"));
		expect(onChildClick).toHaveBeenCalledTimes(1);

		unmount();

		const { getByRole: getB } = render(
			<Slot onClick={onSlotClick}>
				<button type="button">ok</button>
			</Slot>
		);

		fireEvent.click(getB("button"));
		expect(onSlotClick).toHaveBeenCalledTimes(1);
	});

	it("composes forwarded ref with child's existing ref (object ref)", () => {
		const childRef = React.createRef<HTMLButtonElement>();
		const forwardedRef = React.createRef<HTMLButtonElement>();

		render(
			<Slot ref={forwardedRef}>
				<button ref={childRef} type="button">
					ok
				</button>
			</Slot>
		);

		expect(childRef.current).toBeInstanceOf(HTMLButtonElement);
		expect(forwardedRef.current).toBeInstanceOf(HTMLButtonElement);
		expect(childRef.current).toBe(forwardedRef.current);
	});

	it("composes forwarded ref with child's existing ref (callback ref)", () => {
		const childCb = vi.fn<(el: HTMLButtonElement | null) => void>();
		const forwardedRef = React.createRef<HTMLButtonElement>();

		render(
			<Slot ref={forwardedRef}>
				<button ref={childCb} type="button">
					ok
				</button>
			</Slot>
		);

		// callback ref may be invoked more than once in strict mode; just ensure it was called with an element at least once
		expect(childCb).toHaveBeenCalled();
		const anyElementCall = childCb.mock.calls.some(([arg]) => arg instanceof HTMLButtonElement);
		expect(anyElementCall).toBe(true);

		expect(forwardedRef.current).toBeInstanceOf(HTMLButtonElement);
	});

	it("passes through non-special props (e.g., data-*, aria-*)", () => {
		const { getByRole } = render(
			<Slot data-foo="bar" aria-label="wrapped">
				<button type="button">ok</button>
			</Slot>
		);

		const btn = getByRole("button");
		expect(btn).toHaveAttribute("data-foo", "bar");
		expect(btn).toHaveAttribute("aria-label", "wrapped");
	});

	it("prefers slot props over child props for non-merged keys (e.g., type)", () => {
		const { getByRole } = render(
			<Slot type="submit">
				<button type="button">ok</button>
			</Slot>
		);

		const btn = getByRole("button");
		expect(btn).toHaveAttribute("type", "submit");
	});

	it("does not treat non-whitespace strings as ignorable children", () => {
		expect(() =>
			render(
				<Slot>
					{"x"}
					<button type="button">ok</button>
				</Slot>
			)
		).toThrowError(/Received 2 non-whitespace children/i);
	});
});
