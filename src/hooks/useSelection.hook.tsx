import { Utils } from "@/utils/utils";
import { createContext, ReactNode, useContext, useState } from "react";
import { data } from "../components/spreadsheet/data";
import { CellCoords, CellId } from "../components/spreadsheet/spreadsheet.model";

type SelectionContextType = {
    selectedCells: Set<CellId>;
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
  
const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export const SelectionProvider = ({ children }: { children: ReactNode; }) => {
  
    const [selectedCells, setSelectedCells] = useState(new Set<CellId>(["A1"]));
    const [dragging, setDragging] = useState(false);
    const [startPos, setStartPos] = useState({ ri: null, ci: null });

    const [dragWithCopy, setDragWithCopy] = useState(false);

    const handleMouseDown = ({ ri, ci }: CellCoords, dragWithCopy = false) => {
        setDragWithCopy(dragWithCopy);

        setDragging(true);
        setStartPos({ ri, ci });

        const newSelectedCells = new Set<CellId>();
        newSelectedCells.add(Utils.cellCoordsToId({ ri, ci }));
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
                newSelectedCells.add(Utils.cellCoordsToId({ ri: r, ci: c }));
            }
        }

        setSelectedCells(newSelectedCells);
    };

    const handleMouseUp = () => {
        setDragging(false);
    };

    const isCellSelected = ({ ri, ci }: CellCoords) => selectedCells.has(Utils.cellCoordsToId({ ri, ci }));

    const selectAllCells = (): void => {
        const newSelectedCells = new Set<CellId>();

        for (let ri = 0; ri < data.length; ri++) {
            for (let ci = 0; ci < data[ri].length; ci++) {
                newSelectedCells.add(Utils.cellCoordsToId({ ri, ci }));                
            }
        }

        setSelectedCells(newSelectedCells);
    }

    const deselectAllCells = (): void => {
        setSelectedCells(new Set<CellId>());
    }

    const selectionListeners = { handleMouseDown, handleMouseMove, handleMouseUp };

    const values = {
        selectedCells,
        selectAllCells,
        deselectAllCells,
        isCellSelected,
        selectionListeners,
        dragWithCopy,
    }

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