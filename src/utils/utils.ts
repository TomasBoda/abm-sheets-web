import { CellCoords, CellId, SpreadsheetData } from "@/components/spreadsheet/spreadsheet.model";

export namespace Utils {

    export const getCellIdsFromFormula = (formula: string): CellId[] => {
        const regex = /\$?([A-Z]+)\$?([0-9]+)/g;
        const cellIds = [...formula.matchAll(regex)].map(match => {
            const ri = parseInt(match[2]) - 1;
            const ci = Utils.columnTextToIndex(match[1]);
            return Utils.cellCoordsToId({ ri, ci });
        });
        return cellIds;
    }

    export const cellCoordsToId = ({ ri, ci }: CellCoords): CellId => {
        const col = columnIndexToText(ci);
        const row = ri + 1;
        return `${col}${row}`;
    }

    export const cellIdToCoords = (cellId: CellId): CellCoords => {
        const match = cellId.match(/(\D+)(\d+)$/);

        if (!match) {
            throw new Error("Invalid CellId format");
        }

        const colPart = match[1];
        const rowPart = match[2];

        const ci = columnTextToIndex(colPart);
        const ri = parseInt(rowPart) - 1;

        return { ri, ci };
    }

    export const columnIndexToText = (index: number): string => {
        let column = "";
        index += 1;

        while (index > 0) {
            index--;
            column = String.fromCharCode((index % 26) + "A".charCodeAt(0)) + column;
            index = Math.floor(index / 26);
        }

        return column;
    }
    
    export const columnTextToIndex = (text: string): number => {
        let index = 0;

        for (let i = 0; i < text.length; i++) {
            index = index * 26 + (text.charCodeAt(i) - "A".charCodeAt(0) + 1);
        }
        
        return index - 1;
    }

    export const getFormula = (formula: string): { defaultFormula?: string; primaryFormula?: string; }  => {
        const parts = formula.split(/(?<![!<>=])=(?![=])/);

        if (parts.length === 0) {
            return {
                defaultFormula: undefined,
                primaryFormula: undefined
            };
        }

        if (parts.length === 2) {
            return {
                defaultFormula: undefined,
                primaryFormula: parts[1],
            }
        }

        return {
            defaultFormula: parts[1],
            primaryFormula: parts[2],
        };
    }

    export const createEmptySpreadsheet = (rowCount: number, colCount: number): SpreadsheetData => {
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

    export const download = (data: any, filename?: string): void => {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = filename + ".json";

        document.body.appendChild(a); 
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }

    export const getCellSpan = (coords: CellCoords): HTMLSpanElement => {
        const cellId = Utils.cellCoordsToId(coords);
        const cellElement = document.getElementById(cellId) as HTMLDivElement;
        const spanElement = cellElement.children[0] as HTMLSpanElement;
        return spanElement;
    }
}