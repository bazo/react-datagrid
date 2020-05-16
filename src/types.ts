import { ReactNode } from "react";

export type CellRenderer<V, T> = (value: V, row?: T, key?: keyof T) => string | ReactNode;
export type ActionRenderer<T> = (row: T) => ReactNode;
export type ActionFunction<T> = (row: T) => ActionRenderer<T> | ReactNode;
export type Renderers<T> = {
	[K in keyof T]?: CellRenderer<T[K], T>;
};
