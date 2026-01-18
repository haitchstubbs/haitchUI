"use client";

import { toast } from "@haitch-ui/react/toast";

import { Button } from "../../../../components/ui/button";
import { useState } from "react";

export function Primary() {
	const [counter, setCounter] = useState(0);
	return (
		<Button
			variant="outline"
			onClick={() => {
        toast(`This is toast number: ${counter}`, {
					description: new Date().toLocaleTimeString(),
					action: {
						label: "Undo",
						onClick: () => {
							console.log("Undo");
						},
					},
					dismissible: true,
				})
        setCounter((c) => c + 1);
      }
				
			}
		>
			Show Toast
		</Button>
	);
}
