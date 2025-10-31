import { MutableRefObject, useEffect, useMemo, useState } from "react";
import { CellId } from "../spreadsheet/spreadsheet.model";
import { SpreadsheetUtils } from "./spreadsheet.utils";

export interface UseSelectedRowsAndColsProps {
    selectedCells: Set<CellId>;
}

/**
 * Hook that calculates the indexes of selected rows and columns
 *
 * @param selectedCells - set of selected cell ids
 * @returns indexes of selected rows and columns
 */
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

/**
 * Hook that manages the focus state of the formula input
 *
 * @param ref - React Ref object to the formula input element
 * @returns focus state of the formula input
 */
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
