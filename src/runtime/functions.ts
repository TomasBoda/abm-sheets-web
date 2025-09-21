import { CellId, History } from "@/components/spreadsheet/spreadsheet.model";
import { SpreadsheetUtils } from "@/components/spreadsheet/spreadsheet.utils";
import { compost as c, scale as s } from "compostjs";
import {
    BooleanType,
    BooleanValue,
    CategoricalCoord,
    CategoricalCoordValue,
    CellLiteralValue,
    ErrorValue,
    FuncProps,
    GraphType,
    GraphValue,
    NumberType,
    NumberValue,
    PointType,
    PointValue,
    RangeType,
    RangeValue,
    ScaleType,
    ScaleValue,
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
    "NORM",
    "PI",
    "SIN",
    "COS",
    "TAN",
    "LOG",
    "EXP",
    "SQRT",
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
    "STEPS",
    "TIMERANGE",

    "POINT",
    "CATEGORICALCOORD",
    "LINE",
    "COLUMN",
    "SHAPE",
    "BAR",
    "BUBBLE",
    "TEXT",
    "FILLCOLOR",
    "STROKECOLOR",
    "FONT",
    "PADDING",
    "AXES",
    "OVERLAY",
    "RENDER",
    "NEST",
    "SCALECONTINUOUS",
    "SCALEY",
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

const createRange = (value: RangeType): RangeValue => ({
    type: ValueType.Range,
    value,
});

const createPoint = (value: PointType): PointValue => ({
    type: ValueType.Point,
    value,
});

const createCategoricalCoord = (
    value: CategoricalCoord,
): CategoricalCoordValue => ({
    type: ValueType.CategoricalCoord,
    value,
});

const createShape = (value: ShapeType, label: string): ShapeValue => ({
    type: ValueType.Shape,
    value,
    label,
});

const createScale = (value: ScaleType, label: string): ScaleValue => ({
    type: ValueType.Scale,
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

const expectRange = (args: Value[], index: number): RangeValue => {
    return expectArg(args, index, ValueType.Range) as RangeValue;
};

const expectPoint = (args: Value[], index: number): PointValue => {
    return expectArg(args, index, ValueType.Point) as PointValue;
};

const expectCategoricalCoord = (
    args: Value[],
    index: number,
): CategoricalCoordValue => {
    return expectArg(
        args,
        index,
        ValueType.CategoricalCoord,
    ) as CategoricalCoordValue;
};

const expectShape = (args: Value[], index: number): ShapeValue => {
    return expectArg(args, index, ValueType.Shape) as ShapeValue;
};

const expectScale = (args: Value[], index: number): ScaleValue => {
    return expectArg(args, index, ValueType.Scale) as ScaleValue;
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

const parseArgs = (args: Value[]): Value[] => {
    const parsedArgs: Value[] = [];

    for (let i = 0; i < args.length; i++) {
        if (args[i].type === ValueType.Range) {
            const range = args[i] as RangeValue;

            for (const value of range.value) {
                parsedArgs.push(value);
            }
        } else {
            parsedArgs.push(args[i]);
        }
    }

    return parsedArgs;
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

    // NORM ()
    export const norm = (): Value => {
        const randNorm = () => {
            let u = 0;
            let v = 0;

            while (u === 0) u = Math.random();
            while (v === 0) v = Math.random();

            return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        };

        const result = randNorm();
        return createNumber(result);
    };

    // PI ()
    export const pi = (): Value => {
        return createNumber(Math.PI);
    };

    // LOG (NUMBER)
    export const log = ({ args }: FuncProps): Value => {
        const value = expectNumber(args, 0);
        const result = Math.log(value.value);
        return createNumber(result);
    };

    // EXP (NUMBER)
    export const exp = ({ args }: FuncProps): Value => {
        const value = expectNumber(args, 0);
        const result = Math.exp(value.value);
        return createNumber(result);
    };

    // SQRT (NUMBER)
    export const sqrt = ({ args }: FuncProps): Value => {
        const value = expectNumber(args, 0);
        const result = Math.sqrt(value.value);
        return createNumber(result);
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
    export const index = ({ args }: FuncProps): Value => {
        const lookupRange = expectRange(args, 0);
        const index = expectNumber(args, 1);

        if (index.value > lookupRange.value.length - 1) {
            return createNumber(0);
        }

        return lookupRange.value[index.value];
    };

    // MATCH (ANY, RANGE)
    export const match = ({ args }: FuncProps): Value => {
        const lookupValue = args[0];
        const lookupRange = expectRange(args, 1);

        const index = lookupRange.value.findIndex(
            (value) =>
                value.type === lookupValue.type &&
                value.value === lookupValue.value,
        );

        return createNumber(index);
    };

    // MIN (RANGE)
    export const min = ({ args }: FuncProps): Value => {
        const range = expectRange(args, 0);

        const min = range.value.reduce<number | undefined>((acc, value) => {
            if (value.type !== ValueType.Number) {
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
    export const max = ({ args }: FuncProps): Value => {
        const range = expectRange(args, 0);

        const max = range.value.reduce<number | undefined>((acc, value) => {
            if (value.type !== ValueType.Number) {
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
    export const sum = ({ args }: FuncProps): Value => {
        const range = expectRange(args, 0);

        const sum = range.value.reduce<number>((acc, value) => {
            if (value.type !== ValueType.Number) {
                return acc;
            }

            const numberValue = value as NumberValue;
            return acc + numberValue.value;
        }, 0);

        return createNumber(sum);
    };

    // PRODUCT (RANGE)
    export const product = ({ args }: FuncProps): Value => {
        const range = expectRange(args, 0);

        const sum = range.value.reduce<number>((acc, value) => {
            if (value.type !== ValueType.Number) {
                return acc;
            }

            const numberValue = value as NumberValue;
            return acc * numberValue.value;
        }, 1);

        return createNumber(sum);
    };

    // AVERAGE (RANGE)
    export const average = ({ args }: FuncProps): Value => {
        const range = expectRange(args, 0);

        const sum = range.value.reduce<[number, number]>(
            (acc, value) => {
                if (value.type !== ValueType.Number) {
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
    export const count = ({ args }: FuncProps): Value => {
        const range = expectRange(args, 0);

        const count = range.value.reduce<number>((acc, value) => {
            if (value.type !== ValueType.Number) {
                return acc;
            }

            return acc + 1;
        }, 0);

        return createNumber(count);
    };

    // COUNTIF (RANGE, ANY)
    export const countif = ({ args }: FuncProps): Value => {
        const range = expectRange(args, 0);
        const matcher = expectArg(args, 1);

        const count = range.value.reduce<number>((acc, value) => {
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

    // STEPS ()
    export const steps = ({ steps }: FuncProps): Value => {
        return createNumber(steps);
    };

    // TIMERANGE (CELL, NUMBER)
    export const timerange = ({ args, history, step }: FuncProps): Value => {
        const cellLiteral = expectCellLiteral(args, 0);
        const depth = expectNumber(args, 1);

        const cellId = SpreadsheetUtils.cellCoordsToId(cellLiteral.value);

        const startStep = Math.max(0, step - depth.value);
        const endStep = step;

        const values: Value[] = [];

        for (
            let currentStep = startStep;
            currentStep <= endStep;
            currentStep++
        ) {
            const value = getHistoryValue(cellId, currentStep, history);
            if (!value) continue;
            values.push(value);
        }

        return createRange(values);
    };
}

export namespace GraphFunctions {
    // POINT (NUMBER, NUMBER)
    export const point = ({ args }: FuncProps): Value => {
        let x: number | CategoricalCoord;
        let y: number | CategoricalCoord;

        if (args[0].type === ValueType.Number) {
            x = expectNumber(args, 0).value;
        } else {
            x = expectCategoricalCoord(args, 0).value;
        }

        if (args[1].type === ValueType.Number) {
            y = expectNumber(args, 1).value;
        } else {
            y = expectCategoricalCoord(args, 1).value;
        }

        return createPoint({ x: x, y: y });
    };

    // CATEGORICALCOORD (STRING|NUMBER, NUMBER|STRING)
    export const categoricalCoord = ({ args }: FuncProps): Value => {
        if (args[0].type === ValueType.String) {
            return createCategoricalCoord([
                expectString(args, 0).value,
                expectNumber(args, 1).value,
            ]);
        } else {
            return createCategoricalCoord([
                expectNumber(args, 0).value,
                expectString(args, 1).value,
            ]);
        }
    };

    // LINE (SHAPE)
    export const line = ({ args }: FuncProps): Value => {
        const parsedPoints = parseArgs(args);
        const points = parsedPoints.map((_, i) => expectPoint(parsedPoints, i));
        const compostPoints = points.map((point) => [
            point.value.x,
            point.value.y,
        ]);

        const graph = c.line(compostPoints) as ShapeType;
        return createShape(graph, "LINE");
    };

    // SHAPE (SHAPE)
    export const shape = ({ args }: FuncProps): Value => {
        const parsedPoints = parseArgs(args);
        const points = parsedPoints.map((_, i) => expectPoint(parsedPoints, i));
        const compostPoints = points.map((point) => [
            point.value.x,
            point.value.y,
        ]);

        const graph = c.shape(compostPoints) as ShapeType;
        return createShape(graph, "SHAPE");
    };

    // COLUMN (STRING, NUMBER)
    export const column = ({ args }: FuncProps): Value => {
        const name = expectString(args, 0).value;
        const size = expectNumber(args, 1).value;

        const graph = c.column(name, size) as ShapeType;
        return createShape(graph, "COLUMN");
    };

    // BAR (NUMBER, STRING)
    export const bar = ({ args }: FuncProps): Value => {
        const size = expectNumber(args, 0).value;
        const name = expectString(args, 1).value;

        const graph = c.bar(size, name) as ShapeType;
        return createShape(graph, "BAR");
    };

    // BUBBLE (POINT, NUMBER, NUMBER)
    export const bubble = ({ args }: FuncProps): Value => {
        const point = expectPoint(args, 0).value;
        const height = expectNumber(args, 1).value;
        const width = expectNumber(args, 2).value;
        const graph = c.bubble(point, height, width) as ShapeType;
        return createShape(graph, "BUBBLE");
    };

    // TEXT (POINT, STRING)
    export const text = ({ args }: FuncProps): Value => {
        const point = expectPoint(args, 0).value;

        const content = expectString(args, 1).value;

        let graph;
        if (args[2]) {
            graph = c.text(
                point.x,
                point.y,
                content,
                expectString(args, 2).value,
            ) as ShapeType;
        } else if (args[2] && args[3]) {
            graph = c.text(
                point.x,
                point.y,
                content,
                expectString(args, 2).value,
                expectString(args, 3).value,
            ) as ShapeType;
        } else {
            graph = c.text(point.x, point.y, content) as ShapeType;
        }

        return createShape(graph, "TEXT");
    };

    // AXES (STRING, SHAPE)
    export const axes = ({ args }: FuncProps): Value => {
        const config = expectString(args, 0);
        const shape = expectShape(args, 1);

        const graph = c.axes(config.value, shape.value) as ShapeType;
        return createShape(graph, "AXES");
    };

    // FILLCOLOR (STRING, SHAPE)
    export const fillColor = ({ args }: FuncProps): Value => {
        const color = expectString(args, 0).value;
        const shape = expectShape(args, 1).value;

        const graph = c.fillColor(color, shape) as ShapeType;
        return createShape(graph, "FILLCOLOR");
    };

    // FONT (STRING, STRING, SHAPE)
    export const font = ({ args }: FuncProps): Value => {
        const font = expectString(args, 0).value;
        const color = expectString(args, 1).value;
        const shape = expectShape(args, 2).value;

        const graph = c.font(font, color, shape) as ShapeType;
        return createShape(graph, "FONT");
    };

    // STROKECOLOR (STRING, SHAPE)
    export const strokeColor = ({ args }: FuncProps): Value => {
        const color = expectString(args, 0).value;
        const shape = expectShape(args, 1).value;

        const graph = c.strokeColor(color, shape) as ShapeType;
        return createShape(graph, "STROKECOLOR");
    };

    // PADDING (NUMBER, NUMBER, NUMBER, NUMBER, SHAPE)
    export const padding = ({ args }: FuncProps): Value => {
        const top = expectNumber(args, 0).value;
        const right = expectNumber(args, 1).value;
        const bottom = expectNumber(args, 2).value;
        const left = expectNumber(args, 3).value;

        const shape = expectShape(args, 4).value;

        const graph = c.padding(top, right, bottom, left, shape) as ShapeType;
        return createShape(graph, "PADDING");
    };

    // OVERLAY (SHAPE)
    export const overlay = ({ args }: FuncProps): Value => {
        const parsedShapes = parseArgs(args);
        const shapes = parsedShapes.map(
            (_, i) => expectShape(parsedShapes, i).value,
        );
        const graph = c.overlay(shapes) as ShapeType;

        return createShape(graph, "OVERLAY");
    };

    // NEST (POINT, POINT, SHAPE)
    export const nest = ({ args }: FuncProps): Value => {
        const pointStart = expectPoint(args, 0).value;
        const pointEnd = expectPoint(args, 1).value;
        const shape = expectShape(args, 2).value;

        const graph = c.nest(
            pointStart.x,
            pointEnd.x,
            pointStart.y,
            pointEnd.y,
            shape,
        ) as ShapeType;

        return createShape(graph, "NEST");
    };

    export const nestX = ({ args }: FuncProps): Value => {
        let start: number | CategoricalCoord;
        let end: number | CategoricalCoord;
        const shape = expectShape(args, 2);

        if (args[0].type === ValueType.Number) {
            start = expectNumber(args, 0).value;
        } else {
            start = expectCategoricalCoord(args, 0).value;
        }

        if (args[1].type === ValueType.Number) {
            end = expectNumber(args, 1).value;
        } else {
            end = expectCategoricalCoord(args, 1).value;
        }

        const graph = c.nestX(start, end, shape) as ShapeType;
        return createShape(graph, "NESTX");
    };

    export const nestY = ({ args }: FuncProps): Value => {
        let start: number | CategoricalCoord;
        let end: number | CategoricalCoord;
        const shape = expectShape(args, 2);

        if (args[0].type === ValueType.Number) {
            start = expectNumber(args, 0).value;
        } else {
            start = expectCategoricalCoord(args, 0).value;
        }

        if (args[1].type === ValueType.Number) {
            end = expectNumber(args, 1).value;
        } else {
            end = expectCategoricalCoord(args, 1).value;
        }

        const graph = c.nestY(start, end, shape) as ShapeType;
        return createShape(graph, "NESTY");
    };

    // RENDER (SHAPE)
    export const render = ({ args }: FuncProps): Value => {
        const shape = expectShape(args, 0);

        return createGraph(shape.value);
    };

    // SCALECONTINUOUS (NUMBER, NUMBER)
    export const scaleContinuous = ({ args }: FuncProps): Value => {
        const min = expectNumber(args, 0).value;
        const max = expectNumber(args, 1).value;

        const scale = s.continuous(min, max);
        return createScale(scale, "CONTINUOUS") as ScaleType;
    };

    export const scaleCategorical = ({ args }: FuncProps): Value => {
        const parsedNames = parseArgs(args);
        const names = parsedNames.map(
            (_, i) => expectString(parsedNames, i).value,
        );

        const scale = s.categorical(names);
        return createScale(scale, "CATEGORICAL") as ScaleType;
    };

    // SCALEY (SCALE, NUMBER)
    export const scaleY = ({ args }: FuncProps): Value => {
        const scale = expectScale(args, 0).value;
        const shape = expectShape(args, 1).value;

        const graph = c.scaleY(scale, shape) as ShapeType;
        return createShape(graph, "SCALEY") as ScaleType;
    };

    // SCALEX (SCALE, NUMBER)
    export const scaleX = ({ args }: FuncProps): Value => {
        const scale = expectScale(args, 0).value;
        const shape = expectShape(args, 1).value;

        const graph = c.scaleX(scale, shape) as ShapeType;
        return createShape(graph, "SCALEX") as ScaleType;
    };

    // SCALE (SCALE, SCALE, NUMBER)
    export const scale = ({ args }: FuncProps): Value => {
        const scaleX = expectScale(args, 0).value;
        const scaleY = expectScale(args, 1).value;
        const shape = expectShape(args, 2).value;

        const graph = c.scale(scaleX, scaleY, shape) as ShapeType;
        return createShape(graph, "SCALE") as ScaleType;
    };
}
