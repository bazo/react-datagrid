import React, { useMemo, ReactNode } from "react";
import VirtualizedTable from "./virtualizedTable";
import { Column, TableCellProps } from "react-virtualized";
import { CellRenderer, ActionRenderer, ActionFunction, Renderers } from "./types";

const defaultCellRenderer = ({
	cellData,
	columnData,
	columnIndex,
	dataKey,
	isScrolling,
	rowData,
	rowIndex,
}: TableCellProps): ReactNode => {
	return cellData;
};

const wrapRenderer = <V, T>(renderer: CellRenderer<V, T>) => ({
	cellData,
	columnData,
	columnIndex,
	dataKey,
	isScrolling,
	rowData,
	rowIndex,
}: TableCellProps): ReactNode => renderer(cellData, rowData);

const actionsRenderer = <T,>(actions: ActionRenderer<T>[]) => ({
	cellData,
	columnData,
	columnIndex,
	dataKey,
	isScrolling,
	rowData,
	rowIndex,
}: TableCellProps): ReactNode => {
	return actions.map(action => {
		return action(rowData);
	});
};

interface ColumnWidths<T> {
	[key: string]: number;
}

interface Props<T> {
	columns: {
		[K in keyof T]?: string;
	};
	columnWidths?: ColumnWidths<T>;
	data: T[];
	renderers?: Renderers<T>;
	actions?: (ActionRenderer<T> | ActionFunction<T>)[];
	children?: React.ReactNode;
	defaultColumnWidth?: number;
	icon?: ReactNode;
}

export const VirtualizedDataGrid = <T extends object>({
	columns,
	columnWidths,
	defaultColumnWidth = 150,
	data,
	renderers = {} as Renderers<T>,
	actions = [],
	children,
	icon,
}: Props<T>) => {
	const columnEntries = useMemo<[[keyof T, string]]>(
		() => (Object.entries(columns) as unknown) as [[keyof T, string]],
		[columns]
	);

	const rowGetter = ({ index }: { index: number }) => {
		return data[index];
	};

	if (!children) {
		let columns = columnEntries.map(entry => {
			const [key, title] = entry as [keyof T, string];
			return (
				<Column
					key={key as string}
					dataKey={key as string}
					label={title}
					headerClassName={`header ${key}`}
					className={`cell ${key}`}
					width={
						columnWidths && columnWidths[key as string] ? columnWidths[key as string] : defaultColumnWidth
					}
					cellRenderer={
						renderers[key] ? wrapRenderer<T[typeof key], T>(renderers[key]!) : defaultCellRenderer
					}
				/>
			);
		});

		if (actions.length > 0)
			columns.push(
				<Column
					key="actions"
					dataKey="actions"
					label="Actions"
					headerClassName={`header actions`}
					className={`cell actions`}
					width={200 + (actions.length - 1) * 50}
					cellRenderer={actionsRenderer<T>(actions)}
					disableSort={true}
				/>
			);
	}

	return (
		<VirtualizedTable rowCount={data.length} rowGetter={rowGetter} rowHeight={20}>
			{children ? children : columns}
		</VirtualizedTable>
	);
};

export default VirtualizedDataGrid;
