import React, { useMemo, ReactNode } from "react";
import { ActionRenderer, Renderers, ActionFunction } from "./types";

interface Props<T> {
	columns: {
		[K in keyof T]?: string;
	};
	data: T[];
	renderers?: Renderers<T>;
	actions?: (ActionRenderer<T> | ActionFunction<T>)[];
	icon?: ReactNode;
}

export const DataGrid = <T extends object>({
	columns,
	data,
	renderers = {} as Renderers<T>,
	actions = [],
	icon,
}: Props<T>) => {
	const columnEntries = useMemo<[[keyof T, string]]>(
		() => (Object.entries(columns) as unknown) as [[keyof T, string]],
		[columns]
	);

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
										{renderers[key] ? renderers[key]!(value, row, key) : value}
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

export default DataGrid;
