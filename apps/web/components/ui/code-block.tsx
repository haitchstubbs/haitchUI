"use client";

import * as React from "react";
import { Slot } from "@haitch-ui/react-slot";
import { cn } from "../../lib/util";

import * as Primitive from "@haitch/react-code-block"; // <-- adjust path

type DivProps = React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean };
type PProps = React.HTMLAttributes<HTMLParagraphElement> & { asChild?: boolean };

export function CodeBlock({ asChild, className, ...props }: React.ComponentProps<typeof Primitive.Root> & { asChild?: boolean; className?: string }) {
	const Comp: any = asChild ? Slot : "div";

	return (
		<Comp data-slot="code-block" className={cn("relative rounded-sm bg-sidebar", className)}>
			<Primitive.Root {...props} />
		</Comp>
	);
}

/* ---------- Layout helpers (shadcn-style) ---------- */

export function CodeBlockHeader({ asChild, className, ...props }: DivProps) {
	const Comp: any = asChild ? Slot : "div";
	return <Comp data-slot="code-block-header" className={cn("flex items-center justify-between gap-3 border-b border-border p-2", className)} {...props} />;
}

export function CodeBlockHeaderText({ asChild, className, ...props }: DivProps) {
	const Comp: any = asChild ? Slot : "div";
	return <Comp data-slot="code-block-header-text" className={cn("min-w-0 flex-1", className)} {...props} />;
}

export function CodeBlockTitle({ asChild, className, ...props }: PProps) {
	const Comp: any = asChild ? Slot : "p";
	return <Comp data-slot="code-block-title" className={cn("truncate text-sm font-medium", className)} {...props} />;
}

export function CodeBlockDescription({ asChild, className, ...props }: PProps) {
	const Comp: any = asChild ? Slot : "p";
	return <Comp data-slot="code-block-description" className={cn("truncate text-xs text-muted-foreground", className)} {...props} />;
}

export function CodeBlockHeaderActions({ asChild, className, ...props }: DivProps) {
	const Comp: any = asChild ? Slot : "div";
	return <Comp data-slot="code-block-header-actions" className={cn("flex items-center gap-2", className)} {...props} />;
}

export function CodeBlockContent({ asChild, className, ...props }: DivProps) {
	const Comp: any = asChild ? Slot : "div";
	return <Comp data-slot="code-block-content" className={cn("relative w-full bg-none rounded-b-md", className)} {...props} />;
}

/* ---------- Styled code surface ---------- */

export function CodeBlockCode({
  className,
  maxCollapsedHeightClassName = "max-h-72",
  scrollable = false,
  ...props
}: React.ComponentProps<typeof Primitive.Code> & {
  className?: string;
  maxCollapsedHeightClassName?: string;
  scrollable?: boolean;
}) {
  return (
    <div data-slot="code-block-code-wrap" className={cn(
		"relative w-full bg-none rounded-b-md",
		scrollable ? "overflow-auto" : "overflow-x-auto overflow-y-hidden",
		scrollable && maxCollapsedHeightClassName
	)}>
      <Primitive.Code
        {...props}
		maxCollapsedHeightClassName={!scrollable ? maxCollapsedHeightClassName : undefined}
        className={cn(
          "rounded-b-md text-foreground w-full",
          "font-mono text-sm",
          "[&_pre]:m-0 [&_pre]:p-4",
          "[&_pre]:leading-relaxed",
          "[&_pre]:bg-sidebar!",
		  "[&_pre]:rounded-b-md!", // ← THIS is what you were missing
          "[&_code]:font-mono",
          "selection:bg-foreground/20",
          className
        )}
      />
      <CodeBlockFade />
    </div>
  );
}

function CodeBlockFade() {
	return (
		<div
			aria-hidden="true"
			data-slot="code-block-fade"
			className={cn(
				"pointer-events-none absolute inset-x-0 bottom-0 h-16",
				"bg-linear-to-t from-background to-transparent",
				"[data-expanded] & hidden"
			)}
		/>
	);
}

/* ---------- Styled overlay actions ---------- */
export function CodeBlockActions({
  asChild,
  className,
  framed = true,
  ...props
}: React.ComponentProps<typeof Primitive.CodeActions> & { framed?: boolean }) {
  return (
    <Primitive.CodeActions
      {...props}
      className={cn(
        framed &&
          cn(
            "relative isolate overflow-hidden rounded-b-md px-1 py-1 shadow-sm",
            "bg-transparent",
            "*:relative *:z-10",
			"w-full",

            // Soft blur — starts immediately, ramps fast
            "supports-backdrop-filter:before:content-['']",
            "supports-backdrop-filter:before:absolute",
            "supports-backdrop-filter:before:inset-x-0 supports-backdrop-filter:before:bottom-0",
            "supports-backdrop-filter:before:h-16",
            "supports-backdrop-filter:before:z-0",
            "supports-backdrop-filter:before:pointer-events-none",
            "supports-backdrop-filter:before:backdrop-blur-sm",
            "supports-backdrop-filter:before:mask-[linear-gradient(to_bottom,transparent_0%,black_55%)]",
            "supports-backdrop-filter:before:[-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_55%)]",

            // Heavy blur — kicks in early and finishes strong
            "supports-backdrop-filter:after:content-['']",
            "supports-backdrop-filter:after:absolute",
            "supports-backdrop-filter:after:inset-x-0 supports-backdrop-filter:after:bottom-0",
            "supports-backdrop-filter:after:h-10",
            "supports-backdrop-filter:after:z-0",
            "supports-backdrop-filter:after:pointer-events-none",
            "supports-backdrop-filter:after:backdrop-blur-2xl",
            "supports-backdrop-filter:after:mask-[linear-gradient(to_bottom,transparent_0%,black_40%)]",
            "supports-backdrop-filter:after:[-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_40%)]"
          ),
        className
      )}
    />
  );
}



/* ---------- Styled action triggers ---------- */

export function CodeBlockCopy({ asChild, className, children, ...props }: React.ComponentProps<typeof Primitive.CodeCopy> & { className?: string }) {
	// If caller uses `asChild`, they MUST provide exactly one element child
	// (e.g. <Button asChild><CodeBlockCopy /></Button> happens outside)
	return (
		<Primitive.CodeCopy
			{...props}
			asChild={asChild}
			className={cn(
				"inline-flex h-8 items-center justify-center rounded-md px-2 text-xs",
				"text-foreground/80 hover:text-foreground hover:bg-muted/60",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				"ring-offset-background",
				className
			)}
		>
			{children}
		</Primitive.CodeCopy>
	);
}

export function CodeBlockExpand({
	asChild,
	className,
	children,
	...props
}: React.ComponentProps<typeof Primitive.CodeExpand> & { className?: string }) {
	return (
		<Primitive.CodeExpand
			{...props}
			asChild={asChild}
			className={cn(
				"inline-flex h-8 items-center justify-center rounded-md px-2 text-xs w-full",
				"text-foreground/80 hover:text-foreground cursor-pointer",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				"ring-offset-background",
				className
			)}
		>
			{children}
		</Primitive.CodeExpand>
	);
}
