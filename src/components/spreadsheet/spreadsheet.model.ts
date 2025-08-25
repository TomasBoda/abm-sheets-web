import { Value } from "@/runtime/runtime";

type SpreadsheetCell = {
    formula: string;
    color?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
};

type SpreadsheetRow = SpreadsheetCell[];

export type SpreadsheetData = SpreadsheetRow[];

export type CellId = `${string}${number}`;

export type CellCoords = { ri: number; ci: number };

export type History = Map<CellId, Value[]>;
