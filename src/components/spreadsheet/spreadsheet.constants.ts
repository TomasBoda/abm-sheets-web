import { CellId, SpreadsheetData } from "../spreadsheet/spreadsheet.model";

// number of rows/columns in spreadsheet
export const SPREADSHEET_SIZE = 1000;

// number of rows/columns in one panel
export const CELL_COUNT = 25;
// number of panels in a spreadsheet row/column
export const PANEL_COUNT = SPREADSHEET_SIZE / CELL_COUNT;

// width of a spreadsheet cell in pixels
export const CELL_WIDTH = 120;
// height of a spreadsheet cell in pixels
export const CELL_HEIGHT = 30;

// default selected cell
export const DEFAULT_CELL: CellId = "A1";
// default simulation step
export const DEFAULT_STEP = 0;
// default number of simulation steps
export const DEFAULT_STEPS = 50;

export const createEmptySpreadsheet = (
    rowCount: number,
    colCount: number,
): SpreadsheetData => {
    const data = [];

    for (let i = 0; i < rowCount; i++) {
        const row = [];

        for (let j = 0; j < colCount; j++) {
            row.push({ formula: "", value: "" });
        }

        data.push(row);
    }

    return data;
};

export const SPREADSHEET_DATA: SpreadsheetData = createEmptySpreadsheet(
    SPREADSHEET_SIZE,
    SPREADSHEET_SIZE,
);
