import { CellId, variables } from "@/components/spreadsheet/spreadsheet.component";
import { Functions } from "./functions";
import { BinaryExpression, BooleanLiteral, CallExpression, CellLiteral, CellRangeLiteral, Expression, Identifier, NodeType, NumericLiteral, RelationalExpression, UnaryExpression } from "./parser";
import { Utils } from "@/utils/utils";

export enum ValueType { Number, Boolean, String, CellRange };

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

export interface CellRangeValue {
    type: ValueType.CellRange;
    value: number[];
}

type FunctionCall = (history: Map<CellId, string[]>, step: number, args: Value[]) => Value;

export class Runtime {

    private step: number;
    private history: Map<CellId, string[]>;

    private functions: Map<string, FunctionCall> = new Map([
        ["if", Functions.conditional],
        ["and", Functions.and],
        ["or", Functions.or],
        ["cell", Functions.cell],
        ["stat", Functions.stat],
        ["rand", Functions.rand],
        ["randbetween", Functions.randbetween],
        ["choice", Functions.choice],
        ["sum", Functions.sum],
        ["min", Functions.min],
        ["max", Functions.max],
    ]);

    public runWithHistory(expression: Expression, step: number, history: Map<CellId, string[]>) {
        this.step = step;
        this.history = history;
        return this.run(expression);
    }

    public run(expression: Expression): string {
        let result;

        try {
            result = this.runExpression(expression);
        } catch (e) {
            return "ERROR";
        }

        switch (result.type) {
            case ValueType.Number:
                return (result as NumberValue).value.toFixed(2).toString();
            case ValueType.Boolean:
                return (result as BooleanValue).value ? "1" : "0";
            case ValueType.String:
                return (result as StringValue).value;
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

        const fn = this.functions.get(identifier);

        if (fn === undefined) {
            throw new Error(`Function '${identifier}' does not exist`);
        }

        const evaluatedArgs = args.map(arg => this.runExpression(arg));
        const result = fn(this.history, this.step, evaluatedArgs);

        return result;
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

        const lhs = leftValue as NumberValue;
        const rhs = rightValue as NumberValue;

        let result: boolean;

        switch (operator) {
            case "eq":
                result = lhs.value === rhs.value;
                break;
            case "neq":
                result = lhs.value !== rhs.value;
                break;
            case "gt":
                result = lhs.value > rhs.value;
                break;
            case "ge":
                result = lhs.value >= rhs.value;
                break;
            case "lt":
                result = lhs.value < rhs.value;
                break;
            case "le":
                result = lhs.value <= rhs.value;
                break;
            default:
                throw new Error(`Unsupported operator '${operator}' in runRelationalExpression()`);
        }

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

    private runIdentifier(expression: Identifier): Value {
        const { value } = expression;
        
        const result = variables.get(value);

        if (result === undefined) {
            throw new Error("Variable does not exist");
        }

        return result;
    }

    private runCellLiteral(expression: CellLiteral): Value {
        const { row: { index: ri }, col: { index: ci } } = expression;
        const cell = this.history.get(Utils.cellCoordsToId({ ri, ci }));

        if (!cell) {
            return { type: ValueType.Number, value: 0 };
        }

        // take the current value if it exists, otherwise from the previous step
        const index = cell.length === this.step + 2
            ? this.step + 1
            : this.step;

        const cellValue = cell[index];

        if (isNaN(parseFloat(cellValue))) {
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