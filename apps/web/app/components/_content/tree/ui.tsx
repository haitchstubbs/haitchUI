"use client";

import * as React from "react";
import { IconFile, IconFolder, IconDots, IconTrash } from "@tabler/icons-react";

import {
	Tree,
	TreeItem,
	TreeItemRow,
	TreeItemToggle,
	TreeItemContent,
	TreeItemTitle,
	TreeItemActions,
	TreeItemIcon,
	TreeItemLink,
} from "../../../../components/ui/tree";

export function Primary() {
	return (
		<div className="w-[95%] rounded-lg border bg-background p-2">
			<div className="mb-2 flex items-center justify-between px-2">
				<div className="text-sm font-medium">Project</div>
			</div>

			<Tree aria-label="File explorer" defaultExpandedValues={["src", "components", "primitives"]} defaultActiveValue="tree.tsx">
				<TreeItem value="src">
					<TreeItemRow
						className={`
              transition-[transform] duration-150 ease-out
              data-[active=true]:scale-[1.01]
            `}
					>
						<TreeItemToggle className="duration-150 ease-out" />
						<TreeItemIcon>
							<IconFolder className="size-4" />
						</TreeItemIcon>
						<TreeItemTitle>src</TreeItemTitle>
						<TreeItemActions>
							<button
								type="button"
								className="text-muted-foreground hover:text-foreground inline-flex size-7 items-center justify-center rounded-md hover:bg-accent"
								aria-label="Folder actions"
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									console.log("src actions");
								}}
							>
								<IconDots className="size-4" />
							</button>
						</TreeItemActions>
					</TreeItemRow>

					{/* ✅ Animate the expanding group */}
					<TreeItemContent forceMount className="overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ease-out">
						<TreeItem value="components">
							<TreeItemRow>
								<TreeItemToggle className="duration-150 ease-out" />
								<TreeItemIcon>
									<IconFolder className="size-4" />
								</TreeItemIcon>
								<TreeItemTitle>components</TreeItemTitle>
							</TreeItemRow>

							<TreeItemContent forceMount className="overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ease-out">
								<TreeItem value="primitives">
									<TreeItemRow>
										<TreeItemToggle className="duration-150 ease-out" />
										<TreeItemIcon>
											<IconFolder className="size-4" />
										</TreeItemIcon>
										<TreeItemTitle>primitives</TreeItemTitle>
									</TreeItemRow>

									<TreeItemContent forceMount className="overflow-hidden animate-in data-[state=closed]:animate-out fade-in data-[state=closed]:fade-out slide-out-to-top-2 data-[state=closed]:slide-in-to-top-2 duration-200 ease-in-out">
										<TreeItem value="tree.tsx">
											<TreeItemRow>
												<TreeItemToggle className="duration-150 ease-out" />
												<TreeItemIcon>
													<IconFile className="size-4" />
												</TreeItemIcon>
												<TreeItemTitle>
													<TreeItemLink
														href="#"
														onClick={(e) => {
															e.preventDefault();
															console.log("Open tree.tsx");
														}}
													>
														tree.tsx
													</TreeItemLink>
												</TreeItemTitle>
												<TreeItemActions>
													<button
														type="button"
														className="text-muted-foreground hover:text-foreground inline-flex size-7 items-center justify-center rounded-md hover:bg-accent"
														aria-label="Delete file"
														onClick={(e) => {
															e.preventDefault();
															e.stopPropagation();
															console.log("Delete tree.tsx");
														}}
													>
														<IconTrash className="size-4" />
													</button>
												</TreeItemActions>
											</TreeItemRow>
										</TreeItem>

										<TreeItem value="scroll-area.tsx">
											<TreeItemRow>
												<TreeItemToggle className="duration-150 ease-out" />
												<TreeItemIcon>
													<IconFile className="size-4" />
												</TreeItemIcon>
												<TreeItemTitle>scroll-area.tsx</TreeItemTitle>
											</TreeItemRow>
										</TreeItem>
									</TreeItemContent>
								</TreeItem>
							</TreeItemContent>
						</TreeItem>
					</TreeItemContent>
				</TreeItem>
			</Tree>
		</div>
	);
}
