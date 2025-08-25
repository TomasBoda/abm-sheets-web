import { MutableRefObject, useEffect, useMemo, useState } from "react";
import { CellId } from "../spreadsheet/spreadsheet.model";
import { SpreadsheetUtils } from "./spreadsheet.utils";

export interface UseSelectedRowsAndColsProps {
    selectedCells: Set<CellId>;
}

export const useSelectedRowsAndCols = ({
    selectedCells,
}: UseSelectedRowsAndColsProps) => {
    const selectedRows = useMemo(() => {
        const rows = new Set<number>();
        selectedCells.forEach((cellId) => {
            const coords = SpreadsheetUtils.cellIdToCoords(cellId);
            rows.add(coords.ri);
        });
        return rows;
    }, [selectedCells]);

    const selectedCols = useMemo(() => {
        const cols = new Set<number>();
        selectedCells.forEach((cellId) => {
            const coords = SpreadsheetUtils.cellIdToCoords(cellId);
            cols.add(coords.ci);
        });
        return cols;
    }, [selectedCells]);

    return { selectedRows, selectedCols };
};

export interface UseFormulaFocusProps {
    ref: MutableRefObject<HTMLInputElement>;
}

export const useFormulaFocus = ({ ref }: UseFormulaFocusProps) => {
    const [focused, setFocused] = useState(false);

    useEffect(() => {
        if (!ref.current) return;

        const handleFocus = () => setFocused(true);
        const handleBlur = () => setFocused(false);

        ref.current.addEventListener("focus", handleFocus);
        ref.current.addEventListener("blur", handleBlur);

        return () => {
            ref.current?.removeEventListener("focus", handleFocus);
            ref.current?.removeEventListener("blur", handleBlur);
        };
    }, [ref]);

    return { isFormulaFocused: focused };
};
