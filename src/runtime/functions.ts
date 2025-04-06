import { CellId, History } from "@/components/spreadsheet/spreadsheet.model";
import { Utils } from "@/utils/utils";
import { BooleanValue, CellLiteralValue, CellRangeValue, FuncProps, NumberValue, StringValue, Value, ValueType } from "./runtime";

export namespace Functions {

    export function conditional({ args }: FuncProps): Value {
        const condition = expectBoolean(args, 0).value;
        const subsequent = args[1];
        const alternate = args[2];

        return condition ? subsequent : alternate;
    }

    export function rand({}: FuncProps): Value {
        const result = Math.random();
        return createNumber(result);
    }

    export function randbetween({ args }: FuncProps): Value {
        const min = expectNumber(args, 0).value;
        const max = expectNumber(args, 1).value;

        const result = Math.floor(Math.random() * (max - min + 1)) + min;

        return createNumber(result);
    }

    export function choice({ args }: FuncProps): Value {
        const numbers = args.map((arg, index) =>
            expectNumber(args, index).value);

        const index = Math.floor(Math.random() * numbers.length);
        const result = numbers[index];

        return createNumber(result);
    }

    export function sum({ args, step, history }: FuncProps): Value {
        const range = expectCellRange(args, 0).value;

        const c1 = range[0];
        const r1 = range[1];
        const c2 = range[2];
        const r2 = range[3];

        let sum = 0;

        for (let r = r1; r <= r2; r++) {
            for (let c = c1; c <= c2; c++) {
                const cell = history.get(Utils.cellCoordsToId({ ri: r, ci: c }));
                const value = cell ? cell[cell.length === step + 2 ? step + 1 : step] : "0";

                sum += isNaN(parseFloat(value)) ? 0 : parseFloat(value);
            }
        }

        return createNumber(sum);
    }

    export function min({ args }: FuncProps): Value {
        const lower = expectNumber(args, 0).value;
        const upper = expectNumber(args, 1).value;
        const result = Math.min(lower, upper);

        return createNumber(result);
    }

    export function max({ args }: FuncProps): Value {
        const lower = expectNumber(args, 0).value;
        const upper = expectNumber(args, 1).value;
        const result = Math.max(lower, upper);

        return createNumber(result);
    }

    export function and({ args }: FuncProps): Value {
        for (let i = 0; i < args.length; i++) {
            const value = expectBoolean(args, i);
            
            if (!value.value) {
                return createBoolean(false);
            }
        }

        return createBoolean(true);
    }

    export function or({ args }: FuncProps): Value {
        for (let i = 0; i < args.length; i++) {
            const value = expectBoolean(args, i);
            
            if (value.value) {
                return createBoolean(true);
            }
        }

        return createBoolean(false);
    }

    // cell utilities

    export function prev({ args, step, history }: FuncProps): Value {
        const cell = expectCellLiteral(args, 0);
        const cellId = Utils.cellCoordsToId({ ri: cell.value[0], ci: cell.value[1] });

        const value = history.get(cellId);

        if (!value || step < 1) {
            return createNumber(0);
        }

        const cellValue = value[value.length - 2];

        if (isNaN(parseFloat(cellValue))) {
            return createString(cellValue);
        } else {
            return createNumber(parseFloat(cellValue));
        }
    }
}

// utils

const createNumber = (value: number): NumberValue => ({ type: ValueType.Number, value });
const createBoolean = (value: boolean): BooleanValue => ({ type: ValueType.Boolean, value });
const createString = (value: string): StringValue => ({ type: ValueType.String, value });

// expect

function expectNumber(args: Value[], index: number): NumberValue {
    return expectArg(args, index, ValueType.Number) as NumberValue;
}

function expectBoolean(args: Value[], index: number): BooleanValue {
    return expectArg(args, index, ValueType.Boolean) as BooleanValue;
}

function expectCellLiteral(args: Value[], index: number): CellLiteralValue {
    return expectArg(args, index, ValueType.CellLiteral) as CellLiteralValue;
}

function expectCellRange(args: Value[], index: number): CellRangeValue {
    return expectArg(args, index, ValueType.CellRange) as CellRangeValue;
}

function expectArg(args: Value[], index: number, type: ValueType): Value {
    if (args.length - 1 < index) {
        throw new Error("Not enough function arguments");
    }

    if (args[index].type !== type) {
        throw new Error("Function argument type mismatch");
    }

    return args[index];
}