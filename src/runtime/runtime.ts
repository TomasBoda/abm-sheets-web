import { variables } from "@/components/spreadsheet/spreadsheet.component";
import { History } from "@/components/spreadsheet/spreadsheet.model";
import { Utils } from "@/utils/utils";
import { Functions } from "./functions";
import { BinaryExpression, BooleanLiteral, CallExpression, CellLiteral, CellRangeLiteral, Expression, Identifier, NodeType, NumericLiteral, RelationalExpression, StringLiteral, UnaryExpression } from "./parser";

export enum ValueType { Number, Boolean, String, CellLiteral, CellRange };

export interface Value {
    type: ValueType;
    value: number | boolean | string | number[];
}

export interface NumberValue {
    type: ValueType.Number;
    value: number;
}

export interface BooleanValue {
    type: ValueType.Boolean;
    value: boolean;
}

export interface StringValue {
    type: ValueType.String;
    value: string;
}

export interface CellLiteralValue {
    type: ValueType.CellLiteral;
    value: number[];
}

export interface CellRangeValue {
    type: ValueType.CellRange;
    value: number[];
}

export type FuncProps = {
    args: Value[];
    step: number;
    history: History;
}

export type FuncCall = (props: FuncProps) => Value;

export class Runtime {

    private step: number;
    private history: History;

    private inCallExpression: boolean = false;

    private functions: Map<string, FuncCall> = new Map([
        ["if", Functions.conditional],
        ["and", Functions.and],
        ["or", Functions.or],
        ["rand", Functions.rand],
        ["randbetween", Functions.randbetween],
        ["choice", Functions.choice],
        ["sum", Functions.sum],
        ["min", Functions.min],
        ["max", Functions.max],

        ["prev", Functions.prev],
        ["history", Functions.history],
    ]);

    public run(expression: Expression, step: number, history: History) {
        this.step = step;
        this.history = history;
        return this.runFormula(expression);
    }

    public runFormula(expression: Expression): string {
        const result = this.runExpression(expression)

        switch (result.type) {
            case ValueType.Number: {
                const { value } = result as NumberValue;
                return value.toFixed(2).toString();
            }
            case ValueType.Boolean: {
                const { value } = result as BooleanValue;
                return value ? "TRUE" : "FALSE";
            }
            case ValueType.String: {
                const { value } = result as StringValue;
                return value;
            }
        }
    }

    public runExpression(expression: Expression): Value {
        switch (expression.type) {
            case NodeType.CallExpression:
                return this.runCallExpression(expression as CallExpression);
            case NodeType.RelationalExpression:
                return this.runRelationalExpression(expression as RelationalExpression);
            case NodeType.BinaryExpression:
                return this.runBinaryExpression(expression as BinaryExpression);
            case NodeType.UnaryExpression:
                return this.runUnaryExpression(expression as UnaryExpression);
            case NodeType.NumericLiteral:
                return this.runNumericLiteral(expression as NumericLiteral);
            case NodeType.BooleanLiteral:
                return this.runBooleanLiteral(expression as BooleanLiteral);
            case NodeType.StringLiteral:
                return this.runStringLiteral(expression as StringLiteral);
            case NodeType.Identifier:
                return this.runIdentifier(expression as Identifier);
            case NodeType.CellLiteral:
                return this.runCellLiteral(expression as CellLiteral);
            case NodeType.CellRangeLiteral:
                return this.runCellRangeLiteral(expression as CellRangeLiteral);
            default:
                throw new Error(`Unsupported expression '${NodeType[expression.type]}' in runExpression()`);
        }
    }

    private runCallExpression(expression: CallExpression): Value {
        const { identifier, args } = expression;

        const func = this.functions.get(identifier);

        if (func === undefined) {
            throw new Error(`Function '${identifier}' does not exist`);
        }

        if (identifier === "prev" || identifier === "history") {
            this.inCallExpression = true;
        }

        const evaluatedArgs = args.map(arg => this.runExpression(arg));
        this.inCallExpression = false;

        return func({
            args: evaluatedArgs,
            step: this.step,
            history: this.history
        });
    }

    private runRelationalExpression(expression: RelationalExpression): BooleanValue {
        const { left, right, operator } = expression;

        const leftValue = this.runExpression(left);
        const rightValue = this.runExpression(right);

        if (leftValue.type !== ValueType.Number) {
            throw new Error("LHS of relational expression must be a number");
        }

        if (rightValue.type !== ValueType.Number) {
            throw new Error("RHS of relational expression must be a number");
        }

        const { value: lhs } = leftValue as NumberValue;
        const { value: rhs } = rightValue as NumberValue;

        const operators = {
            "eq": (lhs: number, rhs: number) => lhs === rhs,
            "neq": (lhs: number, rhs: number) => lhs !== rhs,
            "gt": (lhs: number, rhs: number) => lhs > rhs,
            "ge": (lhs: number, rhs: number) => lhs >= rhs,
            "lt": (lhs: number, rhs: number) => lhs < rhs,
            "le": (lhs: number, rhs: number) => lhs <= rhs,
        }

        const func = operators[operator];

        if (!func) {
            throw new Error(`Unsupported operator '${operator}' in runRelationalExpression()`);
        }

        const result: boolean = func(lhs, rhs);

        return { type: ValueType.Boolean, value: result };
    }

    private runBinaryExpression(expression: BinaryExpression): NumberValue {
        const { left, right, operator } = expression;

        const leftValue = this.runExpression(left);
        const rightValue = this.runExpression(right);

        if (leftValue.type !== ValueType.Number) {
            throw new Error("LHS of binary expression must be a number");
        }

        if (rightValue.type !== ValueType.Number) {
            throw new Error("RHS of binary expression must be a number");
        }

        const lhs = leftValue as NumberValue;
        const rhs = rightValue as NumberValue;

        let result: number;

        switch (operator) {
            case "+":
                result = lhs.value + rhs.value;
                break;
            case "-":
                result = lhs.value - rhs.value;
                break;
            case "*":
                result = lhs.value * rhs.value;
                break;
            case "/": {
                if (rhs.value === 0) {
                    throw new Error("Division by zero");
                }

                result = lhs.value / rhs.value;
                break;
            }
            default:
                throw new Error(`Unsupported operator '${operator}' in runBinaryExpression()`);
        }

        return { type: ValueType.Number, value: result };
    }

    private runUnaryExpression(expression: UnaryExpression): NumberValue {
        const { value, operator } = expression;

        const result = this.runExpression(value);

        if (result.type !== ValueType.Number) {
            throw new Error("Expected number in unary expression");
        }

        return { type: ValueType.Number, value: -(result as NumberValue).value };
    }

    private runNumericLiteral(expression: NumericLiteral): NumberValue {
        const { value } = expression;
        return { type: ValueType.Number, value };
    }

    private runBooleanLiteral(expression: BooleanLiteral): BooleanValue {
        const { value } = expression;
        return { type: ValueType.Boolean, value };
    }

    private runStringLiteral(expression: StringLiteral): StringValue {
        const { value } = expression;
        return { type: ValueType.String, value };
    }

    private runIdentifier(expression: Identifier): Value {
        const { value } = expression;
        
        const result = variables.get(value);

        if (result === undefined) {
            throw new Error("Variable does not exist");
        }

        return result;
    }

    private runCellLiteral(expression: CellLiteral): Value {
        const ri = expression.row.index;
        const ci = expression.col.index;
        const cellId = Utils.cellCoordsToId({ ri, ci });

        if (this.inCallExpression) {
            return { type: ValueType.CellLiteral, value: [ri, ci] } as CellLiteralValue;
        }

        const cellHistory = this.history.get(cellId);

        if (!cellHistory) {
            return { type: ValueType.Number, value: 0 };
        }

        const cellValue = cellHistory[cellHistory.length - 1];

        if (isNaN(parseFloat(cellValue))) {
            if (["TRUE", "FALSE"].includes(cellValue)) {
                return { type: ValueType.Boolean, value: cellValue === "TRUE" };
            }

            return { type: ValueType.String, value: cellValue };
        } else {
            return { type: ValueType.Number, value: parseFloat(cellValue) };
        }
    }

    private runCellRangeLiteral(expression: CellRangeLiteral): Value {
        const { left, right } = expression;
        
        const value = [left.col.index, left.row.index, right.col.index, right.row.index];

        return { type: ValueType.CellRange, value } as CellRangeValue;
    }
}