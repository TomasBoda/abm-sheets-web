
export type SpreadsheetCell = {
    formula: string;
    value: string;
};

export type SpreadsheetRow = SpreadsheetCell[];
export type SpreadsheetData = SpreadsheetRow[];

export type CellId = `${string}${number}`;

export type CellCoords = { ri: number; ci: number; };