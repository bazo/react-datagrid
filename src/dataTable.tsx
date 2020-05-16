import React, { useMemo, ReactNode } from "react";
import VirtualizedTable from "./virtualizedTable";
import { Column, TableCellProps } from "react-virtualized";

interface ColumnWidths<T> {
	[key: string]: number;
}

type CellRenderer<V, T> = (value: V, row?: T, key?: keyof T) => string | ReactNode;
type ActionRenderer<T> = (row: T) => ReactNode;
type ActionFunction<T> = (row: T) => ActionRenderer<T> | ReactNode;
type Renderers<T> = {
	[K in keyof T]: CellRenderer<T[K], T>;
};

interface Props<T> {
	columns: {
		[K in keyof T]?: string;
	};
	columnWidths?: ColumnWidths<T>;
	data: T[];
	renderers?: Renderers<T>;
	actions?: (ActionRenderer<T> | ActionFunction<T>)[];
	virtual?: boolean;
	children?: React.ReactNode;
	defaultColumnWidth?: number;
	icon?: ReactNode;
}

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

const DataTable = <T extends object>({
	columns,
	columnWidths,
	defaultColumnWidth = 150,
	data,
	renderers = {} as Renderers<T>,
	actions = [],
	virtual = false,
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

	if (virtual) {
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
							columnWidths && columnWidths[key as string]
								? columnWidths[key as string]
								: defaultColumnWidth
						}
						cellRenderer={
							renderers[key] ? wrapRenderer<T[typeof key], T>(renderers[key]) : defaultCellRenderer
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
	}

	return (
		<table className="table table-striped table-hover table-sm">
			<thead className="thead-dark">
				<tr>
					{icon && <th>{icon}</th>}
					{columnEntries.map(([key, title]) => {
						return <th key={key as string}>{title}</th>;
					})}
					{actions.length > 0 && <th>Actions</th>}
				</tr>
			</thead>

			<tbody>
				{data.map((row, index) => {
					return (
						<tr key={index}>
							{icon && <td>&nbsp;</td>}
							{columnEntries.map(([key, title]) => {
								const value = row[key];
								return (
									<td key={key as string}>
										{renderers[key] ? renderers[key](value, row, key) : value}
									</td>
								);
							})}
							{actions.length > 0 && (
								<td>
									{actions.map(action => {
										const node = action(row);

										if (typeof node === "function") {
											return node(row);
										}
										return node;
									})}
									&nbsp;
								</td>
							)}
						</tr>
					);
				})}
			</tbody>
		</table>
	);
};

export default DataTable;
