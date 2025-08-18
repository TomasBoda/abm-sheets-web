import { Utils } from "@/utils/utils";
import {
    BooleanValue,
    CellLiteralValue,
    CellRangeValue,
    CompostObject,
    FuncProps,
    GraphId,
    GraphValue,
    NumberValue,
    StringValue,
    Value,
    ValueType,
} from "./runtime";
import { CellId, History } from "@/components/spreadsheet/spreadsheet.model";
import { scale as s, compost as c } from "compostjs";
import { data } from "@/components/spreadsheet/data";
// utils

const createNumber = (value: number): NumberValue => ({
    type: ValueType.Number,
    value,
});

const createBoolean = (value: boolean): BooleanValue => ({
    type: ValueType.Boolean,
    value,
});

const createString = (value: string): StringValue => ({
    type: ValueType.String,
    value,
});

const createGraphId = (
    descriptionText: string,
    value: CellId,
): StringValue => ({
    type: ValueType.String,
    value: `${descriptionText} - ${value}`,
});

const createGraphValue = (value: CompostObject): GraphValue => ({
    type: ValueType.GraphValue,
    value,
});
// expect

const expectNumber = (args: Value[], index: number): NumberValue => {
    return expectArg(args, index, ValueType.Number) as NumberValue;
};

const expectString = (args: Value[], index: number): StringValue => {
    return expectArg(args, index, ValueType.String) as StringValue;
};

const expectBoolean = (args: Value[], index: number): BooleanValue => {
    return expectArg(args, index, ValueType.Boolean) as BooleanValue;
};

const expectCellLiteral = (args: Value[], index: number): CellLiteralValue => {
    return expectArg(args, index, ValueType.CellLiteral) as CellLiteralValue;
};

const expectCellRange = (args: Value[], index: number): CellRangeValue => {
    return expectArg(args, index, ValueType.CellRange) as CellRangeValue;
};

const expectArg = (args: Value[], index: number, type: ValueType): Value => {
    if (args.length - 1 < index) {
        throw new Error("Not enough function arguments");
    }

    if (args[index].type !== type) {
        throw new Error("Function argument type mismatch");
    }

    return args[index];
};

const getHistoryValue = (
    cellId: CellId,
    step: number,
    history: History,
    dataHistory: History,
) => {
    const historyValue = history.get(cellId);
    const dataHistoryValue = dataHistory.get(cellId);

    if (historyValue !== undefined) {
        return historyValue[step];
    }

    if (dataHistoryValue !== undefined) {
        return dataHistoryValue[step];
    }

    return undefined;
};

// local graph "utils" functions

const getGraphValue = (cellId: CellId, step: number): GraphValue => {
    const { ri, ci } = Utils.cellIdToCoords(cellId);
    try {
        return data[ri][ci].compostGraphValue[step];
    } catch {
        throw new Error("Referencing empty graph cell.");
    }
};

const saveGraphValue = (
    value: GraphValue,
    cellId: CellId,
    step: number,
): void => {
    const { ri, ci } = Utils.cellIdToCoords(cellId);
    if (!data[ri][ci].compostGraphValue) {
        data[ri][ci].compostGraphValue = [];
    }
    if (data[ri][ci].compostGraphValue.length >= step + 1) {
        data[ri][ci].compostGraphValue[step] = value;
    } else {
        data[ri][ci].compostGraphValue.push(value);
    }
};

export const getCoordsFromGraphId = (id: GraphId): CellId => {
    const cellId = id.split("-")[1].trim() as CellId;
    return cellId;
};

const getGraphValueFromGraphId = (id: GraphId, step): GraphValue => {
    const cellId = getCoordsFromGraphId(id);
    return getGraphValue(cellId, step);
};

export namespace Functions {
    export const conditional = ({ args }: FuncProps): Value => {
        const condition = expectBoolean(args, 0).value;

        const subsequent = args[1];
        const alternate = args[2];

        return condition ? subsequent : alternate;
    };

    export const and = ({ args }: FuncProps): Value => {
        for (let i = 0; i < args.length; i++) {
            const value = expectBoolean(args, i);

            if (!value.value) {
                return createBoolean(false);
            }
        }

        return createBoolean(true);
    };

    export const or = ({ args }: FuncProps): Value => {
        for (let i = 0; i < args.length; i++) {
            const value = expectBoolean(args, i);

            if (value.value) {
                return createBoolean(true);
            }
        }

        return createBoolean(false);
    };

    // ------------------------------

    export const index = ({
        args,
        step,
        history,
        dataHistory,
    }: FuncProps): Value => {
        const lookupRange = expectCellRange(args, 0).value;
        const index = expectNumber(args, 1).value;

        const [c1, r1, c2, r2] = lookupRange;

        const scaleType = r1 === r2 ? "column" : c1 === c2 ? "row" : "none";

        if (scaleType === "none") {
            throw new Error("Multi row/col ranges are not supported");
        }

        let ci: number;
        let ri: number;

        switch (scaleType) {
            case "row": {
                ci = c1;
                ri = r1 + index;
                break;
            }
            case "column": {
                ci = c1 + index;
                ri = r1;
                break;
            }
        }

        const cellId = Utils.cellCoordsToId({ ri, ci });
        const value =
            getHistoryValue(cellId, step, history, dataHistory) ?? "0";

        if (isNaN(parseFloat(value))) {
            if (["TRUE", "FALSE"].includes(value)) {
                return createBoolean(value === "TRUE");
            }

            return createString(value);
        }

        return createNumber(parseFloat(value));
    };

    export const match = ({
        args,
        step,
        history,
        dataHistory,
    }: FuncProps): Value => {
        const lookupValue = args[0].value;
        const lookupRange = expectCellRange(args, 1).value;

        const c1 = lookupRange[0];
        const r1 = lookupRange[1];
        const c2 = lookupRange[2];
        const r2 = lookupRange[3];

        const scaleType = r1 === r2 ? "column" : c1 === c2 ? "row" : "none";

        if (scaleType === "none") {
            throw new Error("Multi row/col ranges are not supported");
        }

        for (let r = r1; r <= r2; r++) {
            for (let c = c1; c <= c2; c++) {
                const cellId = Utils.cellCoordsToId({ ri: r, ci: c });
                const value =
                    getHistoryValue(cellId, step, history, dataHistory) ?? "0";

                switch (args[0].type) {
                    case ValueType.Number: {
                        if (
                            parseFloat(value as string) ===
                            parseFloat(lookupValue as string)
                        ) {
                            return scaleType === "row"
                                ? createNumber(r - r1)
                                : createNumber(c - c1);
                        }
                        break;
                    }
                    // TODO: add boolean matching
                    case ValueType.String: {
                        if (value === lookupValue) {
                            return scaleType === "row"
                                ? createNumber(r - r1)
                                : createNumber(c - c1);
                        }
                        break;
                    }
                }
            }
        }

        return createNumber(-1);
    };

    export const min = ({
        args,
        step,
        history,
        dataHistory,
    }: FuncProps): Value => {
        const range = expectCellRange(args, 0).value;
        const c1 = range[0];
        const r1 = range[1];
        const c2 = range[2];
        const r2 = range[3];

        let min: number | undefined = undefined;

        for (let ri = r1; ri <= r2; ri++) {
            for (let ci = c1; ci <= c2; ci++) {
                const cellId = Utils.cellCoordsToId({ ri, ci });
                const value = getHistoryValue(
                    cellId,
                    step,
                    history,
                    dataHistory,
                );

                if (value === undefined) {
                    continue;
                }

                if (isNaN(parseFloat(value))) {
                    continue;
                }

                min =
                    min !== undefined
                        ? Math.min(min, parseFloat(value))
                        : parseFloat(value);
            }
        }

        return createNumber(min);
    };

    export const max = ({
        args,
        step,
        history,
        dataHistory,
    }: FuncProps): Value => {
        const range = expectCellRange(args, 0).value;

        const c1 = range[0];
        const r1 = range[1];
        const c2 = range[2];
        const r2 = range[3];

        let max: number | undefined = undefined;

        for (let ri = r1; ri <= r2; ri++) {
            for (let ci = c1; ci <= c2; ci++) {
                const cellId = Utils.cellCoordsToId({ ri, ci });
                const value = getHistoryValue(
                    cellId,
                    step,
                    history,
                    dataHistory,
                );

                if (value === undefined) {
                    continue;
                }

                if (isNaN(parseFloat(value))) {
                    continue;
                }

                max =
                    max !== undefined
                        ? Math.max(max, parseFloat(value))
                        : parseFloat(value);
            }
        }

        return createNumber(max);
    };

    export const sum = ({
        args,
        step,
        history,
        dataHistory,
    }: FuncProps): Value => {
        const range = expectCellRange(args, 0).value;
        const [c1, r1, c2, r2] = range;

        let sum = 0;

        for (let r = r1; r <= r2; r++) {
            for (let c = c1; c <= c2; c++) {
                const cellId = Utils.cellCoordsToId({ ri: r, ci: c });
                const value =
                    getHistoryValue(cellId, step, history, dataHistory) ?? "0";

                sum += isNaN(parseFloat(value)) ? 0 : parseFloat(value);
            }
        }

        return createNumber(sum);
    };

    export const average = ({
        args,
        step,
        history,
        dataHistory,
    }: FuncProps): Value => {
        const range = expectCellRange(args, 0).value;

        const c1 = range[0];
        const r1 = range[1];
        const c2 = range[2];
        const r2 = range[3];

        let sum = 0;
        let count = 0;

        for (let ri = r1; ri <= r2; ri++) {
            for (let ci = c1; ci <= c2; ci++) {
                const cellId = Utils.cellCoordsToId({ ri, ci });
                const value = getHistoryValue(
                    cellId,
                    step,
                    history,
                    dataHistory,
                );

                if (value === undefined) {
                    continue;
                }

                if (isNaN(parseFloat(value))) {
                    continue;
                }

                sum += parseFloat(value);
                count += 1;
            }
        }

        const average = sum / count;

        return createNumber(average);
    };

    export const count = ({
        args,
        step,
        history,
        dataHistory,
    }: FuncProps): Value => {
        const range = expectCellRange(args, 0).value;

        const c1 = range[0];
        const r1 = range[1];
        const c2 = range[2];
        const r2 = range[3];

        let count = 0;

        for (let ri = r1; ri <= r2; ri++) {
            for (let ci = c1; ci <= c2; ci++) {
                const cellId = Utils.cellCoordsToId({ ri, ci });
                const value = getHistoryValue(
                    cellId,
                    step,
                    history,
                    dataHistory,
                );

                if (value === undefined) {
                    continue;
                }

                if (isNaN(parseFloat(value))) {
                    continue;
                }

                count += 1;
            }
        }

        return createNumber(count);
    };

    export const countif = ({
        args,
        step,
        history,
        dataHistory,
    }: FuncProps): Value => {
        const range = expectCellRange(args, 0).value;
        const matcher = args[1];

        const c1 = range[0];
        const r1 = range[1];
        const c2 = range[2];
        const r2 = range[3];

        let count = 0;

        for (let ri = r1; ri <= r2; ri++) {
            for (let ci = c1; ci <= c2; ci++) {
                const cellId = Utils.cellCoordsToId({ ri, ci });
                const value = getHistoryValue(
                    cellId,
                    step,
                    history,
                    dataHistory,
                );

                if (value === undefined) {
                    continue;
                }

                switch (matcher.type) {
                    case ValueType.Number: {
                        if (
                            (matcher as NumberValue).value === parseFloat(value)
                        ) {
                            count += 1;
                        }
                        break;
                    }
                    case ValueType.Boolean: {
                        if (
                            (matcher as BooleanValue).value ===
                            (value === "TRUE")
                        ) {
                            count += 1;
                        }
                        break;
                    }
                    case ValueType.String: {
                        if ((matcher as StringValue).value === value) {
                            count += 1;
                        }
                        break;
                    }
                }
            }
        }

        return createNumber(count);
    };

    export const sumhistory = ({
        args,
        step,
        history,
        dataHistory,
    }: FuncProps): Value => {
        const cell = expectCellLiteral(args, 0);
        const cellId = Utils.cellCoordsToId({
            ri: cell.value[0],
            ci: cell.value[1],
        });

        const value = getHistoryValue(cellId, step, history, dataHistory);

        if (value === undefined) {
            return createNumber(0);
        }

        let sum = 0;

        for (let i = 0; i < value.length; i++) {
            if (!isNaN(parseFloat(value[i]))) {
                sum += parseFloat(value[i]);
            }
        }

        return createNumber(sum);
    };

    // ------------------------------

    export const abs = ({ args }: FuncProps): Value => {
        const value = expectNumber(args, 0).value;
        return createNumber(Math.abs(value));
    };

    export const floor = ({ args }: FuncProps): Value => {
        const value = expectNumber(args, 0).value;

        const result = Math.floor(value);
        return createNumber(result);
    };

    export const ceiling = ({ args }: FuncProps): Value => {
        const value = expectNumber(args, 0).value;

        const result = Math.ceil(value);
        return createNumber(result);
    };

    export const power = ({ args }: FuncProps): Value => {
        const value = expectNumber(args, 0).value;
        const power = expectNumber(args, 1).value;

        const result = Math.pow(value, power);
        return createNumber(result);
    };

    export const mmin = ({ args }: FuncProps): Value => {
        const value1 = expectNumber(args, 0).value;
        const value2 = expectNumber(args, 1).value;

        const result = Math.min(value1, value2);
        return createNumber(result);
    };

    export const mmax = ({ args }: FuncProps): Value => {
        const value1 = expectNumber(args, 0).value;
        const value2 = expectNumber(args, 1).value;

        const result = Math.max(value1, value2);
        return createNumber(result);
    };

    export const pi = (): Value => {
        return createNumber(Math.PI);
    };

    export const radians = ({ args }: FuncProps): Value => {
        const valueInRadians = expectNumber(args, 0).value;
        const valueInDegrees = (valueInRadians / 180) * Math.PI;
        return createNumber(valueInDegrees);
    };

    export const sin = ({ args }: FuncProps): Value => {
        const value = expectNumber(args, 0).value;
        const valueOfSin = Math.sin(value);
        return createNumber(valueOfSin);
    };

    export const cos = ({ args }: FuncProps): Value => {
        const value = expectNumber(args, 0).value;
        const valueOfCos = Math.cos(value);
        return createNumber(valueOfCos);
    };

    export const tan = ({ args }: FuncProps): Value => {
        const value = expectNumber(args, 0).value;
        if (Math.abs(value) % Math.PI == Math.PI / 2) {
            throw new Error("Math error.");
        }
        const valueOfTan = Math.tan(value);
        return createNumber(valueOfTan);
    };

    // ------------------------------

    export const rand = ({}: FuncProps): Value => {
        const result = Math.random();
        return createNumber(result);
    };

    export const randbetween = ({ args }: FuncProps): Value => {
        const min = expectNumber(args, 0).value;
        const max = expectNumber(args, 1).value;

        const result = Math.floor(Math.random() * (max - min + 1)) + min;

        return createNumber(result);
    };

    export const choice = ({ args }: FuncProps): Value => {
        const index = Math.floor(Math.random() * args.length);
        const result = args[index];

        return result;
    };

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

    // ------------------------------

    export const prev = ({
        args,
        step,
        history,
        dataHistory,
    }: FuncProps): Value => {
        const cell = expectCellLiteral(args, 0);
        const cellId = Utils.cellCoordsToId({
            ri: cell.value[0],
            ci: cell.value[1],
        });

        const value = getHistoryValue(cellId, step - 1, history, dataHistory);

        if (value === undefined) {
            return createNumber(0);
        }

        if (isNaN(parseFloat(value))) {
            if (["TRUE", "FALSE"].includes(value)) {
                return createBoolean(value === "TRUE");
            }

            return createString(value);
        } else {
            return createNumber(parseFloat(value));
        }
    };

    export const history = ({
        args,
        step,
        history,
        dataHistory,
    }: FuncProps): Value => {
        const cell = expectCellLiteral(args, 0).value;
        const offset = expectNumber(args, 1).value;

        const cellId = Utils.cellCoordsToId({ ri: cell[0], ci: cell[1] });

        const value = getHistoryValue(
            cellId,
            step - offset,
            history,
            dataHistory,
        );

        if (value === undefined) {
            return createNumber(0);
        }

        if (isNaN(parseFloat(value))) {
            return createString(value);
        } else {
            return createNumber(parseFloat(value));
        }
    };

    export const step = ({ step }: FuncProps): Value => {
        return createNumber(step);
    };

    // graph scale functions

    export const scalecontinuous = ({
        args,
        cellId,
        step,
    }: FuncProps): Value => {
        const min = expectNumber(args, 0).value;
        const max = expectNumber(args, 1).value;

        const result = s.continuous(min, max) as CompostObject;
        const output = createGraphValue(result);
        saveGraphValue(output, cellId, step);
        return createGraphId("continuous scale", cellId);
    };

    export const scale = ({ args, cellId, step }: FuncProps): Value => {
        const scale1 = getGraphValueFromGraphId(
            expectString(args, 0).value as GraphId,
            step,
        ).value;
        const scale2 = getGraphValueFromGraphId(
            expectString(args, 1).value as GraphId,
            step,
        ).value;
        const shape = getGraphValueFromGraphId(
            expectString(args, 2).value as GraphId,
            step,
        ).value;

        const result = c.scale(scale1, scale2, shape) as CompostObject;
        const output = createGraphValue(result);

        saveGraphValue(output, cellId, step);
        return createGraphId("scale", cellId);
    };

    export const scaleY = ({ args, cellId, step }: FuncProps): Value => {
        const scale = getGraphValueFromGraphId(
            expectString(args, 0).value as GraphId,
            step,
        ).value;
        const shape = getGraphValueFromGraphId(
            expectString(args, 1).value as GraphId,
            step,
        ).value;

        const result = c.scaleY(scale, shape) as CompostObject;
        const output = createGraphValue(result);

        saveGraphValue(output, cellId, step);
        return createGraphId("scaleY", cellId);
    };

    export const scaleX = ({ args, cellId, step }: FuncProps): Value => {
        const scale = getGraphValueFromGraphId(
            expectString(args, 0).value as GraphId,
            step,
        ).value;
        const shape = getGraphValueFromGraphId(
            expectString(args, 1).value as GraphId,
            step,
        ).value;

        const result = c.scaleX(scale, shape) as CompostObject;
        const output = createGraphValue(result);

        saveGraphValue(output, cellId, step);
        return createGraphId("scaleX", cellId);
    };

    // graph functions

    export const column = ({ args, cellId, step }: FuncProps): Value => {
        const name = expectString(args, 0).value;
        const value = expectNumber(args, 1).value;

        const result = c.column(name, value) as CompostObject;
        const output = createGraphValue(result);
        saveGraphValue(output, cellId, step);
        return createGraphId("column", cellId);
    };

    export const bubble = ({ args, cellId, step }: FuncProps): Value => {
        const x = expectNumber(args, 0).value;
        const y = expectNumber(args, 1).value;
        const width = expectNumber(args, 2).value;
        const height = expectNumber(args, 3).value;

        const result = c.bubble(x, y, width, height) as CompostObject;
        const output = createGraphValue(result);

        saveGraphValue(output, cellId, step);
        return createGraphId("bubble", cellId);
    };

    export const axes = ({ args, cellId, step }: FuncProps): Value => {
        const axesSpecifications = expectString(args, 0).value;
        const shape = getGraphValueFromGraphId(
            expectString(args, 1).value as GraphId,
            step,
        ).value;
        const result = c.axes(axesSpecifications, shape) as CompostObject;
        const output = createGraphValue(result);

        saveGraphValue(output, cellId, step);
        return createGraphId("axes", cellId);
    };

    export const fillColor = ({ args, cellId, step }: FuncProps): Value => {
        const color = expectString(args, 0).value;
        const shape = getGraphValueFromGraphId(
            expectString(args, 1).value as GraphId,
            step,
        ).value;

        const result = c.fillColor(color, shape) as CompostObject;
        const output = createGraphValue(result);

        saveGraphValue(output, cellId, step);
        return createGraphId("fillColor", cellId);
    };

    export const overlay = ({ args, cellId, step }: FuncProps): Value => {
        const shapes: CompostObject[] = [];

        for (let i = 0; i < args.length; i++) {
            if (args[i].type == ValueType.String) {
                const shape = getGraphValueFromGraphId(
                    expectString(args, i).value as GraphId,
                    step,
                ).value;
                shapes.push(shape);
            } else if (args[i].type == ValueType.CellRange) {
                const range = expectCellRange(args, i).value;
                const [c1, r1, c2, r2] = range;
                for (let ri = r1; ri <= r2; ri++) {
                    for (let ci = c1; ci <= c2; ci++) {
                        const shape =
                            data[ri][ci].compostGraphValue[step].value;
                        shapes.push(shape);
                    }
                }
            } else {
                throw new Error("Function argument type mismatch.");
            }
        }

        const result = c.overlay(shapes) as CompostObject;
        const output = createGraphValue(result);
        saveGraphValue(output, cellId, step);
        return createGraphId("overlay", cellId);
    };

    export const render = ({ args, cellId, step }: FuncProps): Value => {
        const shape = getGraphValueFromGraphId(
            expectString(args, 0).value as GraphId,
            step,
        ).value;

        const output = createGraphValue(shape);
        saveGraphValue(output, cellId, step);

        const { ri, ci } = Utils.cellIdToCoords(cellId);
        data[ri][ci].isInGraph = true;

        return createString("render graph");
    };
}
