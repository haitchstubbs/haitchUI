// DataTable.tsx
import * as React from "react";
import {
	flexRender,
	getCoreRowModel,
	type RowSelectionState,
	type Cell,
	type ColumnDef,
	type Header,
	type Row,
	type Table,
	useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer, Virtualizer, type VirtualItem } from "@tanstack/react-virtual";

type VirtualizationMode = "on" | "off" | "auto";

type DataTableContextValue<TData> = {
	table: Table<TData>;
	rows: Row<TData>[];
	enableRowSelection: boolean;
	/** Controlled selection */
	rowSelection?: RowSelectionState;
	onRowSelectionChange?: (updater: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => void;

	/** Uncontrolled initial selection */
	initialRowSelection?: RowSelectionState;
	// virtualization
	virtualEnabled: boolean;
	parentRef: React.RefObject<HTMLDivElement | null>;
	rowVirtualizer: Virtualizer<HTMLDivElement, Element> | null;
	virtualItems: VirtualItem[];
	totalSize: number;

	// render helpers
	rowClassName?: (row: Row<TData>) => string | undefined;
	cellClassName?: (opts: { row: Row<TData>; columnId: string }) => string | undefined;
	onRowClick?: (row: Row<TData>) => void;
};

const DataTableContext = React.createContext<DataTableContextValue<any> | null>(null);

function cx(...parts: Array<string | undefined | false | null>) {
	return parts.filter(Boolean).join(" ");
}

function useDataTableContext<TData>() {
	const ctx = React.useContext(DataTableContext);
	if (!ctx) throw new Error("DataTable primitives must be used within <DataTable.Root />");
	return ctx as DataTableContextValue<TData>;
}

export type { ColumnDef as DataTableColumn, Row as DataTableRow };
export type { VirtualItem as DataTableVirtualItem };

export type DataTableRootProps<TData> = {
	data: TData[];
	columns: ColumnDef<TData, any>[];

	/** Virtualization mode. Default: "auto" */
	virtualize?: VirtualizationMode;

	/**
	 * In "auto", virtualization turns on when rowCount >= virtualizeThreshold.
	 * Default: 200
	 */
	virtualizeThreshold?: number;

	/** Height of the scroll container. Default: 480 */
	height?: number | string;

	/**
	 * Estimated row height (px). Default: 40
	 * If your rows are variable height, set measureElement=true.
	 */
	estimateRowHeight?: number;

	/** Extra rows to render above/below viewport. Default: 10 */
	overscan?: number;

	/**
	 * Enable measuring real row heights (slower, but supports variable heights).
	 * Default: false
	 */
	measureElement?: boolean;

	/** Optional stable row id getter (recommended for dynamic data). */
	getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string;

	/** Styling + events */
	className?: string;
	rowClassName?: (row: Row<TData>) => string | undefined;
	cellClassName?: (opts: { row: Row<TData>; columnId: string }) => string | undefined;
	onRowClick?: (row: Row<TData>) => void;

	/** Render */
	children: React.ReactNode;

	/** Enable row selection */
	enableRowSelection?: boolean;

	/** Controlled selection */
	rowSelection?: RowSelectionState;
	onRowSelectionChange?: (updater: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => void;

	/** Uncontrolled initial selection */
	initialRowSelection?: RowSelectionState;
};

function RootInner<TData>(props: DataTableRootProps<TData>) {
	const {
		data,
		columns,
		virtualize = "auto",
		virtualizeThreshold = 200,
		height = 480,
		estimateRowHeight = 40,
		overscan = 10,
		measureElement = false,
		getRowId,
		className,
		rowClassName,
		cellClassName,
		onRowClick,
		children,
	} = props;

	const [rowSelectionInternal, setRowSelectionInternal] = React.useState<RowSelectionState>(props.initialRowSelection ?? {});

	const rowSelection = props.rowSelection ?? rowSelectionInternal;
	const onRowSelectionChange = props.onRowSelectionChange ?? ((updater) => setRowSelectionInternal(updater as any));

	const table = useReactTable<TData>({
		data,
		columns,
		getRowId,
		getCoreRowModel: getCoreRowModel(),
		enableRowSelection: props.enableRowSelection ?? false,
		state: {
			rowSelection,
		},
		onRowSelectionChange,
	});

	const rows = table.getRowModel().rows;

	const virtualEnabled = virtualize === "on" ? true : virtualize === "off" ? false : rows.length >= virtualizeThreshold;

	const parentRef = React.useRef<HTMLDivElement | null>(null);

	const rowVirtualizer = useVirtualizer({
		count: virtualEnabled ? rows.length : 0,
		getScrollElement: () => parentRef.current,
		estimateSize: () => estimateRowHeight,
		overscan,
		...(measureElement
			? {
					measureElement: (el: Element) => (el as HTMLElement).getBoundingClientRect().height,
				}
			: {}),
	});

	const virtualItems = virtualEnabled ? rowVirtualizer.getVirtualItems() : [];
	const totalSize = virtualEnabled ? rowVirtualizer.getTotalSize() : 0;

	const value = React.useMemo<DataTableContextValue<TData>>(
		() => ({
			table,
			rows,
			virtualEnabled,
			parentRef,
			rowVirtualizer: virtualEnabled ? rowVirtualizer : null,
			virtualItems,
			totalSize,
			rowClassName,
			cellClassName,
			onRowClick,
			enableRowSelection: props.enableRowSelection ?? false,
			rowSelection,
			onRowSelectionChange,
			initialRowSelection: props.initialRowSelection,
		}),
		[
			table,
			rows,
			virtualEnabled,
			rowVirtualizer,
			virtualItems,
			totalSize,
			rowClassName,
			cellClassName,
			onRowClick,
			rowSelection,
			onRowSelectionChange,
			props.enableRowSelection,
			props.initialRowSelection,
		]
	);

	return (
		<DataTableContext.Provider value={value}>
			<div
				ref={parentRef}
				className={cx("relative w-full overflow-auto rounded-md border bg-background", typeof height === "number" ? "" : "", className)}
				style={{ height }}
			>
				{children}
			</div>
		</DataTableContext.Provider>
	);
}

/**
 * DataTable primitives
 *
 * - <DataTable.Root data columns ...> (scroll container + state)
 * - <DataTable.Table> (outer layout wrapper)
 * - <DataTable.Header> (sticky header)
 * - <DataTable.Body> (virtualized or normal body)
 */
export type DataTableApi = {
	Root: <TData>(props: DataTableRootProps<TData>) => React.JSX.Element;

	useContext: <TData>() => DataTableContextValue<TData>;

	renderHeader: (header: Header<any, any>) => React.ReactNode;
	renderCell: (cell: Cell<any, any>) => React.ReactNode;
	renderFooter: (header: Header<any, any>) => React.ReactNode;

	Table: (props: { className?: string; children: React.ReactNode }) => React.JSX.Element;
	Header: (props: { className?: string }) => React.JSX.Element;
	Body: (props: { className?: string; empty?: React.ReactNode }) => React.JSX.Element;
};

export const DataTable: DataTableApi = {
	Root: RootInner as <TData>(props: DataTableRootProps<TData>) => React.JSX.Element,

	// ✅ expose context for UI wrappers
	useContext: useDataTableContext as <TData>() => DataTableContextValue<TData>,

	// ✅ render helpers for UI wrappers
	renderHeader: (header: Header<any, any>) => flexRender(header.column.columnDef.header, header.getContext()),

	renderCell: (cell: Cell<any, any>) => flexRender(cell.column.columnDef.cell, cell.getContext()),

	renderFooter: (header: Header<any, any>) => flexRender(header.column.columnDef.footer, header.getContext()),

	Table: function TableShell(props: { className?: string; children: React.ReactNode }) {
		return (
			<div className={cx("min-w-max", props.className)} role="table">
				{props.children}
			</div>
		);
	},

	Header: function Header(props: { className?: string }) {
		const { table } = useDataTableContext<any>();
		const headerGroups = table.getHeaderGroups();

		return (
			<div
				className={cx(
					"sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/75",
					props.className
				)}
				role="rowgroup"
			>
				{headerGroups.map((hg) => (
					<div key={hg.id} className="flex" role="row">
						{hg.headers.map((header) => (
							<div
								key={header.id}
								className={cx("flex-1 px-3 py-2 text-left text-sm font-medium text-foreground", "border-r last:border-r-0")}
								role="columnheader"
							>
								{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
							</div>
						))}
					</div>
				))}
			</div>
		);
	},

	Body: function Body(props: {
		className?: string;
		/** Optional empty state renderer */
		empty?: React.ReactNode;
	}) {
		const { rows, virtualEnabled } = useDataTableContext<any>();

		if (rows.length === 0) {
			return (
				<div className={cx("p-6 text-sm text-muted-foreground", props.className)} role="rowgroup">
					{props.empty ?? "No results."}
				</div>
			);
		}

		return virtualEnabled ? <VirtualBody className={props.className} /> : <NonVirtualBody className={props.className} />;
	},
} as const;

function NonVirtualBody<TData>(props: { className?: string }) {
	const { rows, rowClassName, cellClassName, onRowClick } = useDataTableContext<TData>();

	return (
		<div className={cx("divide-y", props.className)} role="rowgroup">
			{rows.map((row) => (
				<div
					key={row.id}
					className={cx("flex items-center", rowClassName?.(row), onRowClick ? "cursor-pointer" : "")}
					role="row"
					onClick={onRowClick ? () => onRowClick(row) : undefined}
				>
					{row.getVisibleCells().map((cell) => (
						<div
							key={cell.id}
							className={cx("flex-1 px-3 py-2 text-sm", "border-r last:border-r-0", cellClassName?.({ row, columnId: cell.column.id }))}
							role="cell"
						>
							{flexRender(cell.column.columnDef.cell, cell.getContext())}
						</div>
					))}
				</div>
			))}
		</div>
	);
}

function VirtualBody<TData>(props: { className?: string }) {
	const { rows, virtualItems, totalSize, rowClassName, cellClassName, onRowClick } = useDataTableContext<TData>();

	// IMPORTANT: we render a big "spacer" with absolutely positioned rows.
	return (
		<div className={cx("relative", props.className)} style={{ height: totalSize }} role="rowgroup">
			{virtualItems.map((vRow) => {
				const row = rows[vRow.index]!;
				return (
					<DataTableRow
						key={row.id}
						row={row}
						vRow={vRow}
						rowClassName={rowClassName}
						cellClassName={cellClassName}
						onRowClick={onRowClick}
					/>
				);
			})}
		</div>
	);
}

type DataTableRowProps<TData> = {
	row: Row<TData>;
	vRow: VirtualItem;
	rowClassName?: (row: Row<TData>) => string | undefined;
	cellClassName?: (opts: { row: Row<TData>; columnId: string }) => string | undefined;
	onRowClick?: (row: Row<TData>) => void;
	measureElement?: (el: HTMLDivElement | null) => void;
};

function DataTableRow<TData>({ row, vRow, rowClassName, cellClassName, onRowClick, measureElement }: DataTableRowProps<TData>) {
	return (
		<div
			ref={measureElement}
			className={cx("absolute left-0 top-0 w-full", "flex items-center", "border-b", rowClassName?.(row), onRowClick ? "cursor-pointer" : "")}
			role="row"
			style={{ transform: `translateY(${vRow.start}px)` }}
			onClick={onRowClick ? () => onRowClick(row) : undefined}
		>
			{row.getVisibleCells().map((cell) => (
				<div
					key={cell.id}
					className={cx("flex-1 px-3 py-2 text-sm", "border-r last:border-r-0", cellClassName?.({ row, columnId: cell.column.id }))}
					role="cell"
				>
					{flexRender(cell.column.columnDef.cell, cell.getContext())}
				</div>
			))}
		</div>
	);
}

/* -------------------------------------------------------------------------------------------------
Usage example:

import { DataTable } from "./DataTable";
import type { ColumnDef } from "@tanstack/react-table";

type Person = { id: string; name: string; email: string };

const columns: ColumnDef<Person>[] = [
  { accessorKey: "name", header: "Name", cell: (info) => info.getValue() },
  { accessorKey: "email", header: "Email", cell: (info) => info.getValue() },
];

export function PeopleTable({ data }: { data: Person[] }) {
  return (
    <DataTable.Root
      data={data}
      columns={columns}
      height={560}
      virtualize="auto"          // default
      virtualizeThreshold={200}  // auto turns on at 200 rows
      estimateRowHeight={40}
      overscan={12}
      onRowClick={(row) => console.log(row.original)}
    >
      <DataTable.Table>
        <DataTable.Header />
        <DataTable.Body empty={<div className="p-6">No people found.</div>} />
      </DataTable.Table>
    </DataTable.Root>
  );
}

-------------------------------------------------------------------------------------------------- */
