import { CellCoords, CellId } from "@/components/spreadsheet/spreadsheet.component";

export namespace Utils {

    export const cellCoordsToId = ({ ri, ci }: CellCoords): CellId => {
        const col = columnIndexToText(ci);
        const row = ri + 1;
        return `${col}${row}`;
    }

    export const cellIdToCoords = (cellId: CellId): CellCoords => {
        const match = cellId.match(/(\D+)(\d+)$/);

        if (!match) {
            throw new Error('Invalid CellId format');
        }

        const colPart = match[1];
        const rowPart = match[2];

        const ci = columnTextToIndex(colPart) - 1;
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
        return index;
    }

    export const getCellFormulaDependencies = (formula: string): CellCoords[] => {
        const regex = /\$?([A-Z]+)\$?([0-9]+)/g;
        const matches = [...formula.matchAll(regex)].map(match => {
            return {
                ri: parseInt(match[2]) - 1,
                ci: columnTextToIndex(match[1]) - 1,
            };
        });
        return matches;
    }
}