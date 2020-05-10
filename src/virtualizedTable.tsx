import React, { FC, useLayoutEffect, useRef } from "react";
import { AutoSizer, Table, Index } from "react-virtualized";
import "react-virtualized/styles.css";

const NoRows = () => {
	return <div>No data</div>;
};

interface Props {
	disableHeader?: boolean;
	headerHeight?: number;
	rowCount: number;
	noRowsRenderer?: () => JSX.Element | null;
	overscanRowCount?: number;
	rowHeight: number;
	rowGetter: (info: Index) => any;
	children?: React.ReactNode;
}

const rowClassName = ({ index }: { index: number }): string => {
	if (index === -1) {
		return "virtualized-table-row";
	}

	return `virtualized-table-row ${(index + 1) % 2 === 0 ? "even" : "odd"}`;
};

export const VirtualizedTable: FC<Props> = ({
	disableHeader = false,
	headerHeight = 35,
	rowCount,
	noRowsRenderer = NoRows,
	overscanRowCount = 10,
	rowHeight = 25,
	rowGetter,
	children,
}) => {
	const tableHeight = useRef<number>(500);

	useLayoutEffect(() => {
		const height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
		tableHeight.current = height - 200;
	}, [document.documentElement.clientHeight, window.innerHeight]);

	return (
		<AutoSizer>
			{({ width, height }) => (
				<Table
					headerClassName="virtualized-table-header-row"
					className="virtualized-table"
					rowClassName={rowClassName}
					disableHeader={disableHeader}
					headerHeight={headerHeight}
					height={tableHeight.current}
					noRowsRenderer={noRowsRenderer}
					estimatedRowSize={rowHeight}
					overscanRowCount={overscanRowCount}
					rowHeight={rowHeight}
					rowGetter={rowGetter}
					rowCount={rowCount}
					width={width}
				>
					{children}
				</Table>
			)}
		</AutoSizer>
	);
};

export default VirtualizedTable;
