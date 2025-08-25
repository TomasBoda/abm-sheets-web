import { CellId, History } from "@/components/spreadsheet/spreadsheet.model";
import { SpreadsheetUtils } from "@/components/spreadsheet/spreadsheet.utils";
import { compost as c } from "compostjs";
import {
    BooleanType,
    BooleanValue,
    CellLiteralValue,
    CellRangeValue,
    ErrorValue,
    FuncProps,
    GraphType,
    GraphValue,
    NumberType,
    NumberValue,
    PointType,
    PointValue,
    ShapeType,
    ShapeValue,
    StringType,
    StringValue,
    Value,
    ValueType,
} from "./runtime";

export const supportedFunctions = [
    "IF",
    "AND",
    "OR",
    "INDEX",
    "MATCH",
    "MIN",
    "MAX",
    "SUM",
    "PRODUCT",
    "AVERAGE",
    "COUNT",
    "COUNTIF",
    "ABS",
    "FLOOR",
    "CEILING",
    "POWER",
    "MMIN",
    "MMAX",
    "PI",
    "SIN",
    "COS",
    "TAN",
    "RADIANS",
    "RAND",
    "RANDBETWEEN",
    "CHOICE",
    "CONCAT",
    "LEFT",
    "RIGHT",
    "MID",
    "LEN",
    "ROUND",
    "PREV",
    "STEP",
    "POINT",
    "LINE",
    "AXES",
    "RENDER",
] as const;

export type FunctionName = (typeof supportedFunctions)[number];

// utils

const createNumber = (value: NumberType): NumberValue => ({
    type: ValueType.Number,
    value,
});

const createBoolean = (value: BooleanType): BooleanValue => ({
    type: ValueType.Boolean,
    value,
});

const createString = (value: StringType): StringValue => ({
    type: ValueType.String,
    value,
});

const createPoint = (value: PointType): PointValue => ({
    type: ValueType.Point,
    value,
});

const createShape = (value: ShapeType, label: string): ShapeValue => ({
    type: ValueType.Shape,
    value,
    label,
});

const createGraph = (value: GraphType): GraphValue => ({
    type: ValueType.Graph,
    value,
});

const createError = (value: string): ErrorValue => ({
    type: ValueType.Error,
    value,
});

// expect

const expectNumber = (args: Value[], index: number): NumberValue => {
    return expectArg(args, index, ValueType.Number) as NumberValue;
};

const expectBoolean = (args: Value[], index: number): BooleanValue => {
    return expectArg(args, index, ValueType.Boolean) as BooleanValue;
};

const expectString = (args: Value[], index: number): StringValue => {
    return expectArg(args, index, ValueType.String) as StringValue;
};

const expectCellLiteral = (args: Value[], index: number): CellLiteralValue => {
    return expectArg(args, index, ValueType.CellLiteral) as CellLiteralValue;
};

const expectCellRange = (args: Value[], index: number): CellRangeValue => {
    return expectArg(args, index, ValueType.CellRange) as CellRangeValue;
};

const expectPoint = (args: Value[], index: number): PointValue => {
    return expectArg(args, index, ValueType.Point) as PointValue;
};

const expectShape = (args: Value[], index: number): ShapeValue => {
    return expectArg(args, index, ValueType.Shape) as ShapeValue;
};

const expectArg = (args: Value[], index: number, type?: ValueType): Value => {
    if (args.length - 1 < index) {
        throw new Error("Not enough function arguments");
    }

    if (type && args[index].type !== type) {
        throw new Error("Function argument type mismatch");
    }

    return args[index];
};

const getHistoryValue = (cellId: CellId, step: number, history: History) => {
    const historyValue = history.get(cellId);

    if (historyValue !== undefined) {
        return historyValue[step];
    }

    return undefined;
};

const getCellRangeCellIds = (cellRange: CellRangeValue) => {
    const { start, end } = cellRange.value;

    const cellIds: CellId[] = [];

    for (let ri = start.ri; ri <= end.ri; ri++) {
        for (let ci = start.ci; ci <= end.ci; ci++) {
            const cellId = SpreadsheetUtils.cellCoordsToId({ ri, ci });
            cellIds.push(cellId);
        }
    }

    return cellIds;
};

export namespace Functions {
    // IF (BOOLEAN, ANY, ANY)
    export const conditional = ({ args }: FuncProps): Value => {
        const condition = expectBoolean(args, 0);
        const subsequent = expectArg(args, 1);
        const alternate = expectArg(args, 2);

        return condition.value ? subsequent : alternate;
    };

    // AND (...BOOLEAN)
    export const and = ({ args }: FuncProps): Value => {
        const values = args.map((_, i) => expectBoolean(args, i));
        const falseValues = values.filter((value) => !value.value);
        const result = falseValues.length === 0;

        return createBoolean(result);
    };

    // OR (...BOOLEAN)
    export const or = ({ args }: FuncProps): Value => {
        const values = args.map((_, i) => expectBoolean(args, i));
        const trueValues = values.filter((value) => value.value);
        const result = trueValues.length !== 0;

        return createBoolean(result);
    };

    // ABS (NUMBER)
    export const abs = ({ args }: FuncProps): Value => {
        const value = expectNumber(args, 0);
        const result = Math.abs(value.value);

        return createNumber(result);
    };

    // FLOOR (NUMBER)
    export const floor = ({ args }: FuncProps): Value => {
        const value = expectNumber(args, 0);
        const result = Math.floor(value.value);

        return createNumber(result);
    };

    // CEILING (NUMBER)
    export const ceiling = ({ args }: FuncProps): Value => {
        const value = expectNumber(args, 0);
        const result = Math.ceil(value.value);

        return createNumber(result);
    };

    // POWER (NUMBER, NUMBER)
    export const power = ({ args }: FuncProps): Value => {
        const value = expectNumber(args, 0);
        const power = expectNumber(args, 1);
        const result = Math.pow(value.value, power.value);

        return createNumber(result);
    };

    // MMIN (NUMBER, NUMBER)
    export const mmin = ({ args }: FuncProps): Value => {
        const value1 = expectNumber(args, 0);
        const value2 = expectNumber(args, 1);
        const result = Math.min(value1.value, value2.value);

        return createNumber(result);
    };

    // MMAX (NUMBER, NUMBER)
    export const mmax = ({ args }: FuncProps): Value => {
        const value1 = expectNumber(args, 0);
        const value2 = expectNumber(args, 1);
        const result = Math.max(value1.value, value2.value);

        return createNumber(result);
    };

    // RADIANS (NUMBER)
    export const radians = ({ args }: FuncProps): Value => {
        const value = expectNumber(args, 0);
        const result = (value.value / 180) * Math.PI;

        return createNumber(result);
    };

    // SIN (NUMBER)
    export const sin = ({ args }: FuncProps): Value => {
        const value = expectNumber(args, 0);
        const result = Math.sin(value.value);

        return createNumber(result);
    };

    // COS (NUMBER)
    export const cos = ({ args }: FuncProps): Value => {
        const value = expectNumber(args, 0);
        const result = Math.cos(value.value);

        return createNumber(result);
    };

    // TAN (NUMBER)
    export const tan = ({ args }: FuncProps): Value => {
        const value = expectNumber(args, 0);
        const result = Math.tan(value.value);

        return createNumber(result);
    };

    // PI ()
    export const pi = (): Value => {
        return createNumber(Math.PI);
    };

    // RAND ()
    export const rand = ({}: FuncProps): Value => {
        const result = Math.random();
        return createNumber(result);
    };

    // RANDBETWEEN (NUMBER, NUMBER)
    export const randbetween = ({ args }: FuncProps): Value => {
        const min = expectNumber(args, 0);
        const max = expectNumber(args, 1);
        const result =
            Math.floor(Math.random() * (max.value - min.value + 1)) + min.value;

        return createNumber(result);
    };

    // CHOICE (...ANY)
    export const choice = ({ args }: FuncProps): Value => {
        const index = Math.floor(Math.random() * args.length);
        const result = expectArg(args, index);

        return result;
    };

    // CONCAT (...ANY)
    export const concat = ({ args }: FuncProps): Value => {
        let result = "";

        for (let i = 0; i < args.length; i++) {
            switch (args[i].type) {
                case ValueType.Number:
                    result += (args[i] as NumberValue).value;
                    break;
                case ValueType.Boolean:
                    result += (args[i] as BooleanValue).value
                        ? "TRUE"
                        : "FALSE";
                    break;
                case ValueType.String:
                    result += (args[i] as StringValue).value;
                    break;
            }
        }

        return createString(result);
    };

    // LEFT (STRING, NUMBER)
    export const left = ({ args }: FuncProps): Value => {
        const value = expectString(args, 0);
        const offset = expectNumber(args, 1);

        const result = value.value.substring(0, offset.value);
        return createString(result);
    };

    // RIGHT (STRING, NUMBER)
    export const right = ({ args }: FuncProps): Value => {
        const value = expectString(args, 0);
        const offset = expectNumber(args, 1);

        const result = value.value.substring(value.value.length - offset.value);
        return createString(result);
    };

    // MID (STRING, NUMBER, NUMBER)
    export const mid = ({ args }: FuncProps): Value => {
        const value = expectString(args, 0);
        const offsetLeft = expectNumber(args, 1);
        const offsetRight = expectNumber(args, 2);

        if (offsetLeft.value + offsetRight.value >= value.value.length) {
            return createString("");
        }

        const result = value.value.substring(
            offsetLeft.value,
            value.value.length - offsetRight.value,
        );
        return createString(result);
    };

    // ROUND (STRING)
    export const len = ({ args }: FuncProps): Value => {
        const value = expectString(args, 0);

        const result = value.value.length;
        return createNumber(result);
    };

    // ROUND (NUMBER, NUMBER)
    export const round = ({ args }: FuncProps): Value => {
        const value = expectNumber(args, 0);
        const decimals = expectNumber(args, 1);

        const result = Number(value.value.toFixed(Math.max(decimals.value, 0)));
        return createNumber(result);
    };

    // INDEX (RANGE, NUMBER)
    export const index = ({ args, step, history }: FuncProps): Value => {
        const lookupRange = expectCellRange(args, 0);
        const index = expectNumber(args, 1);

        const { start, end } = lookupRange.value;

        const scaleType =
            start.ri === end.ri
                ? "column"
                : start.ci === end.ci
                  ? "row"
                  : "none";

        if (scaleType === "none") {
            throw new Error("Multi row/col ranges are not supported");
        }

        let ci: number;
        let ri: number;

        switch (scaleType) {
            case "row": {
                ci = start.ci;
                ri = start.ri + index.value;
                break;
            }
            case "column": {
                ci = start.ci + index.value;
                ri = start.ri;
                break;
            }
        }

        const cellId = SpreadsheetUtils.cellCoordsToId({ ri, ci });
        const value = getHistoryValue(cellId, step, history) ?? createNumber(0);

        return value;
    };

    // MATCH (ANY, RANGE)
    export const match = ({ args, step, history }: FuncProps): Value => {
        const lookupValue = args[0];
        const lookupRange = expectCellRange(args, 1);
        const cellIds = getCellRangeCellIds(lookupRange);

        const { start, end } = lookupRange.value;

        const scaleType =
            start.ri === end.ri
                ? "column"
                : start.ci === end.ci
                  ? "row"
                  : "none";

        if (scaleType === "none") {
            throw new Error("Multi row/col ranges are not supported");
        }

        for (const cellId of cellIds) {
            const { ri, ci } = SpreadsheetUtils.cellIdToCoords(cellId);

            const value =
                getHistoryValue(cellId, step, history) ?? createNumber(0);

            switch (args[0].type) {
                case ValueType.Number: {
                    if (value.value === (lookupValue as NumberValue).value) {
                        return scaleType === "row"
                            ? createNumber(ri - start.ri)
                            : createNumber(ci - start.ci);
                    }
                    break;
                }
                case ValueType.Boolean: {
                    if (value.value === (lookupValue as BooleanValue).value) {
                        return scaleType === "row"
                            ? createNumber(ri - start.ri)
                            : createNumber(ci - start.ci);
                    }
                    break;
                }
                case ValueType.String: {
                    if (value.value === (lookupValue as StringValue).value) {
                        return scaleType === "row"
                            ? createNumber(ri - start.ri)
                            : createNumber(ci - start.ci);
                    }
                    break;
                }
            }
        }

        return createNumber(-1);
    };

    // MIN (RANGE)
    export const min = ({ args, step, history }: FuncProps): Value => {
        const range = expectCellRange(args, 0);
        const cellIds = getCellRangeCellIds(range);

        const min = cellIds.reduce<number | undefined>((acc, cellId) => {
            const value = getHistoryValue(cellId, step, history);

            if (value === undefined || value.type !== ValueType.Number) {
                return acc;
            }

            const numberValue = value as NumberValue;
            return acc === undefined
                ? numberValue.value
                : Math.min(acc, numberValue.value);
        }, undefined);

        return createNumber(min);
    };

    // MAX (RANGE)
    export const max = ({ args, step, history }: FuncProps): Value => {
        const range = expectCellRange(args, 0);
        const cellIds = getCellRangeCellIds(range);

        const max = cellIds.reduce<number | undefined>((acc, cellId) => {
            const value = getHistoryValue(cellId, step, history);

            if (value === undefined || value.type !== ValueType.Number) {
                return acc;
            }

            const numberValue = value as NumberValue;
            return acc === undefined
                ? numberValue.value
                : Math.max(acc, numberValue.value);
        }, undefined);

        return createNumber(max);
    };

    // SUM (RANGE)
    export const sum = ({ args, step, history }: FuncProps): Value => {
        const range = expectCellRange(args, 0);
        const cellIds = getCellRangeCellIds(range);

        const sum = cellIds.reduce<number>((acc, cellId) => {
            const value = getHistoryValue(cellId, step, history);

            if (value === undefined || value.type !== ValueType.Number) {
                return acc;
            }

            const numberValue = value as NumberValue;
            return acc + numberValue.value;
        }, 0);

        return createNumber(sum);
    };

    // PRODUCT (RANGE)
    export const product = ({ args, step, history }: FuncProps): Value => {
        const range = expectCellRange(args, 0);
        const cellIds = getCellRangeCellIds(range);

        const sum = cellIds.reduce<number>((acc, cellId) => {
            const value = getHistoryValue(cellId, step, history);

            if (value === undefined || value.type !== ValueType.Number) {
                return acc;
            }

            const numberValue = value as NumberValue;
            return acc * numberValue.value;
        }, 1);

        return createNumber(sum);
    };

    // AVERAGE (RANGE)
    export const average = ({ args, step, history }: FuncProps): Value => {
        const range = expectCellRange(args, 0);
        const cellIds = getCellRangeCellIds(range);

        const sum = cellIds.reduce<[number, number]>(
            (acc, cellId) => {
                const value = getHistoryValue(cellId, step, history);

                if (value === undefined || value.type !== ValueType.Number) {
                    return acc;
                }

                const numberValue = value as NumberValue;
                return [acc[0] + numberValue.value, acc[1] + 1];
            },
            [0, 0],
        );

        if (sum[1] === 0) {
            return createNumber(0);
        }

        const average = sum[0] / sum[1];

        return createNumber(average);
    };

    // COUNT (RANGE)
    export const count = ({ args, step, history }: FuncProps): Value => {
        const range = expectCellRange(args, 0);
        const cellIds = getCellRangeCellIds(range);

        const count = cellIds.reduce<number>((acc, cellId) => {
            const value = getHistoryValue(cellId, step, history);

            if (value === undefined || value.type !== ValueType.Number) {
                return acc;
            }

            return acc + 1;
        }, 0);

        return createNumber(count);
    };

    // COUNTIF (RANGE, ANY)
    export const countif = ({ args, step, history }: FuncProps): Value => {
        const range = expectCellRange(args, 0);
        const matcher = expectArg(args, 1);
        const cellIds = getCellRangeCellIds(range);

        const count = cellIds.reduce<number>((acc, cellId) => {
            const value = getHistoryValue(cellId, step, history);

            if (value === undefined) {
                return acc;
            }

            if (value.type !== matcher.type) {
                return acc;
            }

            if (value.value === matcher.value) {
                return acc + 1;
            }

            return acc;
        }, 0);

        return createNumber(count);
    };

    // PREV (CELL, ?NUMBER?)
    export const prev = ({ args, step, history }: FuncProps): Value => {
        const cell = expectCellLiteral(args, 0);
        const offset =
            args.length === 2 ? expectNumber(args, 1) : createNumber(1);

        if (offset.value < 0) {
            return createError("Offset needs to be a positive number");
        }

        const cellId = SpreadsheetUtils.cellCoordsToId({
            ri: cell.value.ri,
            ci: cell.value.ci,
        });

        const value = getHistoryValue(cellId, step - offset.value, history);

        if (value === undefined) {
            return createNumber(0);
        }

        return value;
    };

    // STEP ()
    export const step = ({ step }: FuncProps): Value => {
        return createNumber(step);
    };
}

export namespace GraphFunctions {
    // POINT (NUMBER, NUMBER)
    export const point = ({ args }: FuncProps): Value => {
        const x = expectNumber(args, 0);
        const y = expectNumber(args, 1);

        return createPoint({ x: x.value, y: y.value });
    };

    // LINE (SHAPE)
    export const line = ({ args }: FuncProps): Value => {
        const points = args.map((_, i) => expectPoint(args, i));
        const compostPoints = points.map((point) => [
            point.value.x,
            point.value.y,
        ]);

        const graph = c.line(compostPoints) as ShapeType;
        return createShape(graph, "LINE");
    };

    // AXES (STRING, SHAPE)
    export const axes = ({ args }: FuncProps): Value => {
        const config = expectString(args, 0);
        const shape = expectShape(args, 1);

        const graph = c.axes(config.value, shape.value) as ShapeType;

        return createShape(graph, "AXES");
    };

    // RENDER (SHAPE)
    export const render = ({ args }: FuncProps): Value => {
        const shape = expectShape(args, 0);

        return createGraph(shape.value);
    };
}
