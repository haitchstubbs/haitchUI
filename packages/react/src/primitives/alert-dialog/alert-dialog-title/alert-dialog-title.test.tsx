import React from "react";
import { render, screen } from "@testing-library/react";
import { OverlayDOMProvider } from "@/primitives/overlay";
import { Root } from "../alert-dialog-root";
import { Content } from "../alert-dialog-content";
import { Title } from "./alert-dialog-title";

describe("AlertDialog Title", () => {
	it("renders a heading and connects to the content label", () => {
		render(
			<OverlayDOMProvider>
				<Root defaultOpen>
					<Content>
						<Title data-testid="title">Warning</Title>
					</Content>
				</Root>
			</OverlayDOMProvider>
		);

		const title = screen.getByTestId("title");
		const content = screen.getByRole("alertdialog");
		expect(title.tagName).toBe("H2");
		expect(title).toHaveAttribute("data-slot", "alert-dialog-title");
		expect(content).toHaveAttribute("aria-labelledby", title.getAttribute("id"));
	});

	it("supports asChild to swap the element", () => {
		render(
			<OverlayDOMProvider>
				<Root defaultOpen>
					<Content>
						<Title asChild data-testid="title">
							<h3>Warning</h3>
						</Title>
					</Content>
				</Root>
			</OverlayDOMProvider>
		);

		const title = screen.getByTestId("title");
		expect(title.tagName).toBe("H3");
	});
});
