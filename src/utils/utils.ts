import { CellCoords } from "@/components/spreadsheet/spreadsheet.component";

export namespace Utils {

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
}