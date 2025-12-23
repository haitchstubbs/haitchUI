import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button } from "@haitch/ui";
import { runButtonLikeContract } from "../contracts/buttonLike";
import { expectClassInvariants } from "../lib/classInvariants";
import { expectNoA11yViolations } from "../lib/a11y";
import { runSlotContract } from "../contracts/slot";

describe("Button", () => {
	runButtonLikeContract("Button", [
		{
			label: "native <Button>",
			role: "button",
			render: (p) => (
				<Button disabled={p.disabled} onClick={p.onClick} className={p.className}>
					Button
				</Button>
			),
			disabledMode: "native",
			keyboardActivates: true,
		},
		{
			label: "asChild with <a> (link semantics)",
			role: "link",
			render: (p) => (
				<Button asChild onClick={p.onClick} className={p.className}>
					<a href="/docs" aria-disabled={p.disabled ? "true" : undefined}>
						Button
					</a>
				</Button>
			),
			// links don't have a native disabled, so we treat it as none by default
			// you can set disabledMode:"aria" if you decide to support it as a documented contract
			disabledMode: "none",
			keyboardActivates: false,
		},
		{
			label: "asChild with <button> (button semantics)",
			role: "button",
			render: (p) => (
				<Button asChild onClick={p.onClick} className={p.className}>
					<button disabled={p.disabled}>Button</button>
				</Button>
			),
			disabledMode: "native",
			keyboardActivates: true,
		},
	]);

	it("renders stable slot + variant data attributes", () => {
		render(
			<Button variant="default" size="default">
				Button
			</Button>
		);
		const btn = screen.getByRole("button", { name: /button/i });

		expect(btn).toHaveAttribute("data-slot", "button");
		expect(btn).toHaveAttribute("data-variant", "default");
		expect(btn).toHaveAttribute("data-size", "default");
	});

	it("includes required class invariants for layout + interaction", () => {
		render(<Button>Button</Button>);
		const btn = screen.getByRole("button", { name: /button/i });

		expectClassInvariants(btn, [
			"inline-flex",
			"items-center",
			"justify-center",
			"disabled:pointer-events-none",
			"disabled:opacity-50",
			"outline-none",
			"focus-visible:ring-[3px]",
		]);
	});

	it("axe smoke (default)", async () => {
		const { container } = render(<Button>Button</Button>);
		await expectNoA11yViolations(container);
	});
});

describe("Button", () => {
	runSlotContract(
		"Button",
		(args) => (
			<Button
				asChild
				className={args.className}
				style={args.style}
				onClick={args.onClick}
				data-x={args["data-x"]}
				aria-label={args["aria-label"]}
				ref={args.ref as any}
			>
				<a
					href="/docs"
					className="child-class"
					style={{ opacity: 1, paddingLeft: "12px" }}
					// IMPORTANT: wire the contract child handler, and prevent jsdom navigation noise
					onClick={(e) => {
						e.preventDefault();
						args.childOnClick?.(e);
					}}
					ref={args.childRef as any}
				>
					Button
				</a>
			</Button>
		),
		{ role: "link", label: /button/i }
	);
});
