import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OverlayDOMProvider } from "@/primitives/overlay";
import { Root } from "../alert-dialog-root";
import { Content } from "../alert-dialog-content";
import { Cancel } from "./alert-dialog-cancel";

describe("AlertDialog Cancel", () => {
	it("focuses the cancel action and closes the dialog", async () => {
		const user = userEvent.setup();

		render(
			<OverlayDOMProvider>
				<Root defaultOpen>
					<Content data-testid="content">
						<Cancel>Cancel</Cancel>
					</Content>
				</Root>
			</OverlayDOMProvider>
		);

		const cancel = screen.getByRole("button", { name: "Cancel" });
		await waitFor(() => expect(cancel).toHaveFocus());

		await user.click(cancel);
		expect(screen.getByTestId("content")).toHaveAttribute("hidden");
	});

	it("supports asChild to swap the element", async () => {
		const user = userEvent.setup();

		render(
			<OverlayDOMProvider>
				<Root defaultOpen>
					<Content data-testid="content">
						<Cancel asChild data-testid="cancel-link">
							<a href="#cancel">Cancel</a>
						</Cancel>
					</Content>
				</Root>
			</OverlayDOMProvider>
		);

		const cancel = screen.getByTestId("cancel-link");
		expect(cancel.tagName).toBe("A");

		await user.click(cancel);
		expect(screen.getByTestId("content")).toHaveAttribute("hidden");
	});
});
