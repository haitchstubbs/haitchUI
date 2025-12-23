import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

import { Button } from "@haitch/ui";
import { ShadowRootHost } from "@haitch/ui";

function getClassTokens(el: HTMLElement) {
	return (el.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

function getButtonByName(name: RegExp) {
	return screen.getByRole("button", { name }) as HTMLButtonElement;
}

describe("Button (haitch) — semantics, a11y, and DOM parity", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
	});

	it("renders a native <button> by default with expected data attributes", () => {
		render(<Button>Click me</Button>);

		const btn = getButtonByName(/click me/i);

		expect(btn.tagName.toLowerCase()).toBe("button");
		expect(btn).toHaveAttribute("data-slot", "button");
		expect(btn).toHaveAttribute("data-variant", "default");
		expect(btn).toHaveAttribute("data-size", "default");
	});

	it("has base class signals applied (not a full snapshot)", () => {
		render(<Button>Base</Button>);
		const btn = getButtonByName(/base/i);
		const tokens = getClassTokens(btn);

		expect(tokens).toContain("inline-flex");
		expect(tokens).toContain("items-center");
		expect(tokens).toContain("justify-center");
		expect(tokens).toContain("transition-all");
		expect(tokens).toContain("outline-none");

		// SVG helper selectors should exist
		expect(tokens).toContain("[&_svg]:pointer-events-none");
		expect(tokens).toContain("[&_svg]:shrink-0");
	});

	it("applies default variant + default size class signals", () => {
		render(<Button>Default</Button>);
		const btn = getButtonByName(/default/i);
		const tokens = getClassTokens(btn);

		// Variant signals
		expect(tokens).toContain("bg-primary");
		expect(tokens).toContain("text-primary-foreground");
		expect(tokens).toContain("hover:bg-primary/90");

		// Size signals
		expect(tokens).toContain("h-9");
		expect(tokens).toContain("px-4");
		expect(tokens).toContain("py-2");
		expect(tokens).toContain("has-[>svg]:px-3");
	});

	it("merges className with computed variant classes", () => {
		render(
			<Button className="my-custom-class another-class" variant="secondary">
				Merge
			</Button>
		);

		const btn = getButtonByName(/merge/i);
		expect(btn).toHaveClass("my-custom-class");
		expect(btn).toHaveClass("another-class");
		expect(btn).toHaveClass("bg-secondary");
		expect(btn).toHaveAttribute("data-variant", "secondary");
	});

	it("supports native button props passthrough (type, aria-*, data-*)", () => {
		render(
			<Button type="submit" aria-label="Save changes" data-testid="save-btn" data-foo="bar">
				Save
			</Button>
		);

		const btn = screen.getByTestId("save-btn");
		expect(btn).toHaveAttribute("type", "submit");
		expect(btn).toHaveAttribute("aria-label", "Save changes");
		expect(btn).toHaveAttribute("data-foo", "bar");
	});

	it("fires onClick when enabled (mouse)", async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();

		render(<Button onClick={onClick}>Click</Button>);
		await user.click(getButtonByName(/click/i));

		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("fires onClick via keyboard (Enter) when focused", async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();

		render(<Button onClick={onClick}>Keyboard</Button>);
		const btn = getButtonByName(/keyboard/i);

		btn.focus();
		expect(btn).toHaveFocus();

		await user.keyboard("[Enter]");
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("fires onClick via keyboard (Space) when focused", async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();

		render(<Button onClick={onClick}>Space</Button>);
		const btn = getButtonByName(/space/i);

		btn.focus();
		expect(btn).toHaveFocus();

		await user.keyboard("[Space]");
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("does not fire onClick when disabled (native behavior)", async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();

		render(
			<Button disabled onClick={onClick}>
				Disabled
			</Button>
		);

		const btn = getButtonByName(/disabled/i);
		expect(btn).toBeDisabled();

		await user.click(btn);
		expect(onClick).toHaveBeenCalledTimes(0);
	});

	it("disabled buttons are not focusable and do not activate via keyboard", async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();

		render(
			<Button disabled onClick={onClick}>
				Disabled
			</Button>
		);

		const btn = getButtonByName(/disabled/i);

		// Disabled native buttons cannot receive focus
		btn.focus();
		expect(btn).not.toHaveFocus();

		// Even if keyboard events happen, the button should not activate
		await user.keyboard("[Enter]");
		await user.keyboard("[Space]");
		expect(onClick).toHaveBeenCalledTimes(0);
	});

	it("sets correct data attributes when variant and size are provided", () => {
		render(
			<Button variant="destructive" size="lg">
				Delete
			</Button>
		);

		const btn = getButtonByName(/delete/i);
		expect(btn).toHaveAttribute("data-variant", "destructive");
		expect(btn).toHaveAttribute("data-size", "lg");
	});

	it("applies class signals for each variant", () => {
		const cases: Array<{ variant: any; expected: string[] }> = [
			{ variant: "default", expected: ["bg-primary", "text-primary-foreground"] },
			{ variant: "destructive", expected: ["bg-destructive", "text-white"] },
			{ variant: "outline", expected: ["border", "bg-background"] },
			{ variant: "secondary", expected: ["bg-secondary", "text-secondary-foreground"] },
			{ variant: "ghost", expected: ["hover:bg-accent"] },
			{ variant: "link", expected: ["underline-offset-4", "hover:underline"] },
		];

		for (const c of cases) {
			const { unmount } = render(<Button variant={c.variant}>{String(c.variant)}</Button>);
			const btn = getButtonByName(new RegExp(String(c.variant), "i"));

			for (const token of c.expected) expect(btn).toHaveClass(token);

			unmount();
		}
	});

	it("applies class signals for each size", () => {
		const cases: Array<{ size: any; expected: string[] }> = [
			{ size: "default", expected: ["h-9", "px-4", "py-2"] },
			{ size: "sm", expected: ["h-8", "px-3"] },
			{ size: "lg", expected: ["h-10", "px-6"] },
			{ size: "icon", expected: ["size-9"] },
			{ size: "icon-sm", expected: ["size-8"] },
			{ size: "icon-lg", expected: ["size-10"] },
		];

		for (const c of cases) {
			const { unmount } = render(<Button size={c.size}>{String(c.size)}</Button>);
			const btn = getButtonByName(new RegExp(String(c.size), "i"));

			for (const token of c.expected) expect(btn).toHaveClass(token);

			unmount();
		}
	});

	it("icon child does not break base classes; svg helper selectors exist", () => {
		render(
			<Button>
				<svg aria-hidden="true" />
				With icon
			</Button>
		);

		const btn = getButtonByName(/with icon/i);
		expect(btn).toHaveClass("inline-flex");

		const tokens = getClassTokens(btn);
		expect(tokens).toContain("[&_svg]:pointer-events-none");
		expect(tokens).toContain("[&_svg]:shrink-0");
		expect(tokens).toContain("[&_svg:not([class*='size-'])]:size-4");
	});

	it("ref forwards to <button> by default", () => {
		const ref = React.createRef<HTMLElement>();
		render(<Button ref={ref}>Ref</Button>);

		expect(ref.current).toBeInstanceOf(HTMLElement);
		expect(ref.current?.tagName.toLowerCase()).toBe("button");
		expect(ref.current).toHaveAttribute("data-slot", "button");
	});

	it("asChild renders the child element instead of a <button>", () => {
		render(
			<Button asChild>
				<a href="/docs">Docs</a>
			</Button>
		);

		const link = screen.getByRole("link", { name: /docs/i });
		expect(link.tagName.toLowerCase()).toBe("a");

		// still gets button attrs applied
		expect(link).toHaveAttribute("data-slot", "button");
		expect(link).toHaveAttribute("data-variant", "default");
		expect(link).toHaveAttribute("data-size", "default");

		// base styling applied to child element
		expect(link).toHaveClass("inline-flex");
	});

	it("asChild merges className onto the child element", () => {
		render(
			<Button asChild className="child-extra">
				<a href="/docs">Docs</a>
			</Button>
		);

		const link = screen.getByRole("link", { name: /docs/i });
		expect(link).toHaveClass("child-extra");
		expect(link).toHaveClass("inline-flex"); // base class signal
	});

	it("asChild composes onClick handlers (child then parent) using Slot composition", async () => {
		const user = userEvent.setup();
		const parentClick = vi.fn();
		const childClick = vi.fn();

		render(
			<Button asChild onClick={parentClick}>
				<a href="/docs" onClick={childClick}>
					Docs
				</a>
			</Button>
		);

		const link = screen.getByRole("link", { name: /docs/i });
		await user.click(link);

		expect(childClick).toHaveBeenCalledTimes(1);
		expect(parentClick).toHaveBeenCalledTimes(1);
	});

	it("asChild forwards ref to the child element", () => {
		const ref = React.createRef<HTMLElement>();

		render(
			<Button asChild ref={ref}>
				<a href="/x">X</a>
			</Button>
		);

		expect(ref.current).toBeInstanceOf(HTMLElement);
		expect(ref.current?.tagName.toLowerCase()).toBe("a");
		expect(ref.current).toHaveAttribute("href", "/x");
		expect(ref.current).toHaveAttribute("data-slot", "button");
	});

	it("form behavior: default button type inside a form is submit", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn((e: React.FormEvent<HTMLFormElement>) => e.preventDefault());

		render(
			<form onSubmit={onSubmit}>
				<Button>Submit</Button>
			</form>
		);

		await user.click(getButtonByName(/submit/i));
		expect(onSubmit).toHaveBeenCalledTimes(1);
	});

	it("form behavior: type='button' does not submit", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn((e: React.FormEvent<HTMLFormElement>) => e.preventDefault());

		render(
			<form onSubmit={onSubmit}>
				<Button type="button">No submit</Button>
			</form>
		);

		await user.click(getButtonByName(/no submit/i));
		expect(onSubmit).toHaveBeenCalledTimes(0);
	});

	it("form behavior: type='reset' resets uncontrolled inputs", async () => {
		const user = userEvent.setup();

		render(
			<form>
				<input aria-label="Name" defaultValue="Hunter" />
				<Button type="reset">Reset</Button>
			</form>
		);

		const input = screen.getByLabelText(/name/i) as HTMLInputElement;
		expect(input.value).toBe("Hunter");

		// change value then reset
		await user.clear(input);
		await user.type(input, "X");
		expect(input.value).toBe("X");

		await user.click(getButtonByName(/reset/i));
		expect(input.value).toBe("Hunter");
	});

	it("aria-invalid styling hook: setting aria-invalid should be reflected as an attribute", () => {
		render(<Button aria-invalid="true">Invalid</Button>);
		const btn = getButtonByName(/invalid/i);
		expect(btn).toHaveAttribute("aria-invalid", "true");
	});
});

describe("Button — Shadow DOM compatibility", () => {
	beforeEach(() => {
		document.body.innerHTML = "";
	});

	it("renders and is clickable inside ShadowRootHost", async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();

		render(
			<ShadowRootHost>
				<Button onClick={onClick}>Shadow</Button>
			</ShadowRootHost>
		);

		const host = document.body.firstElementChild as HTMLElement;
		const shadow = (host as any).shadowRoot as ShadowRoot;
		expect(shadow).toBeTruthy();

		const btn = shadow.querySelector('[data-slot="button"]') as HTMLButtonElement | null;
		expect(btn).toBeTruthy();
		expect(btn!.tagName.toLowerCase()).toBe("button");

		await user.click(btn!);
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("asChild works inside ShadowRootHost", async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();

		render(
			<ShadowRootHost>
				<Button asChild onClick={onClick} className="xtra">
					<a href="/docs">Docs</a>
				</Button>
			</ShadowRootHost>
		);

		const host = document.body.firstElementChild as HTMLElement;
		const shadow = (host as any).shadowRoot as ShadowRoot;

		const link = shadow.querySelector("a[href='/docs']") as HTMLAnchorElement | null;
		expect(link).toBeTruthy();
		expect(link!).toHaveAttribute("data-slot", "button");
		expect(link!).toHaveClass("xtra");

		await user.click(link!);
		expect(onClick).toHaveBeenCalledTimes(1);
	});
});
