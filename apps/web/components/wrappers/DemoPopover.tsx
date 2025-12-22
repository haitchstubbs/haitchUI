"use client";
import { Button } from "@repo/ui/components/button";
import { Popover, PopoverTrigger, PopoverContent } from "@repo/ui/components/popover";
import { Label } from "@repo/ui/components/label";
import { Input } from "@repo/ui/components/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";
export default function DemoPopover() {
	return (
		<Card className="h-fit">
			<CardHeader>
				<CardTitle>Popover</CardTitle>
				<CardDescription>Simple popover with form elements</CardDescription>
			</CardHeader>
			<CardContent>
				<Popover align="center" side="bottom">
					<PopoverTrigger asChild>
						<Button variant="secondary">Open popover</Button>
					</PopoverTrigger>
					<PopoverContent className="w-96 p-4">
						<div className="grid gap-4">
							<div className="space-y-2">
								<h4 className="leading-none font-medium">Dimensions</h4>
								<p className="text-muted-foreground text-sm">Set the dimensions for the layer.</p>
							</div>
							<div className="grid gap-2">
								<div className="grid grid-cols-3 items-center gap-4">
									<Label htmlFor="width">Width</Label>
									<Input id="width" defaultValue="100%" className="col-span-2 h-8" />
								</div>
								<div className="grid grid-cols-3 items-center gap-4">
									<Label htmlFor="maxWidth">Max. width</Label>
									<Input id="maxWidth" defaultValue="300px" className="col-span-2 h-8" />
								</div>
								<div className="grid grid-cols-3 items-center gap-4">
									<Label htmlFor="height">Height</Label>
									<Input id="height" defaultValue="25px" className="col-span-2 h-8" />
								</div>
								<div className="grid grid-cols-3 items-center gap-4">
									<Label htmlFor="maxHeight">Max. height</Label>
									<Input id="maxHeight" defaultValue="none" className="col-span-2 h-8" />
								</div>
							</div>
						</div>
					</PopoverContent>
				</Popover>
			</CardContent>
		</Card>
	);
}
