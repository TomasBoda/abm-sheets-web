import { CellCoords, CellId } from "@/components/spreadsheet/spreadsheet.model";

export namespace Utils {

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

    export const download = (data: any): void => {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "export.json";

        document.body.appendChild(a); 
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }
}