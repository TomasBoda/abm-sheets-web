import { useState } from "react";
import { CellCoords, CellId, data } from "./spreadsheet.component";
import { Utils } from "@/utils/utils";

export const useSelection = () => {

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

    const selectionListeners = { handleMouseDown, handleMouseMove, handleMouseUp };

    return { selectedCells, selectAllCells, isCellSelected, selectionListeners, dragWithCopy };
}