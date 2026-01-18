"use client";

import * as React from "react";

import { PerfTable, type ColumnDef, type Row } from "@haitch-ui/react/data-table";

import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "./table";

import { cn } from "../../lib/util";
import { Checkbox } from "./checkbox";

export type DataTableProps<TData> = {
	data: TData[];
	columns: ColumnDef<TData, any>[];

	className?: string;
	containerClassName?: string;

	height?: number | string;
	stickyHeader?: boolean;

	empty?: React.ReactNode;
	caption?: React.ReactNode;

	onRowClick?: (row: Row<TData>) => void;

	rowClassName?: (row: Row<TData>) => string | undefined;
	cellClassName?: (opts: { row: Row<TData>; columnId: string }) => string | undefined;

	virtualize?: "on" | "off" | "auto";
	virtualizeThreshold?: number;
	estimateRowHeight?: number;
	overscan?: number;
	measureElement?: boolean;

	getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string;
	rowSelectable?: boolean;

	/** Controlled selection (optional) */
	rowSelection?: Record<string, boolean>;
	onRowSelectionChange?: (updater: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void;

	/** Called with selected row originals */
	onSelectionChange?: (selected: TData[]) => void;
};

export function DataTable<TData>({
	data,
	columns,
	className,
	containerClassName,
	height = 520,
	stickyHeader = true,
	empty = "No results.",
	caption,
	onRowClick,
	rowClassName,
	cellClassName,
	virtualize = "auto",
	virtualizeThreshold = 200,
	estimateRowHeight = 40,
	overscan = 10,
	measureElement = false,
	getRowId,
	rowSelectable = false,

	// ✅ controlled selection props
	rowSelection,
	onRowSelectionChange,

	// ✅ callback with selected TData[]
	onSelectionChange,
}: DataTableProps<TData>) {
	const [uncontrolledRowSelection, setUncontrolledRowSelection] = React.useState<Record<string, boolean>>({});

	const isControlled = typeof rowSelection !== "undefined";

	const resolvedRowSelection = isControlled ? rowSelection : uncontrolledRowSelection;

	const handleRowSelectionChange = React.useCallback(
		(updater: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => {
			if (isControlled) {
				onRowSelectionChange?.(updater);
				return;
			}

			setUncontrolledRowSelection((prev) =>
				typeof updater === "function" ? (updater as (p: Record<string, boolean>) => Record<string, boolean>)(prev) : updater
			);
		},
		[isControlled, onRowSelectionChange]
	);

	return (
		<PerfTable.Root
			data={data}
			columns={columns}
			getRowId={getRowId}
			height={height}
			className={cn("rounded-md border bg-background w-full", containerClassName)}
			virtualize={virtualize}
			virtualizeThreshold={virtualizeThreshold}
			estimateRowHeight={estimateRowHeight}
			overscan={overscan}
			measureElement={measureElement}
			onRowClick={onRowClick}
			rowClassName={rowClassName}
			cellClassName={cellClassName}
			enableRowSelection={rowSelectable}
			rowSelection={resolvedRowSelection}
			onRowSelectionChange={handleRowSelectionChange}
		>
			<PerfTableUI<TData>
				enableRowSelection={rowSelectable}
				onSelectionChange={onSelectionChange} // ✅ correct type
				className={className}
				stickyHeader={stickyHeader}
				empty={empty}
				caption={caption}
			/>
		</PerfTable.Root>
	);
}

function PerfTableUI<TData>(props: {
	enableRowSelection?: boolean;
	onSelectionChange?: (selected: TData[]) => void;
	className?: string;
	stickyHeader: boolean;
	empty: React.ReactNode;
	caption?: React.ReactNode;
}) {
	const { table, rows, virtualEnabled, virtualItems, totalSize } = PerfTable.useContext<TData>();

	const colSpan = table.getAllLeafColumns().length + (props.enableRowSelection ? 1 : 0);

	React.useEffect(() => {
		if (!props.onSelectionChange) return;
		const selected = table.getSelectedRowModel().rows.map((r) => r.original);
		props.onSelectionChange(selected);
	}, [props.onSelectionChange, table, table.getState().rowSelection]);

	const paddingTop = virtualEnabled && virtualItems.length > 0 ? virtualItems[0]!.start : 0;

	const paddingBottom = virtualEnabled && virtualItems.length > 0 ? totalSize - virtualItems[virtualItems.length - 1]!.end : 0;

	const visibleRows = virtualEnabled ? virtualItems.map((v) => rows[v.index]!).filter(Boolean) : rows;

	return (
		<div className={cn("w-full", props.className)}>
			<Table>
				{props.caption ? <TableCaption>{props.caption}</TableCaption> : null}

				<TableHeader
					className={cn(
						props.stickyHeader ? "sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/75" : undefined
					)}
				>
					{table.getHeaderGroups().map((hg) => (
						<TableRow key={hg.id}>
							{props.enableRowSelection ? (
								<TableHead className="w-10 px-2">
									<Checkbox
										checked={table.getIsAllPageRowsSelected()}
										indeterminate={table.getIsSomePageRowsSelected()}
										onCheckedChange={(next) => table.toggleAllPageRowsSelected(next)}
										aria-label="Select all rows"
									/>
								</TableHead>
							) : null}

							{hg.headers.map((header) => (
								<TableHead key={header.id}>{header.isPlaceholder ? null : PerfTable.renderHeader(header)}</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>

				<TableBody>
					{rows.length === 0 ? (
						<TableRow>
							<TableCell colSpan={colSpan} className="py-10 text-center text-muted-foreground">
								{props.empty}
							</TableCell>
						</TableRow>
					) : (
						<>
							{virtualEnabled && paddingTop > 0 ? (
								<TableRow aria-hidden>
									<TableCell colSpan={colSpan} style={{ height: paddingTop, padding: 0 }} />
								</TableRow>
							) : null}

							{visibleRows.map((row) => (
								<TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
									{props.enableRowSelection ? (
										<TableCell className="w-10 px-2">
											<Checkbox
												checked={row.getIsSelected()}
												indeterminate={row.getIsSomeSelected?.() ?? false}
												onCheckedChange={(next) => row.toggleSelected(next)}
												aria-label="Select row"
											/>
										</TableCell>
									) : null}

									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>{PerfTable.renderCell(cell)}</TableCell>
									))}
								</TableRow>
							))}

							{virtualEnabled && paddingBottom > 0 ? (
								<TableRow aria-hidden>
									<TableCell colSpan={colSpan} style={{ height: paddingBottom, padding: 0 }} />
								</TableRow>
							) : null}
						</>
					)}
				</TableBody>

				{table.getFooterGroups().some((g) => g.headers.some((h) => h.column.columnDef.footer)) ? (
					<TableFooter>
						{table.getFooterGroups().map((fg) => (
							<TableRow key={fg.id}>
								{fg.headers.map((header) => (
									<TableCell key={header.id} className="font-medium">
										{header.isPlaceholder ? null : PerfTable.renderFooter(header)}
									</TableCell>
								))}
							</TableRow>
						))}
					</TableFooter>
				) : null}
			</Table>
		</div>
	);
}
