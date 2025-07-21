"use client";

import { ReactNode, createContext, useContext } from "react";
import { useCellInfo } from "./useCells";
import { data } from "@/components/spreadsheet/data";
import { Utils } from "@/utils/utils";
import { CellId } from "@/components/spreadsheet/spreadsheet.model";
import { useCellStyle } from "./useCellStyle";

type SpreadsheetContextType = {
    clear: () => void;
    exportData: () => object;
    loadData: (data: object) => void;
};

const SpreadsheetContext = createContext<SpreadsheetContextType | undefined>(
    undefined,
);

export const SpreadsheetProvider = ({ children }: { children: ReactNode }) => {
    const { setUsedCells, setGraphCells } = useCellInfo();
    const { setCellColors, setCellBolds, setCellItalics } = useCellStyle();

    const clear = () => {
        for (let ri = 0; ri < data.length; ri++) {
            for (let ci = 0; ci < data[ri].length; ci++) {
                data[ri][ci] = { value: "", formula: "" };
                Utils.getCellSpan({ ri, ci }).innerText = "";
            }
        }

        setUsedCells(new Set());
        setGraphCells(new Set());

        setCellColors(new Map());
        setCellBolds(new Map());
        setCellItalics(new Map());
    };

    const exportData = (): object => {
        const object = {};

        for (let ri = 0; ri < data.length; ri++) {
            for (let ci = 0; ci < data[ri].length; ci++) {
                const cellId = Utils.cellCoordsToId({ ri, ci });
                const { formula, value, color, font, isInGraph } = data[ri][ci];

                if (formula.trim() === "" && value.trim() === "") {
                    continue;
                }

                object[cellId] = { formula, value, color, font, isInGraph };
            }
        }

        return object;
    };

    const loadData = (object: object) => {
        const newUsedCells = new Set<CellId>();
        const newCellColors = new Map<CellId, string>();
        const newCellBolds = new Map<CellId, string>();
        const newCellItalics = new Map<CellId, string>();
        const newGraphCells = new Set<CellId>();

        for (const [key, _value] of Object.entries(object)) {
            const cellId = key as CellId;
            const { ri, ci } = Utils.cellIdToCoords(cellId);
            const { formula, value, color, font, isInGraph } = _value;

            data[ri][ci] = { formula, value, color, font, isInGraph };

            newUsedCells.add(cellId);

            if (color) {
                newCellColors.set(cellId, color);
            }

            if (font) {
                for (let i = 0; i < font.length; i++) {
                    if (font[i] === "bold") {
                        newCellBolds.set(cellId, "bold");
                    } else if (font[i] === "italic") {
                        newCellItalics.set(cellId, "italic");
                    }
                }
            }

            if (isInGraph) {
                newGraphCells.add(cellId);
            }
        }

        setUsedCells(newUsedCells);
        setCellColors(newCellColors);
        setCellBolds(newCellBolds);
        setCellItalics(newCellItalics);
        setGraphCells(newGraphCells);
    };

    const values = {
        clear,
        exportData,
        loadData,
    };

    return (
        <SpreadsheetContext.Provider value={values}>
            {children}
        </SpreadsheetContext.Provider>
    );
};

export const useSpreadsheet = () => {
    const context = useContext(SpreadsheetContext);

    if (!context) {
        throw new Error(
            "useSpreadsheet must be used within a SpreadsheetProvider",
        );
    }

    return context;
};
