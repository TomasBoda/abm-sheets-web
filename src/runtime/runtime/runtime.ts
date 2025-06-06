import { CellId, History } from "@/components/spreadsheet/spreadsheet.model";
import { Utils } from "@/utils/utils";
import { Functions } from "../functions";
import { BinaryExpression, BooleanLiteral, CallExpression, CellLiteral, CellRangeLiteral, Expression, Identifier, NodeType, NumericLiteral, RelationalExpression, StringLiteral, UnaryExpression } from "../parser";
import { BooleanValue, CellLiteralValue, CellRangeValue, FuncCall, NumberValue, StringValue, Value, ValueType } from "./model";

export class Runtime {

    private step: number;
    private history: History;
    private dataHistory: History;

    private inCallExpression: boolean = false;

    private functions: Map<string, FuncCall> = new Map([
        ["if", Functions.conditional],
        ["and", Functions.and],
        ["or", Functions.or],

        ["index", Functions.index],
        ["match", Functions.match],
        ["min", Functions.min],
        ["max", Functions.max],
        ["sum", Functions.sum],
        ["average", Functions.average],
        ["count", Functions.count],
        ["countif", Functions.countif],
        ["sumhistory", Functions.sumhistory],

        ["abs", Functions.abs],
        ["floor", Functions.floor],
        ["ceiling", Functions.ceiling],
        ["power", Functions.power],
        ["mmin", Functions.mmin],
        ["mmax", Functions.mmax],

        ["rand", Functions.rand],
        ["randbetween", Functions.randbetween],
        ["choice", Functions.choice],
        ["concat", Functions.concat],

        ["prev", Functions.prev],
        ["history", Functions.history],
        ["step", Functions.step],
    ]);

    public run(expression: Expression, step: number, history: History, dataHistory: History) {
        this.step = step;
        this.history = history;
        this.dataHistory = dataHistory;
        
        return this.runFormula(expression);
    }

    public runFormula(expression: Expression): string {
        const result = this.runExpression(expression)

        switch (result.type) {
            case ValueType.Number: {
                const { value } = result as NumberValue;

                if (Math.round(value) === value) {
                    return Math.round(value).toString();
                }

                for (let i = 1; i <= 3; i++) {
                    if (parseFloat(value.toFixed(i)) === value) {
                        return value.toFixed(i).toString();
                    }
                }

                return value.toFixed(3).toString();
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

        if (identifier === "prev" || identifier === "history" || identifier === "sumhistory") {
            this.inCallExpression = true;
        }

        const evaluatedArgs = args.map(arg => this.runExpression(arg));
        this.inCallExpression = false;

        return func({
            args: evaluatedArgs,
            step: this.step,
            history: this.history,
            dataHistory: this.dataHistory,
        });
    }

    private runRelationalExpression(expression: RelationalExpression): BooleanValue {
        const { left, right, operator } = expression;

        const leftValue = this.runExpression(left);
        const rightValue = this.runExpression(right);

        if (leftValue.type === ValueType.Number && rightValue.type === ValueType.Number) {
            const { value: lhs } = leftValue as NumberValue;
            const { value: rhs } = rightValue as NumberValue;
    
            const operators = {
                "==": (lhs: number, rhs: number) => lhs === rhs,
                "!=": (lhs: number, rhs: number) => lhs !== rhs,
                ">": (lhs: number, rhs: number) => lhs > rhs,
                ">=": (lhs: number, rhs: number) => lhs >= rhs,
                "<": (lhs: number, rhs: number) => lhs < rhs,
                "<=": (lhs: number, rhs: number) => lhs <= rhs,
            }
    
            const func = operators[operator];
    
            if (!func) {
                throw new Error(`Unsupported operator '${operator}' in runRelationalExpression()`);
            }
    
            const result: boolean = func(lhs, rhs);
    
            return { type: ValueType.Boolean, value: result };
        }

        if (leftValue.type === ValueType.Boolean && rightValue.type === ValueType.Boolean) {
            const { value: lhs } = leftValue as BooleanValue;
            const { value: rhs } = rightValue as BooleanValue;
    
            const operators = {
                "==": (lhs: boolean, rhs: boolean) => lhs === rhs,
                "!=": (lhs: boolean, rhs: boolean) => lhs !== rhs,
            }
    
            const func = operators[operator];
    
            if (!func) {
                throw new Error(`Unsupported operator '${operator}' in runRelationalExpression()`);
            }
    
            const result: boolean = func(lhs, rhs);
    
            return { type: ValueType.Boolean, value: result };
        }

        if (leftValue.type === ValueType.String && rightValue.type === ValueType.String) {
            const { value: lhs } = leftValue as StringValue;
            const { value: rhs } = rightValue as StringValue;
    
            const operators = {
                "==": (lhs: boolean, rhs: boolean) => lhs === rhs,
                "!=": (lhs: boolean, rhs: boolean) => lhs !== rhs,
            }
    
            const func = operators[operator];
    
            if (!func) {
                throw new Error(`Unsupported operator '${operator}' in runRelationalExpression()`);
            }
    
            const result: boolean = func(lhs, rhs);
    
            return { type: ValueType.Boolean, value: result };
        }

        if (rightValue.type === ValueType.String) {
            const lhs = leftValue.value.toString();
            const rhs = (rightValue as StringValue).value;

            const operators = {
                "==": (lhs: boolean, rhs: boolean) => lhs === rhs,
                "!=": (lhs: boolean, rhs: boolean) => lhs !== rhs,
            }
    
            const func = operators[operator];
    
            if (!func) {
                throw new Error(`Unsupported operator '${operator}' in runRelationalExpression()`);
            }
    
            const result: boolean = func(lhs, rhs);
    
            return { type: ValueType.Boolean, value: result };
        }

        if (leftValue.type === ValueType.String) {
            const lhs = (rightValue as StringValue).value;
            const rhs = rightValue.value.toString();

            const operators = {
                "==": (lhs: boolean, rhs: boolean) => lhs === rhs,
                "!=": (lhs: boolean, rhs: boolean) => lhs !== rhs,
            }
    
            const func = operators[operator];
    
            if (!func) {
                throw new Error(`Unsupported operator '${operator}' in runRelationalExpression()`);
            }
    
            const result: boolean = func(lhs, rhs);
    
            return { type: ValueType.Boolean, value: result };
        }

        throw new Error("LHS and RHS types do not match in relational expression");
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
                    result = lhs.value / 1;
                } else {
                    result = lhs.value / rhs.value;
                }

                break;
            }
            case "%": {
                if (rhs.value === 0) {
                    result = lhs.value % 1;
                } else {
                    result = lhs.value % rhs.value;
                }

                break;
            }
            default:
                throw new Error(`Unsupported operator '${operator}' in runBinaryExpression()`);
        }

        return { type: ValueType.Number, value: result };
    }

    private runUnaryExpression(expression: UnaryExpression): NumberValue {
        const { value } = expression;

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
        throw new Error(`Variable ${expression.value} does not exist`);
    }

    private runCellLiteral(expression: CellLiteral): Value {
        const ri = expression.row.index;
        const ci = expression.col.index;
        const cellId = Utils.cellCoordsToId({ ri, ci });

        if (this.inCallExpression) {
            return { type: ValueType.CellLiteral, value: [ri, ci] } as CellLiteralValue;
        }
    
        const cellValue = this.getHistoryValue(cellId);

        if (cellValue === undefined) {
            return { type: ValueType.Number, value: 0 };
        }

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

    // utilities

    private getHistoryValue(cellId: CellId) {
        const historyValue = this.history.get(cellId);
        const dataHistoryValue = this.dataHistory.get(cellId);

        if (historyValue !== undefined) {
            return historyValue[historyValue.length - 1];
        }

        if (dataHistoryValue !== undefined) {
            return dataHistoryValue[this.step];
        }

        return undefined;
    }
}