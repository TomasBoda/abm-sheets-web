import { CellId, SpreadsheetCell } from "../spreadsheet/spreadsheet.model";

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

export namespace Spreadsheet {
    export const data: Map<CellId, SpreadsheetCell> = new Map();

    export const get = (cellId: CellId): SpreadsheetCell => {
        return data.get(cellId) ?? { formula: "" };
    };

    export const set = (cellId: CellId, cell: SpreadsheetCell): void => {
        data.set(cellId, cell);
    };

    export const update = (
        cellId: CellId,
        cell: Partial<SpreadsheetCell>,
    ): void => {
        const data = Spreadsheet.get(cellId);
        Spreadsheet.set(cellId, { ...data, ...cell });
    };

    export const remove = (cellId: CellId): void => {
        Spreadsheet.data.delete(cellId);
    };

    export const clear = (): void => {
        Spreadsheet.data.clear();
    };
}
