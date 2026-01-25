import React from "react";
import { render, screen } from "@testing-library/react";
import { OverlayDOMProvider } from "@/primitives/overlay";
import { Root } from "../alert-dialog-root";
import { Content } from "../alert-dialog-content";
import { Description } from "./alert-dialog-description";

describe("AlertDialog Description", () => {
	it("renders a paragraph and connects to the content description", () => {
		render(
			<OverlayDOMProvider>
				<Root defaultOpen>
					<Content>
						<Description data-testid="description">Be careful.</Description>
					</Content>
				</Root>
			</OverlayDOMProvider>
		);

		const description = screen.getByTestId("description");
		const content = screen.getByRole("alertdialog");
		expect(description.tagName).toBe("P");
		expect(description).toHaveAttribute("data-slot", "alert-dialog-description");
		expect(content).toHaveAttribute("aria-describedby", description.getAttribute("id"));
	});

	it("supports asChild to swap the element", () => {
		render(
			<OverlayDOMProvider>
				<Root defaultOpen>
					<Content>
						<Description asChild data-testid="description">
							<span>Be careful.</span>
						</Description>
					</Content>
				</Root>
			</OverlayDOMProvider>
		);

		const description = screen.getByTestId("description");
		expect(description.tagName).toBe("SPAN");
	});
});
