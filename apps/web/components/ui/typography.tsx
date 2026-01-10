import * as React from "react";
import { cn } from "../../lib/util";

// -----------------------------
// Shadcn-aligned primitives (1:1)
// -----------------------------

export const H1 = React.forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<"h1">>(function H1({ className, ...props }, ref) {
	return <h1 ref={ref} className={cn("group scroll-m-20 pb-4 text-4xl font-extrabold tracking-tight text-balance", className)} {...props} />;
});

export const H2 = React.forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<"h2">>(function H2({ className, ...props }, ref) {
	return <h1 ref={ref} className={cn("group scroll-m-20 pb-4 text-4xl font-extrabold tracking-tight text-balance not-first:mt-6", className)} {...props} />;
});

export const H3 = React.forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<"h3">>(function H3({ className, ...props }, ref) {
	return <h3 ref={ref} className={cn("group scroll-m-20  pb-1 text-2xl font-semibold tracking-tight", className)} {...props} />;
});

export const H4 = React.forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<"h4">>(function H4({ className, ...props }, ref) {
	return <h4 ref={ref} className={cn("scroll-m-20 pb-px text-xl font-semibold tracking-tight", className)} {...props} />;
});

export const H5 = React.forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<"h5">>(function H5({ className, ...props }, ref) {
    return <h5 ref={ref} className={cn("scroll-m-20 pb-px text-lg font-semibold tracking-tight", className)} {...props} />;
});

export const H6 = React.forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<"h6">>(function H5({ className, ...props }, ref) {
    return <h6 ref={ref} className={cn("scroll-m-20 pb-px font-semibold tracking-tight", className)} {...props} />;
});

export const P = React.forwardRef<HTMLParagraphElement, React.ComponentPropsWithoutRef<"p">>(function P({ className, ...props }, ref) {
	return <p ref={ref} className={cn("leading-7 not-first:mt-6", className)} {...props} />;
});

export const Blockquote = React.forwardRef<HTMLQuoteElement, React.ComponentPropsWithoutRef<"blockquote">>(function Blockquote(
	{ className, ...props },
	ref
) {
	return <blockquote ref={ref} className={cn("mt-6 border-border border-l-2 pl-6 italic", className)} {...props} />;
});

export const UL = React.forwardRef<HTMLUListElement, React.ComponentPropsWithoutRef<"ul">>(function UL({ className, ...props }, ref) {
	return <ul ref={ref} className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)} {...props} />;
});

export const Code = React.forwardRef<HTMLElement, React.ComponentPropsWithoutRef<"code">>(function Code({ className, ...props }, ref) {
	return (
		<code ref={ref} className={cn("bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold", className)} {...props} />
	);
});

export const Lead = React.forwardRef<HTMLParagraphElement, React.ComponentPropsWithoutRef<"p">>(function Lead({ className, ...props }, ref) {
	return <p ref={ref} className={cn("text-muted-foreground text-xl", className)} {...props} />;
});

export const Large = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(function Large({ className, ...props }, ref) {
	return <div ref={ref} className={cn("text-lg font-semibold", className)} {...props} />;
});

export const Small = React.forwardRef<HTMLElement, React.ComponentPropsWithoutRef<"small">>(function Small({ className, ...props }, ref) {
	return <small ref={ref} className={cn("text-sm leading-none font-medium", className)} {...props} />;
});

export const Muted = React.forwardRef<HTMLParagraphElement, React.ComponentPropsWithoutRef<"p">>(function Muted({ className, ...props }, ref) {
	return <p ref={ref} className={cn("text-muted-foreground text-sm", className)} {...props} />;
});

// -----------------------------
// Optional extras (not in shadcn Typography page)
// Keep if you want, but they’re “yours”, not 1:1.
// -----------------------------

export const A = React.forwardRef<HTMLAnchorElement, React.ComponentPropsWithoutRef<"a">>(function A({ className, ...props }, ref) {
	return <a ref={ref} className={cn("font-medium underline underline- underline-offset-4 hover:text-primary transition-colors", className)} {...props} />;
});

export const HR = React.forwardRef<HTMLHRElement, React.ComponentPropsWithoutRef<"hr">>(
  function HR({ className, ...props }, ref) {
    return (
      <hr
        ref={ref}
        className={cn(
          "my-8 border-0 h-px bg-border/80",         // simple line
          "relative",
          className
        )}
        {...props}
      />
    )
  }
)
export const Strong = React.forwardRef<HTMLElement, React.ComponentPropsWithoutRef<"strong">>(function Strong({ className, ...props }, ref) {
	return <strong ref={ref} className={cn("font-semibold", className)} {...props} />;
});

export const Em = React.forwardRef<HTMLElement, React.ComponentPropsWithoutRef<"em">>(function Em({ className, ...props }, ref) {
	return <em ref={ref} className={cn("italic", className)} {...props} />;
});

export const OL = React.forwardRef<HTMLOListElement, React.ComponentPropsWithoutRef<"ol">>(function OL({ className, ...props }, ref) {
	return <ol ref={ref} className={cn("my-6 ml-6 list-decimal [&>li]:mt-2", className)} {...props} />;
});

export const LI = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<"li">>(function LI({ className, ...props }, ref) {
	return <li ref={ref} className={cn("mt-2", className)} {...props} />;
});

// Table wrapper
export const TableWrapper = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(function TableWrapper(
	{ className, ...props },
	ref
) {
	return <div ref={ref} className={cn("my-6 w-full overflow-y-auto", className)} {...props} />;
});

export const Table = React.forwardRef<HTMLTableElement, React.ComponentPropsWithoutRef<"table">>(function Table({ className, ...props }, ref) {
	return <table ref={ref} className={cn("w-full", className)} {...props} />;
});

export const Tr = React.forwardRef<HTMLTableRowElement, React.ComponentPropsWithoutRef<"tr">>(function Tr({ className, ...props }, ref) {
	return <tr ref={ref} className={cn("even:bg-muted m-0 border-border border-t p-0", className)} {...props} />;
});

export const Th = React.forwardRef<HTMLTableCellElement, React.ComponentPropsWithoutRef<"th">>(function Th({ className, ...props }, ref) {
	return (
		<th
			ref={ref}
			className={cn("border-border border px-4 py-2 text-left font-bold [[align=center]]:text-center [[align=right]]:text-right", className)}
			{...props}
		/>
	);
});

export const Td = React.forwardRef<HTMLTableCellElement, React.ComponentPropsWithoutRef<"td">>(function Td({ className, ...props }, ref) {
	return (
		<td ref={ref} className={cn("border-border border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right", className)} {...props} />
	);
});

// -----------------------------
// Typography namespace export
// -----------------------------

export const Typography = {
	H1,
	H2,
	H3,
	H4,
    H5,
    H6,
	P,
	Blockquote,
	UL,
	Code,
	Lead,
	Large,
	Small,
	Muted,

	//Table
	TableWrapper,
	Table,
	Tr,
	Th,
	Td,

	// extras
	A,
	HR,
	Strong,
	Em,
	OL,
	LI,
} as const;
