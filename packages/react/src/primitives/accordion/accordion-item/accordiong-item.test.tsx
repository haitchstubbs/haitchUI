import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Root } from "../accordion-root";
import { Item } from "./accordion-item";
import { Header } from "../accordion-header";
import { Trigger } from "../accordion-trigger";
import { Content } from "../accordion-content";

describe("Accordion Item", () => {
	it("reflects open state and orientation on the item", async () => {
		const user = userEvent.setup();
		render(
			<Root type="single" collapsible orientation="horizontal">
				<Item value="one" data-testid="item-one">
					<Header>
						<Trigger>One</Trigger>
					</Header>
					<Content>One content</Content>
				</Item>
			</Root>
		);

		const item = screen.getByTestId("item-one");
		expect(item).toHaveAttribute("data-state", "closed");
		expect(item).toHaveAttribute("data-orientation", "horizontal");

		await user.click(screen.getByRole("button", { name: "One" }));
		expect(item).toHaveAttribute("data-state", "open");

		await user.click(screen.getByRole("button", { name: "One" }));
		expect(item).toHaveAttribute("data-state", "closed");
	});

	it("marks items as disabled when the item itself is disabled", () => {
		render(
			<Root type="single">
				<Item value="one" disabled data-testid="item-one">
					<Header>
						<Trigger>One</Trigger>
					</Header>
					<Content>One content</Content>
				</Item>
			</Root>
		);

		expect(screen.getByTestId("item-one")).toHaveAttribute("data-disabled", "");
	});

	it("supports asChild to swap the item element", () => {
		render(
			<Root type="single">
				<Item value="one" asChild data-testid="item-one">
					<li>
						<Header>
							<Trigger>One</Trigger>
						</Header>
						<Content>One content</Content>
					</li>
				</Item>
			</Root>
		);

		const item = screen.getByTestId("item-one");
		expect(item.tagName).toBe("LI");
		expect(item).toHaveAttribute("data-slot", "accordion-item");
	});
});
