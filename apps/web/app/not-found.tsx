// app/not-found.tsx
import Link from "next/link";
import { BackButton } from "../components/ui/native-back-button";

export default function NotFound() {
	const isDev = process.env.NODE_ENV !== "production";
	//const isDev = false;

	return (
		<div className="relative min-h-screen overflow-hidden bg-background text-foreground">
			{/* background glow grid */}
			<div aria-hidden className="pointer-events-none absolute inset-0">
				<div className="absolute -top-48 left-1/2 h-14436rem] -translate-x-1/2 rounded-full bg-[oklch(var(--chart-1)/0.18)] blur-3xl" />
				<div className="absolute -bottom-56 -left-24 h-136 w-136 rounded-full bg-[oklch(var(--chart-2)/0.16)] blur-3xl" />
				<div className="absolute -right-24 top-1/3 h-112 w-md rounded-full bg-[oklch(var(--chart-3)/0.14)] blur-3xl" />
				<div className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(to_right,oklch(var(--border)/0.55)_1px,transparent_1px),linear-gradient(to_bottom,oklch(var(--border)/0.55)_1px,transparent_1px)] bg-size-[48px_48px]" />
				<div className="absolute inset-0 bg-linear-to-b from-transparent via-background/30 to-background" />
			</div>

			<main className="relative mx-auto flex min-h-screen max-w-5xl items-center px-6 py-16">
				<div className="flex w-full gap-10 items-center justify-center">
					{/* left */}
					<div className="space-y-6">
						<div className="inline-flex items-center gap-2 rounded-(--radius-lg) border border-border bg-card/60 px-3 py-1.5 text-sm text-muted-foreground backdrop-blur">
							<span className="h-2 w-2 rounded-full bg-destructive" />
							<span>Signal lost: route not found</span>
						</div>

						<h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">You’ve hit a dead end in the grid.</h1>

						<p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
							The page you’re looking for doesn’t exist. Use the links below to get back on track.
						</p>

						<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
							<Link
								href="/"
								className="group inline-flex items-center justify-center gap-2 rounded-(--radius-md) bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-[0_0_0_1px_oklch(var(--ring)/0.35),0_10px_30px_oklch(var(--chart-1)/0.16)] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
							>
								<span className="relative">
									Return home
									<span className="absolute -bottom-0.5 left-0 h-px w-0 bg-primary-foreground/70 transition-all group-hover:w-full" />
								</span>
								<span aria-hidden className="transition-transform group-hover:translate-x-0.5">
									→
								</span>
							</Link>

							<Link
								href="/components"
								className="inline-flex items-center justify-center gap-2 rounded-(--radius-md) border border-border bg-card/50 px-4 py-2.5 text-sm font-medium text-foreground/90 backdrop-blur transition hover:bg-card/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
							>
								Browse components
							</Link>

							<BackButton />
						</div>

						{/* ✅ Only show these in dev */}
						{isDev ? (
							<div className="space-y-2 pt-2 text-xs text-muted-foreground">
								<div className="flex flex-wrap gap-2">
									<span className="rounded-(--radius-sm) border border-border bg-card/40 px-2 py-1 text-muted-foreground">
										404
									</span>
									<span className="rounded-(--radius-sm) border border-border bg-card/40 px-2 py-1 text-muted-foreground">
										dev
									</span>
									<span className="rounded-(--radius-sm) border border-border bg-card/40 px-2 py-1 text-muted-foreground">
										Tip: check your route param and codeTemplates registry
									</span>
								</div>

								<div className="rounded-(--radius-lg) border border-border bg-background/25 p-4">
									<div className="text-xs font-medium text-muted-foreground">TRACE (dev only)</div>
									<pre className="mt-2 overflow-x-auto text-xs leading-relaxed text-foreground/85">
										{`> request: GET /unknown
> response: 404 NOT_FOUND
> hint: check the route, or return to base`}
									</pre>
								</div>
							</div>
						) : (
							<div className="pt-2 text-xs text-muted-foreground">
								{/* ✅ production-safe */}
								If you think this is a mistake, head back home or browse components.
							</div>
						)}
					</div>

					{isDev && (
						<div className="relative">
							<div className="absolute -inset-6 rounded-radius-xl blur-2xl" />
							<div className="relative overflow-hidden rounded-radius-xl border border-border bg-card/55 p-6  backdrop-blur">
								<div className="flex items-start justify-between gap-4">
									<div className="space-y-1">
										<div className="text-xs font-medium text-muted-foreground">SYSTEM</div>
										<div className="text-sm font-medium">Navigation Matrix</div>
									</div>

									<div className="flex gap-2 items-center">
										<span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
										<span className="h-2.5 w-2.5 shrink-0 rounded-full bg-secondary" />
										<span className="h-2.5 w-2.5 shrink-0 rounded-full bg-destructive" />
									</div>
								</div>

								<div className="mt-6 grid gap-4">
									<div className="rounded-(--radius-lg) border border-border bg-background/35 p-4">
										<div className="flex items-center justify-between">
											<div className="text-xs text-muted-foreground">ERROR CODE</div>
											<div className="text-xs text-muted-foreground">SEVERITY</div>
										</div>
										<div className="mt-2 flex items-end justify-between gap-4">
											<div className="text-5xl font-semibold tracking-tight">
												<span className="text-foreground">
													404
												</span>
											</div>
											<div className="inline-flex items-center gap-2 rounded-(--radius-md) border border-border bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground">
												<span className="h-2 w-2 rounded-full bg-destructive" />
												Not found
											</div>
										</div>
									</div>

									{/* ✅ hide the “TRACE” block entirely in prod */}
									{isDev && (
										<div className="rounded-(--radius-lg) border border-border bg-background/25 p-4">
											<div className="text-xs font-medium text-muted-foreground">TRACE (dev only)</div>
											<pre className="mt-2 overflow-x-auto text-xs leading-relaxed text-foreground/85">
												{`> request: GET /unknown
> response: 404 NOT_FOUND
> hint: check the route, or return to base`}
											</pre>
										</div>
									)}

									<div className="rounded-(--radius-lg) border border-border bg-background/25 p-4">
										<div className="flex items-center justify-between">
											<div className="text-xs font-medium text-muted-foreground">QUICK JUMP</div>
											<div className="text-xs text-muted-foreground">SUGGESTED</div>
										</div>
										<div className="mt-3 grid grid-cols-2 gap-2">
											<Link
												href="/"
												className="rounded-(--radius-md) border border-border bg-card/40 px-3 py-2 text-xs text-foreground/90 transition hover:bg-card/70"
											>
												Home
											</Link>
											<Link
												href="/docs"
												className="rounded-(--radius-md) border border-border bg-card/40 px-3 py-2 text-xs text-foreground/90 transition hover:bg-card/70"
											>
												Docs
											</Link>
											<Link
												href="/components"
												className="rounded-(--radius-md) border border-border bg-card/40 px-3 py-2 text-xs text-foreground/90 transition hover:bg-card/70"
											>
												Components
											</Link>
											<Link
												href="/examples"
												className="rounded-(--radius-md) border border-border bg-card/40 px-3 py-2 text-xs text-foreground/90 transition hover:bg-card/70"
											>
												Examples
											</Link>
										</div>
									</div>
								</div>

								<div
									aria-hidden
									className="pointer-events-none absolute inset-0 opacity-[0.14] bg-[linear-gradient(to_bottom,transparent_0px,transparent_6px,oklch(var(--foreground)/0.08)_7px)] bg-size-[100%_8px]"
								/>
							</div>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
