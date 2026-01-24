import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Root } from "../accordion-root";
import { Item } from "../accordion-item";
import { Header } from "../accordion-header";
import { Trigger } from "../accordion-trigger";
import { Content } from "./accordion-content";

describe("Accordion Content", () => {
	it("unmounts when closed by default", async () => {
		const user = userEvent.setup();

		render(
			<Root type="single">
				<Item value="one">
					<Header>
						<Trigger>One</Trigger>
					</Header>
					<Content>One content</Content>
				</Item>
			</Root>
		);

		expect(screen.queryByText("One content")).toBeNull();
		await user.click(screen.getByRole("button", { name: "One" }));
		expect(screen.getByText("One content")).toBeInTheDocument();
	});

	it("keeps content mounted when forceMount is true", async () => {
		const user = userEvent.setup();

		render(
			<Root type="single" collapsible>
				<Item value="one">
					<Header>
						<Trigger>One</Trigger>
					</Header>
					<Content forceMount data-testid="content-one">
						One content
					</Content>
				</Item>
			</Root>
		);

		const content = screen.getByTestId("content-one");
		expect(content).toHaveAttribute("hidden");

		await user.click(screen.getByRole("button", { name: "One" }));
		expect(content).not.toHaveAttribute("hidden");
		expect(content).toHaveAttribute("data-state", "open");
	});

	it("supports asChild and applies sizing CSS variables", async () => {
		const user = userEvent.setup();

		render(
			<Root type="single" defaultValue="one">
				<Item value="one">
					<Header>
						<Trigger>One</Trigger>
					</Header>
					<Content asChild data-testid="content-one">
						<section>One content</section>
					</Content>
				</Item>
			</Root>
		);

		const content = screen.getByTestId("content-one");
		expect(content.tagName).toBe("SECTION");
		expect(content).toHaveAttribute("role", "region");
		expect(content.style.getPropertyValue("--radix-accordion-content-height")).toBe("0px");
		expect(content.style.getPropertyValue("--radix-accordion-content-width")).toBe("0px");

		await user.click(screen.getByRole("button", { name: "One" }));
		expect(screen.getByText("One content")).toBeInTheDocument();
	});
});
