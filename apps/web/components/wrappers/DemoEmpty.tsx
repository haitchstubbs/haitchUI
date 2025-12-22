import { IconFolderCode, IconArrowForwardUp } from "@tabler/icons-react";

import { Button } from "@repo/ui/components/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@repo/ui/components/empty";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";

export function DemoEmpty() {
	return (
		<Card className="h-fit">
      <CardHeader>
        <CardTitle>Empty State</CardTitle>
        <CardDescription>Empty State with Actions</CardDescription>
      </CardHeader>
			<CardContent className="h-fit p-0">
				<Empty className="h-fit py-0!">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<IconFolderCode />
						</EmptyMedia>
						<EmptyTitle>No Projects Yet</EmptyTitle>
						<EmptyDescription>You haven&apos;t created any projects yet. Get started by creating your first project.</EmptyDescription>
					</EmptyHeader>
					<EmptyContent className="h-fit">
						<div className="flex gap-2">
							<Button>Create Project</Button>
							<Button variant="outline">Import Project</Button>
						</div>
					</EmptyContent>
					<Button variant="link" asChild className="text-muted-foreground" size="sm">
						<a href="#">
							Learn More <IconArrowForwardUp />
						</a>
					</Button>
				</Empty>
			</CardContent>
		</Card>
	);
}
