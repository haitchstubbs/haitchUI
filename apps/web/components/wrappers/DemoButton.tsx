"use client";
import { Button } from "@repo/ui/components/button";

export default function DemoButton() {
	return (
		<Button variant="outline" size="sm" onClick={() => alert("Clicked!")}>
			Click Me
		</Button>
	);
}
