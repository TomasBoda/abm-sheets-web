import { CellId, History } from "@/components/spreadsheet/spreadsheet.model";
import { Utils } from "@/utils/utils";
import { BooleanValue, CellLiteralValue, CellRangeValue, FuncProps, NumberValue, StringValue, Value, ValueType } from "./runtime";
import { data } from "@/components/spreadsheet/spreadsheet.component";

export namespace Functions {

    export const index = ({ args, step, history }: FuncProps): Value => {
        const lookupRange = expectCellRange(args, 0).value;
        const index = expectNumber(args, 1).value;

        const ci = lookupRange[0];
        const ri = lookupRange[1] + index;

        const cell = history.get(Utils.cellCoordsToId({ ri, ci }));
        const value = cell ? cell[cell.length === step + 2 ? step + 1 : step] : "0";

        return createNumber(parseFloat(value));
    }

    export const match = ({ args, step, history }: FuncProps): Value => {
        const lookupValue = args[0].value;
        const lookupRange = expectCellRange(args, 1).value;

        const c1 = lookupRange[0];
        const r1 = lookupRange[1];
        const c2 = lookupRange[2];
        const r2 = lookupRange[3];

        for (let r = r1; r <= r2; r++) {
            for (let c = c1; c <= c2; c++) {
                const cell = history.get(Utils.cellCoordsToId({ ri: r, ci: c }));
                const value = cell ? cell[cell.length === step + 2 ? step + 1 : step] : "0";

                if (value === lookupValue) {
                    return createNumber(r - 1);
                }
            }
        }

        return createNumber(-1);
    }

    export function step({ step }: FuncProps): Value {
        return createNumber(step);
    }

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

    export function abs({ args }: FuncProps): Value {
        const value = expectNumber(args, 0).value;
        return createNumber(Math.abs(value));
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

    export function mmin({ args, step, history }: FuncProps): Value {
        const value1 = expectNumber(args, 0).value;
        const value2 = expectNumber(args, 1).value;

        const result = Math.min(value1, value2);
        return createNumber(result);
    }

    export function mmax({ args, step, history }: FuncProps): Value {
        const value1 = expectNumber(args, 0).value;
        const value2 = expectNumber(args, 1).value;

        const result = Math.max(value1, value2);
        return createNumber(result);
    }

    export function min({ args, step, history }: FuncProps): Value {
        const range = expectCellRange(args, 0).value;

        const c1 = range[0];
        const r1 = range[1];
        const c2 = range[2];
        const r2 = range[3];

        let min: number | undefined = undefined;

        for (let ri = r1; ri <= r2; ri++) {
            for (let ci = c1; ci <= c2; ci++) {
                const formula = data[ri][ci].formula;

                if (!formula.startsWith("=")) {
                    continue;
                }

                const cellId = Utils.cellCoordsToId({ ri, ci });
                const cell = history.get(cellId);
                
                if (cell === undefined || cell[step] === undefined) {
                    continue;
                }

                const value = cell[step];

                if (isNaN(parseFloat(value))) {
                    continue;
                }

                min = min !== undefined ? Math.min(min, parseFloat(value)) : parseFloat(value);
            }
        }

        return createNumber(min);
    }

    export function max({ args, step, history }: FuncProps): Value {
        const range = expectCellRange(args, 0).value;

        const c1 = range[0];
        const r1 = range[1];
        const c2 = range[2];
        const r2 = range[3];

        let max: number | undefined = undefined;

        for (let ri = r1; ri <= r2; ri++) {
            for (let ci = c1; ci <= c2; ci++) {
                const formula = data[ri][ci].formula;

                if (!formula.startsWith("=")) {
                    continue;
                }

                const cellId = Utils.cellCoordsToId({ ri, ci });
                const cell = history.get(cellId);
                
                if (cell === undefined || cell[step] === undefined) {
                    continue;
                }

                const value = cell[step];

                if (isNaN(parseFloat(value))) {
                    continue;
                }

                max = max !== undefined ? Math.max(max, parseFloat(value)) : parseFloat(value);
            }
        }

        return createNumber(max);
    }

    export function average({ args, step, history }: FuncProps): Value {
        const range = expectCellRange(args, 0).value;

        const c1 = range[0];
        const r1 = range[1];
        const c2 = range[2];
        const r2 = range[3];

        let sum = 0;
        let count = 0;

        for (let ri = r1; ri <= r2; ri++) {
            for (let ci = c1; ci <= c2; ci++) {
                const formula = data[ri][ci].formula;

                if (!formula.startsWith("=")) {
                    continue;
                }

                const cellId = Utils.cellCoordsToId({ ri, ci });
                const cell = history.get(cellId);
                
                if (cell === undefined || cell[step] === undefined) {
                    continue;
                }

                const value = cell[step];

                if (isNaN(parseFloat(value))) {
                    continue;
                }

                sum += parseFloat(value);
                count += 1;
            }
        }

        const average = sum / count;

        return createNumber(average);
    }

    export function count({ args, step, history }: FuncProps): Value {
        const range = expectCellRange(args, 0).value;

        const c1 = range[0];
        const r1 = range[1];
        const c2 = range[2];
        const r2 = range[3];

        let count = 0;

        for (let ri = r1; ri <= r2; ri++) {
            for (let ci = c1; ci <= c2; ci++) {
                const formula = data[ri][ci].formula;

                if (!formula.startsWith("=")) {
                    continue;
                }

                const cellId = Utils.cellCoordsToId({ ri, ci });
                const cell = history.get(cellId);
                
                if (cell === undefined || cell[step] === undefined) {
                    continue;
                }

                const value = cell[step];

                if (isNaN(parseFloat(value))) {
                    continue;
                }

                count += 1;
            }
        }

        return createNumber(count);
    }

    export function power({ args }: FuncProps): Value {
        const value = expectNumber(args, 0).value;
        const power = expectNumber(args, 1).value;

        const result = Math.pow(value, power);
        return createNumber(result);
    }

    export function ceiling({ args }: FuncProps): Value {
        const value = expectNumber(args, 0).value;

        const result = Math.ceil(value);
        return createNumber(result);
    }

    export function floor({ args }: FuncProps): Value {
        const value = expectNumber(args, 0).value;

        const result = Math.floor(value);
        return createNumber(result);
    }

    export function concat({ args }: FuncProps): Value {
        // TODO: fix args and add support for any number of args
        const value1 = args[0];
        const value2 = args[1];

        const result = value1.value.toString() + value2.value.toString();
        return createString(result);
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

    export function history({ args, step, history }: FuncProps): Value {
        const cell = expectCellLiteral(args, 0).value;
        const offset = expectNumber(args, 1).value;

        const cellId = Utils.cellCoordsToId({ ri: cell[0], ci: cell[1] });

        const value = history.get(cellId);

        if (!value || step < offset) {
            return createNumber(0);
        }

        const cellValue = value[value.length - 1 - offset];

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