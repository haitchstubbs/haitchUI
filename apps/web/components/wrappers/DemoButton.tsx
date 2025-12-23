"use client";
import { Button } from "@haitch/ui";

export default function DemoButton() {
	return (
		<Button variant="outline" size="sm" onClick={() => alert("Clicked!")}>
			Click Me
		</Button>
	);
}
