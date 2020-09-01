import React, { useMemo, ReactNode, useState, useEffect } from "react";
import { ActionRenderer, Renderers, ActionFunction } from "./types";

interface Props<T> {
	columns: {
		[K in keyof T]?: string;
	};
	data: T[];
	renderers?: Renderers<T>;
	actions?: (ActionRenderer<T> | ActionFunction<T>)[];
	icon?: ReactNode;
	className?: string;
	headerClassName?: string;
	onRowClick?: (row: T, index: number) => void;
	preselectedRow?: number;
}

export const DataGrid = <T extends object>({
	columns,
	data,
	renderers = {} as Renderers<T>,
	actions = [],
	icon,
	className,
	headerClassName,
	onRowClick,
	preselectedRow,
}: Props<T>) => {
	const columnEntries = useMemo<[[keyof T, string]]>(
		() => (Object.entries(columns) as unknown) as [[keyof T, string]],
		[columns]
	);

	const [selectedRow, selectRow] = useState<number>(preselectedRow as number);

	useEffect(() => {
		if (preselectedRow !== undefined && preselectedRow !== null) {
			handleRowClick(data[preselectedRow], preselectedRow);
		}
	}, [preselectedRow]);

	const handleRowClick = (row: T, index: number): void => {
		selectRow(index);
		if (onRowClick) {
			onRowClick(row, index);
		}
	};

	return (
		<table className={className}>
			<thead className={headerClassName}>
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
						<tr key={index} className={index === selectedRow ? "selected" : undefined}>
							{icon && <td>&nbsp;</td>}
							{columnEntries.map(([key, title]) => {
								const value = row[key];
								return (
									<td className={key as string} key={key as string} onClick={handleRowClick.bind(null, row, index)}>
										{renderers[key] ? renderers[key]!(value, row, key) : value}
									</td>
								);
							})}
							{actions.length > 0 && (
								<td>
									{actions.map((action) => {
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

export default DataGrid;
