import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Root } from "./accordion-root";
import { Item } from "../accordion-item";
import { Header } from "../accordion-header";
import { Trigger } from "../accordion-trigger";
import { Content } from "../accordion-content";

const AccordionItems = () => (
	<>
		<Item value="one" data-testid="item-one">
			<Header data-testid="header-one">
				<Trigger data-testid="trigger-one">One</Trigger>
			</Header>
			<Content data-testid="content-one">One content</Content>
		</Item>
		<Item value="two" data-testid="item-two">
			<Header data-testid="header-two">
				<Trigger data-testid="trigger-two">Two</Trigger>
			</Header>
			<Content data-testid="content-two">Two content</Content>
		</Item>
	</>
);

describe("Accordion Root", () => {
	it("applies orientation, dir, and disabled data attributes", () => {
		render(
			<Root type="single" orientation="horizontal" dir="rtl" disabled data-testid="root">
				<AccordionItems />
			</Root>
		);

		const root = screen.getByTestId("root");
		expect(root).toHaveAttribute("data-slot", "accordion");
		expect(root).toHaveAttribute("data-orientation", "horizontal");
		expect(root).toHaveAttribute("dir", "rtl");
		expect(root).toHaveAttribute("data-disabled", "");
	});

	it("allows only one item open at a time in single mode", async () => {
		const user = userEvent.setup();
		render(
			<Root type="single">
				<AccordionItems />
			</Root>
		);

		expect(screen.queryByText("One content")).toBeNull();
		await user.click(screen.getByTestId("trigger-one"));
		expect(screen.getByText("One content")).toBeInTheDocument();

		await user.click(screen.getByTestId("trigger-two"));
		expect(screen.queryByText("One content")).toBeNull();
		expect(screen.getByText("Two content")).toBeInTheDocument();
	});

	it("does not collapse a single item by default", async () => {
		const user = userEvent.setup();
		render(
			<Root type="single" defaultValue="one">
				<AccordionItems />
			</Root>
		);

		expect(screen.getByText("One content")).toBeInTheDocument();
		await user.click(screen.getByTestId("trigger-one"));
		expect(screen.getByText("One content")).toBeInTheDocument();
	});

	it("supports collapsible single accordions", async () => {
		const user = userEvent.setup();
		render(
			<Root type="single" collapsible defaultValue="one">
				<AccordionItems />
			</Root>
		);

		expect(screen.getByText("One content")).toBeInTheDocument();
		await user.click(screen.getByTestId("trigger-one"));
		expect(screen.queryByText("One content")).toBeNull();
	});

	it("allows multiple items open in multiple mode", async () => {
		const user = userEvent.setup();
		render(
			<Root type="multiple">
				<AccordionItems />
			</Root>
		);

		await user.click(screen.getByTestId("trigger-one"));
		await user.click(screen.getByTestId("trigger-two"));

		expect(screen.getByText("One content")).toBeInTheDocument();
		expect(screen.getByText("Two content")).toBeInTheDocument();
	});

	it("supports controlled single value", async () => {
		const user = userEvent.setup();
		const onValueChange = vi.fn();

		function Controlled() {
			const [value, setValue] = React.useState<string>("");
			return (
				<Root
					type="single"
					value={value}
					onValueChange={(next) => {
						onValueChange(next);
						setValue(next);
					}}
				>
					<AccordionItems />
				</Root>
			);
		}

		render(<Controlled />);

		await user.click(screen.getByTestId("trigger-one"));
		expect(onValueChange).toHaveBeenCalledWith("one");
		expect(screen.getByText("One content")).toBeInTheDocument();
	});

	it("supports asChild to swap the root element", () => {
		render(
			<Root type="single" asChild data-testid="root">
				<section>
					<AccordionItems />
				</section>
			</Root>
		);

		const root = screen.getByTestId("root");
		expect(root.tagName).toBe("SECTION");
		expect(root).toHaveAttribute("data-slot", "accordion");
	});
});
