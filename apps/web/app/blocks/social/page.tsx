"use client";

import * as React from "react";
import Link from "next/link";
import {
	IconBell,
	IconBookmark,
	IconDots,
	IconHeart,
	IconMessageCircle,
	IconMessages,
	IconPhoto,
	IconSearch,
	IconSend,
	IconSettings,
	IconSparkles,
	IconUserPlus,
	IconUsers,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Input } from "../../../components/ui/input";
import { Item } from "../../../components/ui/item";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../../../components/ui/resizable";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Separator } from "../../../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Textarea } from "../../../components/ui/text-area";
import { cn } from "../../../lib/util";

type Post = {
	id: string;
	author: { name: string; handle: string; initials: string };
	time: string;
	content: string;
	tags: string[];
};

const POSTS: Post[] = [
	{
		id: "p1",
		author: { name: "Ada Lovelace", handle: "ada", initials: "AL" },
		time: "2h",
		content: "Refactored our button variants into a single cva map — the DX is so much better now. Next: token docs.",
		tags: ["release", "ui"],
	},
	{
		id: "p2",
		author: { name: "Grace Hopper", handle: "grace", initials: "GH" },
		time: "5h",
		content: "Hot take: good defaults beat endless configuration. If a component needs 12 props to look right, it’s not done.",
		tags: ["opinion", "components"],
	},
	{
		id: "p3",
		author: { name: "Linus Torvalds", handle: "linus", initials: "LT" },
		time: "1d",
		content: "Today’s energy: remove a dependency and everything gets faster. Tomorrow: do it again.",
		tags: ["performance"],
	},
];

const SUGGESTIONS = [
	{ id: "s1", name: "Design Systems", handle: "designsystems", initials: "DS" },
	{ id: "s2", name: "Frontend Daily", handle: "frontenddaily", initials: "FD" },
	{ id: "s3", name: "TypeScript Tips", handle: "tstips", initials: "TS" },
];

export default function SocialBlockPage() {
	const [composerText, setComposerText] = React.useState("");
	const [liked, setLiked] = React.useState<Set<string>>(() => new Set());
	const [following, setFollowing] = React.useState<Set<string>>(() => new Set(["s1"]));

	return (
		<section className="bg-background w-full p-6 md:p-10">
			<div className="mx-auto w-full max-w-7xl">
				<Item variant="outline" className="flex-col items-stretch gap-0 overflow-hidden p-0 shadow-sm min-h-[720px]">
					{/* App header */}
					<div className="bg-sidebar/60 supports-[backdrop-filter]:bg-sidebar/40 border-b border-border backdrop-blur-sm">
						<div className="flex items-center justify-between gap-3 px-4 py-3">
							<div className="flex items-center gap-2">
								<div className="grid size-9 place-items-center rounded-radius-md bg-accent text-accent-foreground">
									<IconSparkles className="size-5" />
								</div>
								<div className="leading-tight">
									<div className="text-sm font-semibold">Social Demo</div>
									<div className="text-muted-foreground text-xs">A feed layout built from Haitch UI components</div>
								</div>
							</div>

							<div className="relative hidden min-w-0 max-w-xl flex-1 md:block">
								<IconSearch className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
								<Input placeholder="Search posts, people, tags…" className="pl-9" />
							</div>

							<div className="flex items-center gap-2">
								<Button variant="ghost" size="icon" aria-label="Notifications">
									<IconBell className="size-5" />
								</Button>
								<Button variant="ghost" size="icon" aria-label="Messages">
									<IconMessages className="size-5" />
								</Button>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="secondary" size="sm" className="gap-2">
											<Avatar className="size-6">
												<AvatarFallback className="text-xs">HU</AvatarFallback>
											</Avatar>
											<span className="hidden sm:inline">Profile</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-56">
										<DropdownMenuItem asChild>
											<Link href="/blocks">Blocks</Link>
										</DropdownMenuItem>
										<DropdownMenuItem onSelect={(e) => e.preventDefault()}>Account</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem onSelect={(e) => e.preventDefault()}>Sign out</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>
					</div>

					{/* Main columns */}
					<ResizablePanelGroup orientation="horizontal" className="min-h-[660px] min-w-0">
						{/* Left nav */}
						<ResizablePanel defaultSize="22%" minSize="18%" maxSize="28%">
							<div className="flex h-full min-w-0 flex-col bg-sidebar/20">
								<div className="border-b border-border px-3 py-3">
									<div className="relative md:hidden">
										<IconSearch className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
										<Input placeholder="Search…" className="pl-9" />
									</div>
									<div className="hidden md:block text-xs text-muted-foreground">Navigation</div>
								</div>

								<ScrollArea className="min-h-0 flex-1">
									<div className="p-2">
										<NavItem icon={<IconSparkles className="size-4" />}>Home</NavItem>
										<NavItem icon={<IconUsers className="size-4" />}>Communities</NavItem>
										<NavItem icon={<IconBell className="size-4" />}>Notifications</NavItem>
										<NavItem icon={<IconMessages className="size-4" />}>Messages</NavItem>
										<NavItem icon={<IconBookmark className="size-4" />}>Bookmarks</NavItem>
										<Separator className="my-2" />
										<NavItem icon={<IconSettings className="size-4" />}>Settings</NavItem>
									</div>
								</ScrollArea>
							</div>
						</ResizablePanel>

						<ResizableHandle withHandle />

						{/* Feed */}
						<ResizablePanel defaultSize="56%" minSize="40%">
							<div className="flex h-full min-w-0 flex-col">
								<div className="border-b border-border px-4 py-3">
									<Tabs defaultValue="for-you">
										<TabsList>
											<TabsTrigger value="for-you">For you</TabsTrigger>
											<TabsTrigger value="following">Following</TabsTrigger>
										</TabsList>
										<TabsContent value="for-you" />
										<TabsContent value="following" />
									</Tabs>
								</div>

								<ScrollArea className="min-h-0 flex-1">
									<div className="p-4 flex flex-col gap-4">
										{/* Composer */}
										<Card className="py-0">
											<CardHeader className="px-4 py-4">
												<CardTitle className="text-sm">Create post</CardTitle>
											</CardHeader>
											<CardContent className="px-4 pb-4">
												<div className="flex items-start gap-3">
													<Avatar className="size-9">
														<AvatarFallback>HU</AvatarFallback>
													</Avatar>
													<div className="flex-1">
														<Textarea
															value={composerText}
															onChange={(e) => setComposerText(e.target.value)}
															placeholder="What’s happening?"
															className="min-h-20"
														/>
														<div className="mt-3 flex items-center justify-between">
															<div className="flex items-center gap-2">
																<Button variant="ghost" size="icon-sm" aria-label="Add photo">
																	<IconPhoto className="size-4" />
																</Button>
																<Button variant="ghost" size="icon-sm" aria-label="Add message">
																	<IconMessageCircle className="size-4" />
																</Button>
															</div>
															<Button
																size="sm"
																disabled={!composerText.trim()}
																onClick={() => setComposerText("")}
																className="gap-2"
															>
																<IconSend className="size-4" />
																Post
															</Button>
														</div>
													</div>
												</div>
											</CardContent>
										</Card>

										{/* Posts */}
										{POSTS.map((post) => {
											const isLiked = liked.has(post.id);
											return (
												<Card key={post.id} className="py-0">
													<CardHeader className="px-4 py-4">
														<div className="flex items-start justify-between gap-3">
															<div className="flex items-center gap-3 min-w-0">
																<Avatar className="size-9">
																	<AvatarFallback>{post.author.initials}</AvatarFallback>
																</Avatar>
																<div className="min-w-0">
																	<div className="flex items-center gap-2 min-w-0">
																		<div className="truncate text-sm font-semibold">{post.author.name}</div>
																		<div className="truncate text-xs text-muted-foreground">@{post.author.handle}</div>
																		<span className="text-muted-foreground text-xs">·</span>
																		<span className="text-muted-foreground text-xs">{post.time}</span>
																	</div>
																	<div className="mt-1 flex flex-wrap gap-1.5">
																		{post.tags.map((t) => (
																			<Badge key={t} variant="secondary" className="text-[11px]">
																				#{t}
																			</Badge>
																		))}
																	</div>
																</div>
															</div>
															<DropdownMenu>
																<DropdownMenuTrigger asChild>
																	<Button variant="ghost" size="icon-sm" aria-label="Post actions">
																		<IconDots className="size-4" />
																	</Button>
																</DropdownMenuTrigger>
																<DropdownMenuContent align="end">
																	<DropdownMenuItem onSelect={(e) => e.preventDefault()}>Mute</DropdownMenuItem>
																	<DropdownMenuItem onSelect={(e) => e.preventDefault()}>Report</DropdownMenuItem>
																</DropdownMenuContent>
															</DropdownMenu>
														</div>
													</CardHeader>
													<CardContent className="px-4 pb-4">
														<p className="text-sm leading-relaxed text-balance">{post.content}</p>
													</CardContent>
													<CardFooter className="px-4 pb-4 pt-0">
														<div className="flex w-full items-center justify-between">
															<div className="flex items-center gap-1">
																<Button
																	variant="ghost"
																	size="sm"
																	className={cn("gap-2", isLiked && "text-destructive")}
																	onClick={() =>
																		setLiked((prev) => {
																			const next = new Set(prev);
																			if (next.has(post.id)) next.delete(post.id);
																			else next.add(post.id);
																			return next;
																		})
																	}
																>
																	<IconHeart className="size-4" />
																	{isLiked ? "Liked" : "Like"}
																</Button>
																<Button variant="ghost" size="sm" className="gap-2" onClick={() => {}}>
																	<IconMessageCircle className="size-4" />
																	Comment
																</Button>
															</div>
															<Button variant="outline" size="sm" className="gap-2" onClick={() => {}}>
																<IconSend className="size-4" />
																Share
															</Button>
														</div>
													</CardFooter>
												</Card>
											);
										})}
									</div>
								</ScrollArea>
							</div>
						</ResizablePanel>

						<ResizableHandle withHandle />

						{/* Right rail */}
						<ResizablePanel defaultSize="22%" minSize="18%" maxSize="30%">
							<div className="flex h-full min-w-0 flex-col bg-sidebar/10">
								<div className="border-b border-border px-4 py-3">
									<div className="text-sm font-semibold">Who to follow</div>
									<div className="text-xs text-muted-foreground">Suggestions based on your interests</div>
								</div>

								<ScrollArea className="min-h-0 flex-1">
									<div className="p-3 flex flex-col gap-3">
										{SUGGESTIONS.map((s) => {
											const isFollowing = following.has(s.id);
											return (
												<Item key={s.id} variant="muted" className="p-3">
													<div className="flex items-center gap-3 min-w-0 w-full">
														<Avatar className="size-9">
															<AvatarFallback>{s.initials}</AvatarFallback>
														</Avatar>
														<div className="min-w-0 flex-1">
															<div className="truncate text-sm font-semibold">{s.name}</div>
															<div className="truncate text-xs text-muted-foreground">@{s.handle}</div>
														</div>
														<Button
															variant={isFollowing ? "secondary" : "outline"}
															size="sm"
															className="gap-2"
															onClick={() =>
																setFollowing((prev) => {
																	const next = new Set(prev);
																	if (next.has(s.id)) next.delete(s.id);
																	else next.add(s.id);
																	return next;
																})
															}
														>
															<IconUserPlus className="size-4" />
															{isFollowing ? "Following" : "Follow"}
														</Button>
													</div>
												</Item>
											);
										})}

										<Separator className="my-1" />

										<Card className="py-0">
											<CardHeader className="px-4 py-4">
												<CardTitle className="text-sm">Trending</CardTitle>
											</CardHeader>
											<CardContent className="px-4 pb-4">
												<div className="flex flex-wrap gap-2">
													{["tokens", "tailwind", "shadcn", "nextjs", "accessibility", "motion"].map((t) => (
														<Badge key={t} variant="outline" className="cursor-pointer">
															#{t}
														</Badge>
													))}
												</div>
											</CardContent>
										</Card>
									</div>
								</ScrollArea>
							</div>
						</ResizablePanel>
					</ResizablePanelGroup>
				</Item>
			</div>
		</section>
	);
}

function NavItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
	return (
		<Button variant="ghost" className="w-full justify-start gap-2" onClick={() => {}}>
			<span className="text-muted-foreground">{icon}</span>
			<span className="truncate">{children}</span>
		</Button>
	);
}

