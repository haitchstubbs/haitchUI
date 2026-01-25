import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OverlayDOMProvider } from "@/primitives/overlay";
import { Root } from "../alert-dialog-root";
import { Content } from "../alert-dialog-content";
import { Action } from "./alert-dialog-action";

describe("AlertDialog Action", () => {
	it("closes the dialog and calls onClick", async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();

		render(
			<OverlayDOMProvider>
				<Root defaultOpen>
					<Content data-testid="content">
						<Action onClick={onClick}>Confirm</Action>
					</Content>
				</Root>
			</OverlayDOMProvider>
		);

		await user.click(screen.getByRole("button", { name: "Confirm" }));

		expect(onClick).toHaveBeenCalledTimes(1);
		expect(screen.getByTestId("content")).toHaveAttribute("hidden");
	});

	it("does not close when disabled", async () => {
		const user = userEvent.setup();

		render(
			<OverlayDOMProvider>
				<Root defaultOpen disabled>
					<Content data-testid="content">
						<Action>Confirm</Action>
					</Content>
				</Root>
			</OverlayDOMProvider>
		);

		const action = screen.getByRole("button", { name: "Confirm" });
		expect(action).toHaveAttribute("aria-disabled", "true");

		await user.click(action);
		expect(screen.getByTestId("content")).toHaveAttribute("aria-hidden", "false");
	});

	it("supports asChild to swap the element", async () => {
		const user = userEvent.setup();

		render(
			<OverlayDOMProvider>
				<Root defaultOpen>
					<Content data-testid="content">
						<Action asChild data-testid="action-link">
							<a href="#confirm">Confirm</a>
						</Action>
					</Content>
				</Root>
			</OverlayDOMProvider>
		);

		const action = screen.getByTestId("action-link");
		expect(action.tagName).toBe("A");

		await user.click(action);
		expect(screen.getByTestId("content")).toHaveAttribute("hidden");
	});
});
