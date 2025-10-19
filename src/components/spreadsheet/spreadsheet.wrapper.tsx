import { useSelection } from "@/hooks/useSelection";
import { useSpreadsheet } from "@/hooks/useSpreadsheet";
import { useStepper } from "@/hooks/useStepper";
import { ErrorValue, ValueType } from "@/runtime/runtime";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { SpreadsheetCell, SpreadsheetComponent } from "./spreadsheet.component";
import { Spreadsheet, SPREADSHEET_SIZE } from "./spreadsheet.constants";
import { useFormulaFocus, useSelectedRowsAndCols } from "./spreadsheet.hooks";
import { CellCoords, CellId } from "./spreadsheet.model";
import { SpreadsheetUtils } from "./spreadsheet.utils";

import { useProjects } from "@/hooks/useProjects";
import { useSessionId } from "@/hooks/useSessionId";
import { useSyntaxHighlighting } from "@/hooks/useSyntaxHighlighting";
import { Logger } from "@/utils/logger";
import { StatusIcon } from "../status-icon";

export const SpreadsheetWrapper = () => {
    const formulaRef = useRef<HTMLInputElement>(null);

    const [formula, setFormula] = useState("");
    const [copiedCells, setCopiedCells] = useState(new Set<CellId>());
    const [referencedCells, setReferencedCells] = useState(new Set<CellId>());

    const { highlighted } = useSyntaxHighlighting({ value: formula });

    const { isFormulaFocused } = useFormulaFocus({ ref: formulaRef });

    const {
        selectedCells,
        setSelectedCells,
        selectionListeners,
        dragWithCopy,
        selectionBounds,
    } = useSelection();

    const { selectedRows, selectedCols } = useSelectedRowsAndCols({
        selectedCells,
    });

    const { step, steps } = useStepper();
    const spreadsheet = useSpreadsheet();
    const { project } = useProjects();

    const { sessionId } = useSessionId();

    useEffect(() => {
        Logger.log(sessionId, "formula-input", formula);
    }, [formula]);

    useEffect(() => {
        if (project !== undefined) {
            spreadsheet.file.loadImportedData(JSON.parse(project.data));
        } else {
            spreadsheet.clear();
        }
    }, [project]);

    // evaluate cells on change
    useEffect(() => {
        evaluateUsedCells();
    }, [spreadsheet.cells.usedCells]);

    useEffect(() => {
        for (const cellId of spreadsheet.cells.usedCells) {
            const value = spreadsheet.history.history.get(cellId)?.[step];
            const formula = Spreadsheet.get(cellId).formula;

            const text = value
                ? SpreadsheetUtils.getValueText(value)
                : formula.startsWith("=")
                  ? ""
                  : formula;

            SpreadsheetUtils.updateCellText(cellId, text);
        }
    }, [spreadsheet.cells.usedCells, spreadsheet.history.history, step]);

    // propagate formula input to cell data
    useEffect(() => {
        const selectedCell = getFirstSelectedCell();
        Spreadsheet.update(SpreadsheetUtils.cellCoordsToId(selectedCell), {
            formula,
        });

        if (isFormulaFocused) {
            SpreadsheetUtils.updateCellText(
                SpreadsheetUtils.cellCoordsToId(selectedCell),
                formula,
            );
        }
    }, [formula, isFormulaFocused]);

    // set referenced cells
    useEffect(() => {
        if (!isFormulaFocused) {
            setReferencedCells(new Set());
            return;
        }

        const cellIds = SpreadsheetUtils.getCellIdsFromFormula(formula);
        const referencedCells = new Set(cellIds);
        setReferencedCells(referencedCells);
    }, [formula, isFormulaFocused]);

    // select initial cell
    useEffect(() => {
        onCellClick(getFirstSelectedCell());
    }, []);

    const evaluateUsedCells = () => {
        const cells = Array.from(spreadsheet.cells.usedCells);
        const history = SpreadsheetUtils.evaluate(cells, steps);
        if (!history) return;
        spreadsheet.history.setHistory(history);
    };

    const onCellClick = ({ ri, ci }: CellCoords, event?: any) => {
        event?.preventDefault();

        Logger.log(
            sessionId,
            "cell-click",
            SpreadsheetUtils.cellCoordsToId({ ri, ci }),
        );

        if (isFormulaFocused) {
            onCellReferenceClick({ ri, ci });
            return;
        }

        if (event) {
            selectionListeners.handleMouseDown({ ri, ci });
        }

        setFormula(
            Spreadsheet.get(SpreadsheetUtils.cellCoordsToId({ ri, ci }))
                .formula,
        );
        getCellElement({ ri, ci })?.focus();
    };

    const onCellReferenceClick = ({ ri, ci }: CellCoords) => {
        if (!formulaRef.current) return;

        const cellId = SpreadsheetUtils.cellCoordsToId({ ri, ci });
        const { selectionStart, selectionEnd, value } = formulaRef.current;

        const textStart = value.substring(0, selectionStart);
        const textEnd = value.substring(selectionEnd);

        const newValue = textStart + cellId + textEnd;

        formulaRef.current.value = newValue;

        setFormula(newValue);

        const newPosition = selectionStart + cellId.length;
        formulaRef.current.setSelectionRange(newPosition, newPosition);
        formulaRef.current.focus();
    };

    const onCellDoubleClick = () => {
        formulaRef.current?.focus();
        formulaRef.current.setSelectionRange(formula.length, formula.length);
    };

    const onCellBackspace = () => {
        for (const selectedCellId of selectedCells) {
            Spreadsheet.update(selectedCellId, { formula: "" });
            spreadsheet.cells.removeUsedCell(selectedCellId);
            SpreadsheetUtils.updateCellText(selectedCellId, "");
        }

        setFormula("");
        evaluateUsedCells();
    };

    const onCellCopy = () => {
        const newCopiedCells = new Set<CellId>();

        for (const cellId of selectedCells) {
            newCopiedCells.add(cellId);
        }

        setCopiedCells(newCopiedCells);
    };

    const getPasteCellReferenceMap = () => {
        if (!dragWithCopy || !selectionBounds) return;

        if (
            selectionBounds.rowStart !== selectionBounds.rowEnd &&
            selectionBounds.colStart !== selectionBounds.colEnd
        ) {
            return;
        }

        const cellsToCopy = new Set<CellId>();

        for (
            let ri = selectionBounds.rowStart;
            ri <= selectionBounds.rowEnd;
            ri++
        ) {
            for (
                let ci = selectionBounds.colStart;
                ci <= selectionBounds.colEnd;
                ci++
            ) {
                cellsToCopy.add(SpreadsheetUtils.cellCoordsToId({ ri, ci }));
            }
        }

        const cellsToPaste = new Set<CellId>();

        for (const selectedCell of selectedCells) {
            if (!cellsToCopy.has(selectedCell)) {
                cellsToPaste.add(selectedCell);
            }
        }

        const cellMap = new Map<CellId, CellId[]>();

        for (const cellToCopy of cellsToCopy) {
            cellMap.set(cellToCopy, []);
        }

        for (const cellToPaste of cellsToPaste) {
            for (const cellToCopy of cellsToCopy) {
                if (
                    SpreadsheetUtils.cellIdToCoords(cellToPaste).ci ===
                        SpreadsheetUtils.cellIdToCoords(cellToCopy).ci ||
                    SpreadsheetUtils.cellIdToCoords(cellToPaste).ri ===
                        SpreadsheetUtils.cellIdToCoords(cellToCopy).ri
                ) {
                    cellMap.set(cellToCopy, [
                        ...cellMap.get(cellToCopy),
                        cellToPaste,
                    ]);
                    break;
                }
            }
        }

        return cellMap;
    };

    const onMouseUp = () => {
        if (!dragWithCopy || !selectionBounds) return;

        const cellMap = getPasteCellReferenceMap();
        const newUsedCells = new Set<CellId>(spreadsheet.cells.usedCells);

        for (const baseCell of cellMap.keys()) {
            const baseCellCoords = SpreadsheetUtils.cellIdToCoords(baseCell);

            for (const currentCell of cellMap.get(baseCell)) {
                const currentCellCoords =
                    SpreadsheetUtils.cellIdToCoords(currentCell);

                const rowOffset = currentCellCoords.ri - baseCellCoords.ri;
                const colOffset = currentCellCoords.ci - baseCellCoords.ci;

                const regex = /\$?[A-Z]+\$?\d+/g;

                const copiedCellFormula = Spreadsheet.get(baseCell).formula;

                const newFormula = copiedCellFormula.replace(regex, (match) =>
                    SpreadsheetUtils.shiftCellReference(
                        match,
                        colOffset,
                        rowOffset,
                    ),
                );

                Spreadsheet.update(currentCell, { formula: newFormula });

                const cellId =
                    SpreadsheetUtils.cellCoordsToId(currentCellCoords);
                newUsedCells.add(cellId);
            }
        }

        spreadsheet.cells.setUsedCells(newUsedCells);
        evaluateUsedCells();
    };

    const onCellPaste = () => {
        const currentCellCoors = SpreadsheetUtils.cellIdToCoords(
            Array.from(selectedCells)[0],
        );
        const copiedCellCoors = SpreadsheetUtils.cellIdToCoords(
            Array.from(copiedCells)[0],
        );

        const rowOffset = currentCellCoors.ri - copiedCellCoors.ri;
        const colOffset = currentCellCoors.ci - copiedCellCoors.ci;

        const regex = /\$?[A-Z]+\$?\d+/g;

        const newUsedCells: CellId[] = [];

        let formula: string;

        for (const copiedCell of copiedCells) {
            const cellRow =
                SpreadsheetUtils.cellIdToCoords(copiedCell).ri + rowOffset;
            const cellCol =
                SpreadsheetUtils.cellIdToCoords(copiedCell).ci + colOffset;

            const copiedCellFormula = Spreadsheet.get(copiedCell).formula;

            const newFormula = copiedCellFormula.replace(regex, (match) =>
                SpreadsheetUtils.shiftCellReference(
                    match,
                    colOffset,
                    rowOffset,
                ),
            );

            if (!formula) {
                formula = newFormula;
            }

            Spreadsheet.update(
                SpreadsheetUtils.cellCoordsToId({ ri: cellRow, ci: cellCol }),
                { formula: newFormula },
            );
            const cellId = SpreadsheetUtils.cellCoordsToId({
                ri: cellRow,
                ci: cellCol,
            });
            newUsedCells.push(cellId);
        }

        for (const usedCell of spreadsheet.cells.usedCells) {
            newUsedCells.push(usedCell);
        }
        spreadsheet.cells.setUsedCells(new Set(newUsedCells));

        setFormula(formula);
        formulaRef.current?.focus();

        setSelectedCells(
            new Set([SpreadsheetUtils.cellCoordsToId(currentCellCoors)]),
        );
        evaluateUsedCells();
    };

    const onCellArrowKeys = (
        key: "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight",
        cellId: CellId,
    ) => {
        const coords = SpreadsheetUtils.cellIdToCoords(cellId);

        switch (key) {
            case "ArrowUp": {
                coords.ri = Math.max(0, coords.ri - 1);
                break;
            }
            case "ArrowDown": {
                coords.ri = Math.min(999, coords.ri + 1);
                break;
            }
            case "ArrowLeft": {
                coords.ci = Math.max(0, coords.ci - 1);
                break;
            }
            case "ArrowRight": {
                coords.ci = Math.min(999, coords.ci + 1);
                break;
            }
        }

        const newCellId = SpreadsheetUtils.cellCoordsToId(coords);
        setSelectedCells(new Set([newCellId]));
        getCellElement(coords).focus();
        setFormula(Spreadsheet.get(newCellId).formula);
    };

    const onCellKeyDown = (
        cellId: CellId,
        event: KeyboardEvent<HTMLDivElement>,
    ) => {
        if (event.key === "Backspace") {
            event.preventDefault();
            onCellBackspace();
            return;
        }

        if (
            event.key === "ArrowUp" ||
            event.key === "ArrowDown" ||
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight"
        ) {
            event.preventDefault();
            onCellArrowKeys(event.key, cellId);
            return;
        }

        if (event.ctrlKey || event.metaKey) {
            if (event.key === "c") {
                event.preventDefault();
                onCellCopy();
                return;
            }

            if (event.key === "v") {
                event.preventDefault();
                onCellPaste();
                return;
            }

            return;
        }

        const cell = Spreadsheet.get(cellId);
        setFormula(cell.formula);

        formulaRef.current?.focus();
        formulaRef.current.setSelectionRange(
            cell.formula.length,
            cell.formula.length,
        );
    };

    const onFormulaEnter = () => {
        const coords = getFirstSelectedCell();

        const formula = SpreadsheetUtils.tryGetFormulaFromCellValue(
            Spreadsheet.get(SpreadsheetUtils.cellCoordsToId(coords)).formula,
        );
        Spreadsheet.update(SpreadsheetUtils.cellCoordsToId(coords), {
            formula,
        });

        if (formula.trim() !== "") {
            spreadsheet.cells.addUsedCell(
                SpreadsheetUtils.cellCoordsToId(coords),
            );
        } else {
            spreadsheet.cells.removeUsedCell(
                SpreadsheetUtils.cellCoordsToId(coords),
            );
        }

        moveToCellBelow(coords);
        evaluateUsedCells();
    };

    const onFormulaKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            onFormulaEnter();
            return;
        }
    };

    const getCellElement = (coords: CellCoords) => {
        const cellId = SpreadsheetUtils.cellCoordsToId(coords);
        return document.getElementById(cellId);
    };

    const getFirstSelectedCell = (): CellCoords => {
        const cellId = Array.from(selectedCells)[0];
        return SpreadsheetUtils.cellIdToCoords(cellId);
    };

    const getLastSelectedCell = (): CellCoords => {
        const cellId = Array.from(selectedCells)[selectedCells.size - 1];
        return SpreadsheetUtils.cellIdToCoords(cellId);
    };

    const moveToCellBelow = ({ ri, ci }: CellCoords) => {
        const newCoords = { ri: Math.min(ri + 1, SPREADSHEET_SIZE), ci };
        getCellElement(newCoords)?.focus();
        setSelectedCells(new Set([SpreadsheetUtils.cellCoordsToId(newCoords)]));
        setFormula(
            Spreadsheet.get(SpreadsheetUtils.cellCoordsToId(newCoords)).formula,
        );
    };

    const getCellText = (cellId: CellId) => {
        const value = spreadsheet.history.history.get(cellId)?.[step];
        const formula = Spreadsheet.get(cellId).formula;

        const text = value
            ? SpreadsheetUtils.getValueText(value)
            : formula.startsWith("=")
              ? ""
              : formula;

        return text;
    };

    const isErrorCell = (cellId: CellId) => {
        const value = spreadsheet.history.history.get(cellId)?.[step];
        return value?.type === ValueType.Error;
    };

    const getErrorText = (cellId: CellId) => {
        const value = spreadsheet.history.history.get(cellId)?.[step];

        if (!value || value.type !== ValueType.Error) {
            return "";
        }

        return (value as ErrorValue).value;
    };

    const getSelectedCellIndicatorText = () => {
        const first = SpreadsheetUtils.cellCoordsToId(getFirstSelectedCell());
        const last = SpreadsheetUtils.cellCoordsToId(getLastSelectedCell());

        if (selectedCells.size === 1) {
            return first;
        }

        return `${first}:${last}`;
    };

    const ErrorDisplay = () => {
        if (selectedCells.size !== 1) return null;

        const selectedCellId = SpreadsheetUtils.cellCoordsToId(
            getFirstSelectedCell(),
        );
        const value = spreadsheet.history.history.get(selectedCellId)?.[step];

        if (!value || value.type !== ValueType.Error) return null;

        const errorText = (value as ErrorValue).value;

        return (
            <ErrorContainer>
                <StatusIcon type="error" size={12} />
                {errorText}
            </ErrorContainer>
        );
    };

    return (
        <Container>
            <FormulaContainer>
                <SelectedCellIndicator>
                    {getSelectedCellIndicatorText()}
                </SelectedCellIndicator>

                <FormulaInputContainer>
                    <FormulaHighlightedContent
                        dangerouslySetInnerHTML={{ __html: highlighted }}
                    />
                    <FormulaInput
                        type="text"
                        value={formula}
                        onChange={(e) => setFormula(e.target.value)}
                        onKeyDown={(event) => onFormulaKeyDown(event)}
                        placeholder="fn"
                        autoComplete="nope"
                        ref={formulaRef}
                        $focused={isFormulaFocused}
                    />
                </FormulaInputContainer>

                <ErrorDisplay />
            </FormulaContainer>

            <SpreadsheetComponent
                selectedRows={selectedRows}
                selectedCols={selectedCols}
            >
                {({ ri, ci }) => {
                    const cellCoords: CellCoords = { ri, ci };
                    const cellId: CellId =
                        SpreadsheetUtils.cellCoordsToId(cellCoords);

                    const isThisSingleSelected =
                        selectedCells.size === 1 && selectedCells.has(cellId);

                    return (
                        <Cell
                            id={cellId}
                            key={cellId}
                            tabIndex={-1}
                            onKeyDown={(event) => onCellKeyDown(cellId, event)}
                            onDoubleClick={onCellDoubleClick}
                            onMouseDown={(event) =>
                                onCellClick(cellCoords, event)
                            }
                            onMouseEnter={() =>
                                selectionListeners.handleMouseMove(cellCoords)
                            }
                            onMouseUp={() => {
                                onMouseUp();
                                selectionListeners.handleMouseUp();
                            }}
                            $selected={selectedCells.has(cellId)}
                            $referenced={referencedCells.has(cellId)}
                            $bold={
                                !(isThisSingleSelected && isFormulaFocused) &&
                                !!spreadsheet.cells.style.getCellStyle(
                                    cellId,
                                    "bold",
                                )
                            }
                            $italic={
                                !(isThisSingleSelected && isFormulaFocused) &&
                                !!spreadsheet.cells.style.getCellStyle(
                                    cellId,
                                    "italic",
                                )
                            }
                            $underline={
                                !(isThisSingleSelected && isFormulaFocused) &&
                                !!spreadsheet.cells.style.getCellStyle(
                                    cellId,
                                    "underline",
                                )
                            }
                            $color={
                                !(isThisSingleSelected && isFormulaFocused) &&
                                spreadsheet.cells.style.getCellStyle(
                                    cellId,
                                    "color",
                                )
                            }
                            $error={isErrorCell(cellId)}
                            title={getErrorText(cellId)}
                        >
                            <span>{getCellText(cellId)}</span>
                            <CellDrag
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    selectionListeners.handleMouseDown(
                                        { ri, ci },
                                        true,
                                    );
                                }}
                            />
                        </Cell>
                    );
                }}
            </SpreadsheetComponent>
        </Container>
    );
};

interface CellProps {
    $selected: boolean;
    $referenced: boolean;
    $bold: boolean;
    $italic: boolean;
    $underline: boolean;
    $color?: string;
    $error: boolean;
}

const Cell = styled(SpreadsheetCell)<CellProps>`
    position: relative;

    color: var(--text-1);
    font-size: 12px;
    font-weight: 500;
    line-height: 100%;
    letter-spacing: 1px;

    display: flex;
    flex-direction: column;
    justify-content: center;

    padding: 5px;

    outline: none;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    cursor: default;

    ${({ $selected }) =>
        $selected &&
        `
            background-color: var(--bg-2);
    `};

    ${({ $referenced }) =>
        $referenced &&
        `
            border: 1.5px solid var(--color-yellow-text);
            border-radius: 3px;
    `};

    ${({ $color }) => $color && `background-color: ${$color};`};

    ${({ $error }) =>
        $error &&
        `
            background-color: var(--color-red-bg);
            border: 1.5px solid var(--color-red-text);
    `};

    & span {
        ${({ $bold }) => $bold && `font-weight: 700;`};
        ${({ $italic }) => $italic && `font-style: italic;`};
        ${({ $underline }) => $underline && `text-decoration: underline;`};
    }
`;

const CellDrag = styled.div`
    position: absolute;
    right: 0px;
    bottom: 0px;
    width: 15px;
    height: 10px;

    cursor: cell;

    transition: all 150ms;
`;

const Container = styled.div`
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
`;

const FormulaContainer = styled.div`
    width: 100%;

    display: flex;
    flex-direction: row;
    align-items: center;

    border: 1px solid var(--bg-5);
    border-bottom: none;

    border-top-left-radius: 10px;
    border-top-right-radius: 10px;

    overflow: hidden;
`;

const SelectedCellIndicator = styled.div`
    min-width: 100px;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    padding: 8px 16px;

    font-size: 12px;
    font-weight: 500;
    line-height: 100%;
    letter-spacing: 1px;

    background-color: var(--bg-1);
`;

const FormulaInputContainer = styled.div`
    width: 100%;
    position: relative;
    background-color: var(--bg-1);
    border-left: 1px solid var(--bg-5);
`;

const FormulaHighlightedContent = styled.div`
    position: absolute;
    left: 0px;
    top: 0px;

    font-size: 12px;
    font-weight: 500;
    line-height: 100%;
    letter-spacing: 1px;

    width: 100%;
    height: 100%;

    border: none;
    outline: none;

    padding: 8px 16px;

    color: var(--text-1);
`;

const FormulaInput = styled.input<{ $focused: boolean }>`
    position: relative;

    width: 100%;

    font-size: 12px;
    font-weight: 500;
    line-height: 100%;
    letter-spacing: 1px;

    padding: 8px 16px;

    border: none;
    outline: none;

    color: transparent;
    background-color: transparent;
    caret-color: var(--text-1);
`;

const ErrorContainer = styled.span`
    color: var(--error-text);
    font-size: 12px;
    font-weight: 500;
    line-height: 100%;
    white-space: nowrap;

    background-color: var(--error-bg);

    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 5px;

    padding: 5px 10px;

    height: 100%;
`;
