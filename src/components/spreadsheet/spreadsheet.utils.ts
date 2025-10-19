import { Evaluator } from "@/runtime/evaluator";
import {
    BooleanValue,
    CategoricalCoordValue,
    CellLiteralValue,
    NumberValue,
    PointValue,
    ScaleValue,
    ShapeValue,
    StringValue,
    Value,
    ValueType,
} from "@/runtime/runtime";
import { getSortedCells } from "@/utils/topological-sort";
import { Utils } from "@/utils/utils";
import { Spreadsheet } from "./spreadsheet.constants";
import { CellCoords, CellId, History } from "./spreadsheet.model";

export namespace SpreadsheetUtils {
    export const cellCoordsToId = ({ ri, ci }: CellCoords): CellId => {
        const col = SpreadsheetUtils.columnIndexToText(ci);
        const row = ri + 1;
        return `${col}${row}`;
    };

    export const cellIdToCoords = (cellId: CellId): CellCoords => {
        const match = cellId.match(/(\D+)(\d+)$/);

        if (!match) {
            throw new Error("Invalid CellId format");
        }

        const colPart = match[1];
        const rowPart = match[2];

        const ci = SpreadsheetUtils.columnTextToIndex(colPart);
        const ri = Number(rowPart) - 1;

        return { ri, ci };
    };

    export const columnIndexToText = (index: number): string => {
        let column = "";
        index += 1;

        while (index > 0) {
            index--;
            column =
                String.fromCharCode((index % 26) + "A".charCodeAt(0)) + column;
            index = Math.floor(index / 26);
        }

        return column;
    };

    export const columnTextToIndex = (text: string): number => {
        let index = 0;

        for (let i = 0; i < text.length; i++) {
            index = index * 26 + (text.charCodeAt(i) - "A".charCodeAt(0) + 1);
        }

        return index - 1;
    };

    export const getFormula = (
        formula: string,
    ): { defaultFormula?: string; primaryFormula?: string } => {
        const parts = formula.split(/(?<![!<>=])=(?![=])/);

        if (parts.length === 0) {
            return {
                defaultFormula: undefined,
                primaryFormula: undefined,
            };
        }

        if (parts.length === 2) {
            return {
                defaultFormula: undefined,
                primaryFormula: parts[1],
            };
        }

        return {
            defaultFormula: parts[1],
            primaryFormula: parts[2],
        };
    };

    export const getCellIdsFromFormula = (formula: string): CellId[] => {
        const regex = /\$?([A-Z]+)\$?([0-9]+)/g;
        const cellIds = [...formula.matchAll(regex)].map((match) => {
            const ri = parseInt(match[2]) - 1;
            const ci = SpreadsheetUtils.columnTextToIndex(match[1]);
            return SpreadsheetUtils.cellCoordsToId({ ri, ci });
        });
        return cellIds;
    };

    export const evaluate = (
        cells: CellId[],
        steps: number,
    ): History | undefined => {
        if (cells.length === 0) {
            return;
        }

        const cellsWithFormula = cells.filter((cellId) => {
            return Spreadsheet.get(cellId).formula.startsWith("=");
        });

        const sortedCells = getSortedCells(
            cellsWithFormula.map((cellId) => {
                const formula = Spreadsheet.get(cellId).formula;
                return { id: cellId, formula };
            }),
        );

        const errorCells = sortedCells.error ? sortedCells.cells : [];
        const successCells = sortedCells.error
            ? cellsWithFormula.filter((cellId) => !errorCells.includes(cellId))
            : sortedCells.cells;

        const history = new Evaluator().evaluateCells(successCells, steps);

        for (const errorCellId of errorCells) {
            const value: Value[] = [];

            for (let i = 0; i < steps; i++) {
                value.push({
                    type: ValueType.Error,
                    value:
                        "Cyclic dependency at cells " + errorCells.join(" > "),
                });
            }

            history.set(errorCellId, value);
        }

        return history;
    };

    export const shiftCellReference = (
        ref: string,
        colOffset: number,
        rowOffset: number,
    ): string => {
        const match = ref.match(/(\$?)([A-Z]+)(\$?)(\d+)/);

        if (!match) return ref;

        const [, colDollar, colLetters, rowDollar, rowNumber] = match;

        let newColLetters = colLetters;
        let newRowNumber = parseInt(rowNumber, 10);

        if (!colDollar) {
            const currentColIndex = colLetters
                .split("")
                .reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 64), 0);
            const newColIndex = currentColIndex + colOffset;

            newColLetters = "";
            let index = newColIndex;

            while (index > 0) {
                const charCode = ((index - 1) % 26) + 65;
                newColLetters = String.fromCharCode(charCode) + newColLetters;
                index = Math.floor((index - 1) / 26);
            }
        }

        if (!rowDollar) {
            newRowNumber += rowOffset;
        }

        return `${colDollar}${newColLetters}${rowDollar}${newRowNumber}`;
    };

    export const tryGetFormulaFromCellValue = (input: string) => {
        if (!isNaN(Number(input)) && input.trim() !== "") {
            return `= ${input.trim()}`;
        }

        return input.trim();
    };

    export const getValueText = (value: Value) => {
        switch (value.type) {
            case ValueType.Number:
                return getNumberValueText(value as NumberValue);
            case ValueType.Boolean:
                return getBooleanValueText(value as BooleanValue);
            case ValueType.String:
                return getStringValueText(value as StringValue);
            case ValueType.CellLiteral:
                return getCellLiteralValueText(value as CellLiteralValue);
            case ValueType.Range:
                return getRangeValueText();
            case ValueType.Point:
                return getPointValueText(value as PointValue);
            case ValueType.CategoricalCoord:
                return getCategoricalCoordValueText(
                    value as CategoricalCoordValue,
                );
            case ValueType.Shape:
                return getShapeValueText(value as ShapeValue);
            case ValueType.Graph:
                return getGraphValueText();
            case ValueType.Scale:
                return getScaleValueText(value as ScaleValue);
            case ValueType.Error:
                return getErrorValueText();
        }
    };

    export const getNumberValueText = (value: NumberValue) => {
        return Utils.getRoundedNumber(value.value).toLocaleString("en-US");
    };

    export const getBooleanValueText = (value: BooleanValue) => {
        return value.value ? "TRUE" : "FALSE";
    };

    export const getStringValueText = (value: StringValue) => {
        return value.value;
    };

    export const getCellLiteralValueText = (value: CellLiteralValue) => {
        const { ri, ci } = value.value;
        return SpreadsheetUtils.cellCoordsToId({ ri, ci });
    };

    export const getRangeValueText = () => {
        return "TIMERANGE";
    };

    export const getPointValueText = (value: PointValue) => {
        const { x, y } = Utils.handlePointValue(value);

        return `POINT [${typeof x === "string" ? x : `[${x}]`}, ${typeof y === "string" ? y : `[${y}]`}]`;
    };

    export const getCategoricalCoordValueText = (
        value: CategoricalCoordValue,
    ) => {
        const coord = Utils.roundCategoricalPoint(value.value);
        return `[${coord}]`;
    };

    export const getShapeValueText = (value: ShapeValue) => {
        return `${value.label}`;
    };

    export const getGraphValueText = () => {
        return `GRAPH`;
    };

    export const getScaleValueText = (value: ScaleValue) => {
        return `${value.label}`;
    };

    export const getErrorValueText = () => {
        return "#ERROR";
    };

    export const getCellElement = (cellId: CellId) => {
        return document.getElementById(cellId)
            ?.childNodes[0] as HTMLSpanElement;
    };

    export const updateCellText = (cellId: CellId, value: string) => {
        const element = getCellElement(cellId);
        if (!element) return;
        element.innerText = value;
    };
}
