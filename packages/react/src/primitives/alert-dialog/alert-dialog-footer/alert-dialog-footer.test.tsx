import React from "react";
import { render, screen } from "@testing-library/react";
import { Footer } from "./alert-dialog-footer";

describe("AlertDialog Footer", () => {
	it("renders a wrapper with the expected data attribute", () => {
		render(
			<Footer data-testid="footer">
				<span>Footer</span>
			</Footer>
		);

		const footer = screen.getByTestId("footer");
		expect(footer.tagName).toBe("DIV");
		expect(footer).toHaveAttribute("data-slot", "alert-dialog-footer");
	});
});
