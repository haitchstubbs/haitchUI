import React from "react";

type WaterfallGridProps = {
	children: React.ReactNode;
	className?: string;
	minColumnWidth?: number;
	gap?: number;
};

export default function WaterfallGrid({
	children,
	className,
	minColumnWidth = 250,
	gap = 16,
}: WaterfallGridProps) {
	return (
		<div
			className={`w-full md:columns-1 xl:columns-2 2xl:columns-3 [column-fill:balance] ${className ?? ""}`}
			style={{
				columnWidth: `${minColumnWidth}px`,
				columnGap: `${gap}px`,
			}}
		>
			{React.Children.map(children, (child) => (
				<div className="mb-4 break-inside-avoid">{child}</div>
			))}
		</div>
	);
}
