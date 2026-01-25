import React, { createRef } from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Root as AspectRatio } from "../aspect-ratio-root";

/**
 * NOTE:
 * We test behavior via DOM + styles rather than implementation details.
 * This keeps the tests resilient if internals change.
 */

describe("AspectRatio", () => {
	it("renders a root wrapper with default 1:1 ratio", () => {
		render(
			<AspectRatio data-testid="content">
				<div>Content</div>
			</AspectRatio>,
		);

		const root = document.querySelector("[data-aspect-ratio-root]");
		expect(root).toBeInTheDocument();

		// 1 / 1 → 100%
		expect(root).toHaveStyle({
			position: "relative",
			width: "100%",
			paddingBottom: "100%",
		});
	});

	it("applies a custom ratio correctly", () => {
		render(
			<AspectRatio ratio={16 / 9} data-testid="content">
				<div>Content</div>
			</AspectRatio>,
		);

		const root = document.querySelector("[data-aspect-ratio-root]");
		expect(root).toHaveStyle({
			paddingBottom: `${100 / (16 / 9)}%`,
		});
	});

	it("positions the inner element absolutely", () => {
		render(
			<AspectRatio data-testid="inner">
				<div>Content</div>
			</AspectRatio>,
		);

		const inner = screen.getByTestId("inner");

		expect(inner).toHaveStyle({
			position: "absolute",
			top: "0px",
			right: "0px",
			bottom: "0px",
			left: "0px",
		});
	});

	it("merges custom styles with internal positioning styles", () => {
		render(
			<AspectRatio
				data-testid="inner"
				// use a style that won't be normalized by jsdom
				style={{ zIndex: 123, position: "relative" }}
			>
				<div>Content</div>
			</AspectRatio>,
		);

		const inner = screen.getByTestId("inner");

		// custom style survives
		expect(inner.style.zIndex).toBe("123");

		// internal styles still win (should override user's position)
		expect(inner).toHaveStyle("position: absolute");
	});

	it("forwards refs to the inner element", () => {
		const ref = createRef<HTMLDivElement>();

		render(
			<AspectRatio ref={ref}>
				<div>Content</div>
			</AspectRatio>,
		);

		expect(ref.current).toBeInstanceOf(HTMLDivElement);
	});

	it("renders children directly when using asChild", () => {
		render(
			<AspectRatio asChild>
				<button data-testid="child">Click me</button>
			</AspectRatio>,
		);

		const child = screen.getByTestId("child");
		expect(child.tagName).toBe("BUTTON");

		// Still positioned absolutely
		expect(child).toHaveStyle({
			position: "absolute",
		});
	});

	it("does not remove event handlers when using asChild", async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();

		render(
			<AspectRatio asChild>
				<button onClick={onClick}>Click</button>
			</AspectRatio>,
		);

		await user.click(screen.getByRole("button"));
		expect(onClick).toHaveBeenCalledTimes(1);
	});
});
