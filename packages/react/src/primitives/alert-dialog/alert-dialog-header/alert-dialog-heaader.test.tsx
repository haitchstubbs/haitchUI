import React from "react";
import { render, screen } from "@testing-library/react";
import { Header } from "./alert-dialog-header";

describe("AlertDialog Header", () => {
	it("renders a wrapper with the expected data attribute", () => {
		render(
			<Header data-testid="header">
				<span>Header</span>
			</Header>
		);

		const header = screen.getByTestId("header");
		expect(header.tagName).toBe("DIV");
		expect(header).toHaveAttribute("data-slot", "alert-dialog-header");
	});
});
