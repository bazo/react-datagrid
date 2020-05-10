import React, { useMemo, ReactNode } from "react";
import VirtualizedTable from "./virtualizedTable";
import { Column, TableCellProps } from "react-virtualized";

interface Columns {
	[key: string]: string;
}
interface ColumnWidths {
	[key: string]: number;
}

type CellRenderer = (value: any, row?: object) => string | ReactNode;
type ActionRenderer = (row: object) => ReactNode;

interface Props {
	columns: Columns;
	columnWidths?: ColumnWidths;
	data: {
		[K in keyof Columns]: any;
	}[];
	renderers?: {
		[K in keyof Columns]: CellRenderer;
	};
	actions?: ActionRenderer[];
	virtual?: boolean;
	children?: React.ReactNode;
	defaultColumnWidth?: number;
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

const wrapRenderer = (renderer: CellRenderer) => ({
	cellData,
	columnData,
	columnIndex,
	dataKey,
	isScrolling,
	rowData,
	rowIndex,
}: TableCellProps): ReactNode => renderer(cellData, rowData);

const actionsRenderer = (actions: ActionRenderer[]) => ({
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

export const DataTable = ({
	columns,
	columnWidths,
	defaultColumnWidth = 150,
	data,
	renderers = {},
	actions = [],
	virtual = false,
	children,
}: Props) => {
	const columnEntries = useMemo(() => Object.entries(columns), [columns]);

	const rowGetter = ({ index }: { index: number }) => {
		return data[index];
	};

	if (virtual) {
		let columns: React.ReactElement<any, typeof Column>[] = [];

		if (!children) {
			columns = columnEntries.map(([key, title]) => {
				return (
					<Column
						key={key}
						dataKey={key}
						label={title}
						headerClassName={`header ${key}`}
						className={`cell ${key}`}
						width={columnWidths && columnWidths[key] ? columnWidths[key] : defaultColumnWidth}
						cellRenderer={renderers[key] ? wrapRenderer(renderers[key]) : defaultCellRenderer}
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
						cellRenderer={actionsRenderer(actions)}
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
					{columnEntries.map(([key, title]) => {
						return <th key={key}>{title}</th>;
					})}
					{actions.length > 0 && <th>Actions</th>}
				</tr>
			</thead>

			<tbody>
				{data.map((row, index) => {
					return (
						<tr key={index}>
							{columnEntries.map(([key, title]) => {
								const value = row[key];
								return <td key={key}>{renderers[key] ? renderers[key](value, row) : value}</td>;
							})}
							{actions.length > 0 && (
								<td>
									{actions.map(action => {
										return action(row);
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
