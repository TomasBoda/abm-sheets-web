import { CellId, History } from "@/components/spreadsheet/spreadsheet.model";
import { Utils } from "@/utils/utils";
import { BooleanValue, CellLiteralValue, CellRangeValue, FuncProps, NumberValue, StringValue, Value, ValueType } from "./runtime";
import { data } from "@/components/spreadsheet/spreadsheet.component";

export namespace Functions {

    export const concat = ({ args }: FuncProps): Value => {
        let result = "";

        for (let i = 0; i < args.length; i++) {
            switch (args[i].type) {
                case ValueType.Number:
                    result += (args[i] as NumberValue).value;
                    break;
                case ValueType.Boolean:
                    result += (args[i] as BooleanValue).value ? "TRUE" : "FALSE";
                    break;
                case ValueType.String:
                    result += (args[i] as StringValue).value;
                    break;
            }
        }

        return createString(result);
    }

    export const sumhistory = ({ args, history }: FuncProps): Value => {
        const cell = expectCellLiteral(args, 0);
        const cellId = Utils.cellCoordsToId({ ri: cell.value[0], ci: cell.value[1] });
        
        const value = history.get(cellId);

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
    }

    export const index = ({ args, history }: FuncProps): Value => {
        const lookupRange = expectCellRange(args, 0).value;
        const index = expectNumber(args, 1).value;

        const [c1, r1, c2, r2] = lookupRange;

        const scaleType = r1 === r2 ? "column" : (c1 === c2 ? "row" : "none");

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

        const cell = history.get(Utils.cellCoordsToId({ ri, ci }));
        const value = cell !== undefined ? cell[cell.length - 1] : "0";

        if (isNaN(parseFloat(value))) {
            if (["TRUE", "FALSE"].includes(value)) {
                return createBoolean(value === "TRUE");
            }

            return createString(value);
        }

        return createNumber(parseFloat(value));
    }

    export const match = ({ args, history }: FuncProps): Value => {
        const lookupValue = args[0].value;
        const lookupRange = expectCellRange(args, 1).value;

        const c1 = lookupRange[0];
        const r1 = lookupRange[1];
        const c2 = lookupRange[2];
        const r2 = lookupRange[3];

        const scaleType = r1 === r2 ? "column" : (c1 === c2 ? "row" : "none");

        if (scaleType === "none") {
            throw new Error("Multi row/col ranges are not supported");
        }

        for (let r = r1; r <= r2; r++) {
            for (let c = c1; c <= c2; c++) {
                const cell = history.get(Utils.cellCoordsToId({ ri: r, ci: c }));
                const value = cell ? cell[cell.length - 1] : "0";

                switch (args[0].type) {
                    case ValueType.Number: {
                        if (parseFloat(value as string) === parseFloat(lookupValue as string)) {
                            return scaleType === "row" ? createNumber(r - r1) : createNumber(c - c1);
                        }
                        break;
                    }
                    case ValueType.String: {
                        if (value === lookupValue) {
                            return scaleType === "row" ? createNumber(r - r1) : createNumber(c - c1);
                        }
                        break;
                    }
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
        const index = Math.floor(Math.random() * args.length);
        const result = args[index];

        return result;
    }

    export function abs({ args }: FuncProps): Value {
        const value = expectNumber(args, 0).value;
        return createNumber(Math.abs(value));
    }

    export function sum({ args, history }: FuncProps): Value {
        const range = expectCellRange(args, 0).value;

        const c1 = range[0];
        const r1 = range[1];
        const c2 = range[2];
        const r2 = range[3];

        let sum = 0;

        for (let r = r1; r <= r2; r++) {
            for (let c = c1; c <= c2; c++) {
                const cell = history.get(Utils.cellCoordsToId({ ri: r, ci: c }));
                const value = cell ? cell[cell.length - 1] : "0";

                sum += isNaN(parseFloat(value)) ? 0 : parseFloat(value);
            }
        }

        return createNumber(sum);
    }

    export function mmin({ args }: FuncProps): Value {
        const value1 = expectNumber(args, 0).value;
        const value2 = expectNumber(args, 1).value;

        const result = Math.min(value1, value2);
        return createNumber(result);
    }

    export function mmax({ args }: FuncProps): Value {
        const value1 = expectNumber(args, 0).value;
        const value2 = expectNumber(args, 1).value;

        const result = Math.max(value1, value2);
        return createNumber(result);
    }

    export function min({ args, history }: FuncProps): Value {
        const range = expectCellRange(args, 0).value;

        const c1 = range[0];
        const r1 = range[1];
        const c2 = range[2];
        const r2 = range[3];

        let min: number | undefined = undefined;

        for (let ri = r1; ri <= r2; ri++) {
            for (let ci = c1; ci <= c2; ci++) {
                const { formula } = data[ri][ci];

                if (!formula.startsWith("=")) {
                    continue;
                }

                const cellId = Utils.cellCoordsToId({ ri, ci });
                const cell = history.get(cellId);
                
                if (cell === undefined) {
                    continue;
                }

                const value = cell[cell.length - 1];

                if (isNaN(parseFloat(value))) {
                    continue;
                }

                min = min !== undefined ? Math.min(min, parseFloat(value)) : parseFloat(value);
            }
        }

        return createNumber(min);
    }

    export function max({ args, history }: FuncProps): Value {
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
                
                if (cell === undefined) {
                    continue;
                }

                const value = cell[cell.length - 1];

                if (isNaN(parseFloat(value))) {
                    continue;
                }

                max = max !== undefined ? Math.max(max, parseFloat(value)) : parseFloat(value);
            }
        }

        return createNumber(max);
    }

    export function average({ args, history }: FuncProps): Value {
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
                
                if (cell === undefined) {
                    continue;
                }

                const value = cell[cell.length - 1];

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

    export function countif({ args, history }: FuncProps): Value {
        const range = expectCellRange(args, 0).value;
        const matcher = args[1];

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
                
                if (cell === undefined) {
                    continue;
                }

                const value = cell[cell.length - 1];

                switch (matcher.type) {
                    case ValueType.Number: {
                        if ((matcher as NumberValue).value === parseFloat(value)) {
                            count += 1;
                        }
                        break;
                    }
                    case ValueType.Boolean: {
                        if ((matcher as BooleanValue).value === (value === "TRUE")) {
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
    } 

    export function count({ args, history }: FuncProps): Value {
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
                
                if (cell === undefined) {
                    continue;
                }

                const value = cell[cell.length - 1];

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

    export function prev({ args, history }: FuncProps): Value {
        const cell = expectCellLiteral(args, 0);
        const cellId = Utils.cellCoordsToId({ ri: cell.value[0], ci: cell.value[1] });

        const value = history.get(cellId);

        if (!value || value.length < 2) {
            return createNumber(0);
        }

        const cellValue = value[value.length - 2];

        if (isNaN(parseFloat(cellValue))) {
            if (["TRUE", "FALSE"].includes(cellValue)) {
                return createBoolean(cellValue === "TRUE");
            }

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