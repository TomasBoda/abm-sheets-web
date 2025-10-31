import { Value } from "@/runtime/runtime";

// data of one cell in the spreadsheet
export type SpreadsheetCell = {
    formula: string;
    color?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
};

type SpreadsheetRow = SpreadsheetCell[];

export type SpreadsheetData = SpreadsheetRow[];

// id of a cell (e.g. "A1", "B2", "C3", etc.)
export type CellId = `${string}${number}`;

// coordinates of a cell (e.g. { ri: 0, ci: 0 } for cell "A1")
export type CellCoords = { ri: number; ci: number };

// object holding the history of the spreadsheet
export type History = Map<CellId, Value[]>;
