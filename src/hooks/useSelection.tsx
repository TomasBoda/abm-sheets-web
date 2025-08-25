"use client";

import {
    DEFAULT_CELL,
    SPREADSHEET_DATA,
} from "@/components/spreadsheet/spreadsheet.constants";
import { SpreadsheetUtils } from "@/components/spreadsheet/spreadsheet.utils";
import {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useContext,
    useState,
} from "react";
import {
    CellCoords,
    CellId,
} from "../components/spreadsheet/spreadsheet.model";

type SelectionContextType = {
    selectedCells: Set<CellId>;
    setSelectedCells: Dispatch<SetStateAction<Set<CellId>>>;
    selectAllCells: () => void;
    deselectAllCells: () => void;
    isCellSelected: (coords: CellCoords) => boolean;
    selectionListeners: {
        handleMouseDown: (coords: CellCoords, dragWithCopy?: boolean) => void;
        handleMouseMove: (coords: CellCoords) => void;
        handleMouseUp: () => void;
    };
    dragWithCopy: boolean;
};

const SelectionContext = createContext<SelectionContextType | undefined>(
    undefined,
);

export const SelectionProvider = ({ children }: { children: ReactNode }) => {
    const [selectedCells, setSelectedCells] = useState(
        new Set<CellId>([DEFAULT_CELL]),
    );
    const [dragging, setDragging] = useState(false);
    const [startPos, setStartPos] = useState({ ri: null, ci: null });

    const [dragWithCopy, setDragWithCopy] = useState(false);

    const handleMouseDown = ({ ri, ci }: CellCoords, dragWithCopy = false) => {
        setDragWithCopy(dragWithCopy);

        setDragging(true);
        setStartPos({ ri, ci });

        const newSelectedCells = new Set<CellId>();
        newSelectedCells.add(SpreadsheetUtils.cellCoordsToId({ ri, ci }));
        setSelectedCells(newSelectedCells);
    };

    const handleMouseMove = ({ ri, ci }: CellCoords) => {
        if (!dragging) return;

        const rowStart = Math.min(startPos.ri, ri);
        const rowEnd = Math.max(startPos.ri, ri);
        const colStart = Math.min(startPos.ci, ci);
        const colEnd = Math.max(startPos.ci, ci);

        const newSelectedCells = new Set<CellId>();

        for (let r = rowStart; r <= rowEnd; r++) {
            for (let c = colStart; c <= colEnd; c++) {
                newSelectedCells.add(
                    SpreadsheetUtils.cellCoordsToId({ ri: r, ci: c }),
                );
            }
        }

        setSelectedCells(newSelectedCells);
    };

    const handleMouseUp = () => {
        setDragging(false);
    };

    const isCellSelected = ({ ri, ci }: CellCoords) =>
        selectedCells.has(SpreadsheetUtils.cellCoordsToId({ ri, ci }));

    const selectAllCells = (): void => {
        const newSelectedCells = new Set<CellId>();

        for (let ri = 0; ri < SPREADSHEET_DATA.length; ri++) {
            for (let ci = 0; ci < SPREADSHEET_DATA[ri].length; ci++) {
                newSelectedCells.add(
                    SpreadsheetUtils.cellCoordsToId({ ri, ci }),
                );
            }
        }

        setSelectedCells(newSelectedCells);
    };

    const deselectAllCells = (): void => {
        setSelectedCells(new Set<CellId>());
    };

    const selectionListeners = {
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
    };

    const values = {
        selectedCells,
        setSelectedCells,
        selectAllCells,
        deselectAllCells,
        isCellSelected,
        selectionListeners,
        dragWithCopy,
    };

    return (
        <SelectionContext.Provider value={values}>
            {children}
        </SelectionContext.Provider>
    );
};

export const useSelection = () => {
    const context = useContext(SelectionContext);

    if (!context) {
        throw new Error("useSelection must be used within a SelectionContext");
    }

    return context;
};
