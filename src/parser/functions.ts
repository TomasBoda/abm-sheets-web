import { CellId } from "@/components/spreadsheet/spreadsheet.component";
import { BooleanValue, CellLiteralValue, CellRangeValue, NumberValue, Value, ValueType } from "./runtime";
import { Utils } from "@/utils/utils";
import { CellLiteral } from "./parser";

export namespace Functions {

    export function conditional(history: Map<CellId, string[]>, step: number, args: Value[]): Value {
        // TODO: this does not work because cell(ri, ci) does not return boolean even though it should

        const condition = expectBoolean(args, 0).value;
        const subsequent = args[1];
        const alternate = args[2];

        return condition ? subsequent : alternate;
    }

    export function rand(history: Map<CellId, string[]>, step: number, args: Value[]): Value {
        const min = expectNumber(args, 0).value;
        const max = expectNumber(args, 1).value;
        const result = Math.random() * (max - min) + min;

        return { type: ValueType.Number, value: result };
    }

    export function randbetween(history: Map<CellId, string[]>, step: number, args: Value[]): Value {
        const min = expectNumber(args, 0).value;
        const max = expectNumber(args, 1).value;

        const result = Math.floor(Math.random() * (max - min + 1)) + min;

        return { type: ValueType.Number, value: result };
    }

    export function choice(history: Map<CellId, string[]>, step: number, args: Value[]): Value {
        const numbers: number[] = args.map((arg, index) => expectNumber(args, index).value);

        const randomIndex = Math.floor(Math.random() * numbers.length);
        
        return { type: ValueType.Number, value: numbers[randomIndex] };
    }

    export function sum(history: Map<CellId, string[]>, step: number, args: Value[]): Value {
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

        return { type: ValueType.Number, value: sum };
    }

    export function min(history: Map<CellId, string[]>, step: number, args: Value[]): Value {
        const lower = expectNumber(args, 0).value;
        const upper = expectNumber(args, 1).value;

        return { type: ValueType.Number, value: Math.min(lower, upper) };
    }

    export function max(history: Map<CellId, string[]>, step: number, args: Value[]): Value {
        const lower = expectNumber(args, 0).value;
        const upper = expectNumber(args, 1).value;

        return { type: ValueType.Number, value: Math.max(lower, upper) };
    }

    export function and(history: Map<CellId, string[]>, step: number, args: Value[]): Value {
        for (let i = 0; i < args.length; i++) {
            const value = expectBoolean(args, i);
            
            if (!value.value) {
                return { type: ValueType.Boolean, value: false };
            }
        }

        return { type: ValueType.Boolean, value: true };
    }

    export function or(history: Map<CellId, string[]>, step: number, args: Value[]): Value {
        for (let i = 0; i < args.length; i++) {
            const value = expectBoolean(args, i);
            
            if (value.value) {
                return { type: ValueType.Boolean, value: true };
            }
        }

        return { type: ValueType.Boolean, value: false };
    }

    // cell utilities

    export function prev(history: Map<CellId, string[]>, step: number, args: Value[]): Value {
        const cell = expectCellLiteral(args, 0);

        const value = history.get(Utils.cellCoordsToId({ ri: cell.value[0], ci: cell.value[1] }));

        if (!value || step < 1) {
            return { type: ValueType.Number, value: 0 };
        }

        const cellValue = value[value.length - 2];

        if (isNaN(parseFloat(cellValue))) {
            return { type: ValueType.String, value: cellValue };
        } else {
            return { type: ValueType.Number, value: parseFloat(cellValue) };
        }
    }
}

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