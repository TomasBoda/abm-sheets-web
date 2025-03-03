
export type SpreadsheetCell = {
    formula: string;
    value: string;
};

export type SpreadsheetRow = SpreadsheetCell[];

export type SpreadsheetData = SpreadsheetRow[];