import { SpreadsheetData } from "./spreadsheet.model";

export class SpreadsheetUtil {

    public static createEmptySpreadsheet(rowCount: number, colCount: number): SpreadsheetData {
        const data = [];
    
        for (let i = 0; i < rowCount; i++) {
            const row = [];
    
            for (let i = 0; i < colCount; i++) {
                row.push({ formula: "", value: "" });
            }
    
            data.push(row);
        }
    
        return data;
    }
}