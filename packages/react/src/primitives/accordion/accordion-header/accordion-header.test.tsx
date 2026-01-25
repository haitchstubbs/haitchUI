import React from "react";
import { render, screen } from "@testing-library/react";
import { Root } from "../accordion-root";
import { Item } from "../accordion-item";
import { Header } from "./accordion-header";
import { Trigger } from "../accordion-trigger";
import { Content } from "../accordion-content";

describe("Accordion Header", () => {
	it("renders a heading element by default with state attributes", () => {
		render(
			<Root type="single" defaultValue="one">
				<Item value="one">
					<Header data-testid="header-one">
						<Trigger>One</Trigger>
					</Header>
					<Content>One content</Content>
				</Item>
			</Root>
		);

		const header = screen.getByTestId("header-one");
		expect(header.tagName).toBe("H3");
		expect(header).toHaveAttribute("data-state", "open");
	});

	it("marks headers as disabled when the item is disabled", () => {
		render(
			<Root type="single">
				<Item value="one" disabled>
					<Header data-testid="header-one">
						<Trigger>One</Trigger>
					</Header>
					<Content>One content</Content>
				</Item>
			</Root>
		);

		expect(screen.getByTestId("header-one")).toHaveAttribute("data-disabled", "");
	});

	it("supports asChild to swap the header element", () => {
		render(
			<Root type="single">
				<Item value="one">
					<Header asChild data-testid="header-one">
						<div>
							<Trigger>One</Trigger>
						</div>
					</Header>
					<Content>One content</Content>
				</Item>
			</Root>
		);

		const header = screen.getByTestId("header-one");
		expect(header.tagName).toBe("DIV");
		expect(header).toHaveAttribute("data-slot", "accordion-header");
	});
});
