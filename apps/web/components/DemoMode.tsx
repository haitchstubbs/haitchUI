"use client";
import DemoButton from "./DemoButton";
import DemoButtonGroup from "./DemoButtonGroup";
import { DemoEmpty } from "./DemoEmpty";
import DemoPopover from "./DemoPopover";

export default function DemoMode() {
	return (
		<div className="px-4 py-2 text-sm font-medium text-white shadow-lg opacity-75">
			<h1>Component Demos</h1>
			{/** Create a nice pintrest style layout to showcase components */}
			<div className="mt-4 flex flex-col gap-4">
				<DemoButton />
				<DemoPopover />
                <DemoButtonGroup />
                <DemoEmpty />
			</div>
		</div>
	);
}
