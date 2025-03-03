import { CellId } from "@/components/spreadsheet/spreadsheet.component";
import { BooleanValue, NumberValue, Value, ValueType } from "./runtime";

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

    export function choice(history: Map<CellId, string[]>, step: number, args: Value[]): Value {
        const numbers: number[] = args.map((arg, index) => expectNumber(args, index).value);

        const randomIndex = Math.floor(Math.random() * numbers.length);
        
        return { type: ValueType.Number, value: numbers[randomIndex] };
    }

    export function cell(history: Map<CellId, string[]>, step: number, args: Value[]): Value {
        const ri = expectNumber(args, 0).value;
        const ci = expectNumber(args, 1).value;

        const cell = history.get(`cell-${ri}-${ci}`);

        if (!cell) {
            return { type: ValueType.Number, value: 0 };
        }

        const cellValue = cell[step];

        if (isNaN(parseFloat(cellValue))) {
            return { type: ValueType.String, value: cellValue };
        } else {
            return { type: ValueType.Number, value: parseFloat(cellValue) };
        }
    }

    export function stat(history: Map<CellId, string[]>, step: number, args: Value[]): Value {
        const ri = expectNumber(args, 0).value;
        const ci = expectNumber(args, 1).value;

        const cell = history.get(`cell-${ri}-${ci}`);

        if (!cell) {
            return { type: ValueType.Number, value: 0 };
        }

        const cellValue = cell[step];

        if (isNaN(parseFloat(cellValue))) {
            return { type: ValueType.String, value: cellValue };
        } else {
            return { type: ValueType.Number, value: parseFloat(cellValue) };
        }
    }

    export function sum(history: Map<CellId, string[]>, step: number, args: Value[]): Value {
        const r1 = expectNumber(args, 0).value;
        const c1 = expectNumber(args, 1).value;

        const r2 = expectNumber(args, 2).value;
        const c2 = expectNumber(args, 3).value;

        let sum = 0;

        for (let r = r1; r <= r2; r++) {
            for (let c = c1; c <= c2; c++) {
                const cell = history.get(`cell-${r}-${c}`);
                const value = cell ? cell[step] : "0";

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
}

function expectNumber(args: Value[], index: number): NumberValue {
    return expectArg(args, index, ValueType.Number) as NumberValue;
}

function expectBoolean(args: Value[], index: number): BooleanValue {
    return expectArg(args, index, ValueType.Boolean) as BooleanValue;
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