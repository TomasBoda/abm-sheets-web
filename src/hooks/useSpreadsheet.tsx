"use client";

import {
    Spreadsheet,
    SPREADSHEET_SIZE,
} from "@/components/spreadsheet/spreadsheet.constants";
import { CellId, History } from "@/components/spreadsheet/spreadsheet.model";
import { SpreadsheetUtils } from "@/components/spreadsheet/spreadsheet.utils";
import { Value } from "@/runtime/runtime";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

interface CellStyle {
    color?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
}

type CellStyleMap = Map<CellId, CellStyle>;

type SpreadsheetContextType = {
    cells: {
        usedCells: Set<CellId>;
        setUsedCells: (usedCells: Set<CellId>) => void;
        addUsedCell: (cellId: CellId) => void;
        removeUsedCell: (cellId: CellId) => void;

        style: {
            cellStyles: CellStyleMap;
            setCellStyles: (cellStyles: CellStyleMap) => void;
            getCellStyle: <K extends keyof CellStyle>(
                cellId: CellId,
                key: K,
            ) => CellStyle[K] | undefined;
            setCellStyle: <K extends keyof CellStyle>(
                cellId: CellId,
                key: K,
                value: CellStyle[K],
            ) => void;
            clearCellStyle: (cellId: CellId) => void;
        };
    };

    history: {
        history: History;
        setHistory: (history: History) => void;
    };

    file: {
        getExportedData: () => object;
        loadImportedData: (data: object) => void;
    };

    clear: () => void;
};

const SpreadsheetContext = createContext<SpreadsheetContextType | undefined>(
    undefined,
);

const useCells = () => {
    const [usedCells, setUsedCells] = useState<Set<CellId>>(new Set());

    const addUsedCell = (cellId: CellId) => {
        const newUsedCells = new Set(usedCells);
        newUsedCells.add(cellId);
        setUsedCells(newUsedCells);
    };

    const removeUsedCell = (cellId: CellId) => {
        const newUsedCells = new Set(usedCells);
        newUsedCells.delete(cellId);
        setUsedCells(newUsedCells);
    };

    return { usedCells, setUsedCells, addUsedCell, removeUsedCell };
};

const useStyle = () => {
    const [cellStyles, setCellStyles] = useState<CellStyleMap>(new Map());

    useEffect(() => {
        for (const [cellId, styles] of cellStyles.entries()) {
            Spreadsheet.update(cellId, { ...styles });
        }
    }, [cellStyles]);

    const getCellStyle = <K extends keyof CellStyle>(
        cellId: CellId,
        key: K,
    ) => {
        const cellStyle = cellStyles.get(cellId);
        return cellStyle?.[key];
    };

    const setCellStyle = <K extends keyof CellStyle>(
        cellId: CellId,
        key: K,
        value: CellStyle[K],
    ) => {
        setCellStyles((prev) => {
            const newCellStyles = new Map(prev);
            const current = newCellStyles.get(cellId) ?? {};
            newCellStyles.set(cellId, { ...current, [key]: value });
            return newCellStyles;
        });
    };

    const clearCellStyle = (cellId: CellId) => {
        setCellStyles((prev) => {
            const newCellStyles = new Map(prev);
            newCellStyles.delete(cellId);
            return newCellStyles;
        });
    };

    return {
        cellStyles,
        setCellStyles,
        getCellStyle,
        setCellStyle,
        clearCellStyle,
    };
};

const useHistory = () => {
    const [history, setHistory] = useState<History>(new Map<CellId, Value[]>());

    return { history, setHistory };
};

export const SpreadsheetProvider = ({ children }: { children: ReactNode }) => {
    const cells = useCells();
    const style = useStyle();
    const history = useHistory();

    const clear = () => {
        for (let ri = 0; ri < SPREADSHEET_SIZE; ri++) {
            for (let ci = 0; ci < SPREADSHEET_SIZE; ci++) {
                const cellId = SpreadsheetUtils.cellCoordsToId({ ri, ci });
                Spreadsheet.remove(cellId);
                SpreadsheetUtils.updateCellText(cellId, "");
            }
        }

        cells.setUsedCells(new Set());
        style.setCellStyles(new Map());
        history.setHistory(new Map());
    };

    const getExportedData = (): object => {
        const object = {};

        for (let ri = 0; ri < SPREADSHEET_SIZE; ri++) {
            for (let ci = 0; ci < SPREADSHEET_SIZE; ci++) {
                const cellId = SpreadsheetUtils.cellCoordsToId({ ri, ci });

                if (Spreadsheet.get(cellId).formula.trim() === "") {
                    continue;
                }

                object[cellId] = { ...Spreadsheet.get(cellId) };
            }
        }

        return object;
    };

    const loadImportedData = (importedData: object) => {
        clear();

        const newUsedCells = new Set<CellId>();

        for (const [key, value] of Object.entries(importedData)) {
            const cellId = key as CellId;
            const { formula, color, bold, italic, underline } = value;

            Spreadsheet.set(cellId, {
                formula,
                color,
                bold,
                italic,
                underline,
            });

            style.setCellStyle(cellId, "color", color);
            style.setCellStyle(cellId, "bold", bold);
            style.setCellStyle(cellId, "italic", italic);
            style.setCellStyle(cellId, "underline", underline);

            newUsedCells.add(cellId);
        }

        cells.setUsedCells(newUsedCells);
    };

    const values = {
        cells: { ...cells, style },
        history,
        file: {
            getExportedData,
            loadImportedData,
        },
        clear,
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
