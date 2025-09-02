import { CellId, History } from "@/components/spreadsheet/spreadsheet.model";
import { SpreadsheetUtils } from "@/components/spreadsheet/spreadsheet.utils";
import { FunctionName, Functions, GraphFunctions } from "../functions";
import {
    BinaryExpression,
    BooleanLiteral,
    CallExpression,
    CellLiteral,
    CellRangeLiteral,
    Expression,
    Identifier,
    NodeType,
    NumericLiteral,
    RelationalExpression,
    StringLiteral,
    UnaryExpression,
} from "../parser";
import {
    BooleanValue,
    CellLiteralValue,
    CellRangeType,
    CellRangeValue,
    FuncCall,
    NumberValue,
    StringValue,
    Value,
    ValueType,
} from "./model";

export class Runtime {
    private history: History;
    private step: number;
    private steps: number;

    private inCallExpression: boolean = false;

    private functions: Map<FunctionName, FuncCall> = new Map([
        ["IF", Functions.conditional],
        ["AND", Functions.and],
        ["OR", Functions.or],
        ["INDEX", Functions.index],
        ["MATCH", Functions.match],
        ["MIN", Functions.min],
        ["MAX", Functions.max],
        ["SUM", Functions.sum],
        ["PRODUCT", Functions.product],
        ["AVERAGE", Functions.average],
        ["COUNT", Functions.count],
        ["COUNTIF", Functions.countif],
        ["ABS", Functions.abs],
        ["FLOOR", Functions.floor],
        ["CEILING", Functions.ceiling],
        ["POWER", Functions.power],
        ["MMIN", Functions.mmin],
        ["MMAX", Functions.mmax],
        ["PI", Functions.pi],
        ["SIN", Functions.sin],
        ["COS", Functions.cos],
        ["TAN", Functions.tan],
        ["LOG", Functions.log],
        ["EXP", Functions.exp],
        ["SQRT", Functions.sqrt],
        ["RADIANS", Functions.radians],
        ["RAND", Functions.rand],
        ["RANDBETWEEN", Functions.randbetween],
        ["CHOICE", Functions.choice],
        ["CONCAT", Functions.concat],
        ["LEFT", Functions.left],
        ["RIGHT", Functions.right],
        ["MID", Functions.mid],
        ["LEN", Functions.len],
        ["ROUND", Functions.round],
        ["PREV", Functions.prev],
        ["STEP", Functions.step],
        ["STEPS", Functions.steps],
        ["POINT", GraphFunctions.point],
        ["LINE", GraphFunctions.line],
        ["AXES", GraphFunctions.axes],
        ["RENDER", GraphFunctions.render],
    ]);

    public run(
        expression: Expression,
        history: History,
        step: number,
        steps: number,
    ) {
        this.history = history;
        this.step = step;
        this.steps = steps;

        return this.runFormula(expression);
    }

    public runFormula(expression: Expression): Value {
        return this.runExpression(expression);
    }

    public runExpression(expression: Expression): Value {
        switch (expression.type) {
            case NodeType.CallExpression:
                return this.runCallExpression(expression as CallExpression);
            case NodeType.RelationalExpression:
                return this.runRelationalExpression(
                    expression as RelationalExpression,
                );
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
                throw new Error(
                    `Unsupported expression '${NodeType[expression.type]}' during runtime`,
                );
        }
    }

    private runCallExpression(expression: CallExpression): Value {
        const { identifier, args } = expression;

        const func = this.functions.get(identifier as FunctionName);

        if (func === undefined) {
            throw new Error(`Function '${identifier}' does not exist`);
        }

        if (identifier === "PREV") {
            this.inCallExpression = true;
        }

        const evaluatedArgs = args.map((arg) => this.runExpression(arg));
        this.inCallExpression = false;

        return func({
            args: evaluatedArgs,
            history: this.history,
            step: this.step,
            steps: this.steps,
        });
    }

    private runRelationalExpression(
        expression: RelationalExpression,
    ): BooleanValue {
        const { left, right, operator } = expression;

        const leftValue = this.runExpression(left);
        const rightValue = this.runExpression(right);

        if (
            leftValue.type === ValueType.Number &&
            rightValue.type === ValueType.Number
        ) {
            const { value: lhs } = leftValue as NumberValue;
            const { value: rhs } = rightValue as NumberValue;

            const operators = {
                "==": (lhs: number, rhs: number) => lhs === rhs,
                "!=": (lhs: number, rhs: number) => lhs !== rhs,
                ">": (lhs: number, rhs: number) => lhs > rhs,
                ">=": (lhs: number, rhs: number) => lhs >= rhs,
                "<": (lhs: number, rhs: number) => lhs < rhs,
                "<=": (lhs: number, rhs: number) => lhs <= rhs,
            };

            const func = operators[operator];

            if (!func) {
                throw new Error(
                    `Unsupported relational operator '${operator}'`,
                );
            }

            const result: boolean = func(lhs, rhs);

            return { type: ValueType.Boolean, value: result };
        }

        if (
            leftValue.type === ValueType.Boolean &&
            rightValue.type === ValueType.Boolean
        ) {
            const { value: lhs } = leftValue as BooleanValue;
            const { value: rhs } = rightValue as BooleanValue;

            const operators = {
                "==": (lhs: boolean, rhs: boolean) => lhs === rhs,
                "!=": (lhs: boolean, rhs: boolean) => lhs !== rhs,
            };

            const func = operators[operator];

            if (!func) {
                throw new Error(
                    `Unsupported relational operator '${operator}'`,
                );
            }

            const result: boolean = func(lhs, rhs);

            return { type: ValueType.Boolean, value: result };
        }

        if (
            leftValue.type === ValueType.String &&
            rightValue.type === ValueType.String
        ) {
            const { value: lhs } = leftValue as StringValue;
            const { value: rhs } = rightValue as StringValue;

            const operators = {
                "==": (lhs: boolean, rhs: boolean) => lhs === rhs,
                "!=": (lhs: boolean, rhs: boolean) => lhs !== rhs,
            };

            const func = operators[operator];

            if (!func) {
                throw new Error(
                    `Unsupported relational operator '${operator}'`,
                );
            }

            const result: boolean = func(lhs, rhs);

            return { type: ValueType.Boolean, value: result };
        }

        throw new Error(
            `Unsupported relational expression operands '${leftValue.type} ${operator} ${rightValue.type}'`,
        );
    }

    private runBinaryExpression(expression: BinaryExpression): NumberValue {
        const { left, right, operator } = expression;

        const leftValue = this.runExpression(left);
        const rightValue = this.runExpression(right);

        if (
            leftValue.type !== ValueType.Number ||
            rightValue.type !== ValueType.Number
        ) {
            throw new Error("LHS and RHS of binary expression must be numbers");
        }

        const { value: lhs } = leftValue as NumberValue;
        const { value: rhs } = rightValue as NumberValue;

        const operators = {
            "+": (lhs: number, rhs: number) => lhs + rhs,
            "-": (lhs: number, rhs: number) => lhs - rhs,
            "*": (lhs: number, rhs: number) => lhs * rhs,
            "/": (lhs: number, rhs: number) => lhs / rhs,
            "%": (lhs: number, rhs: number) => lhs % rhs,
        };

        const func = operators[operator];

        if (!func) {
            throw new Error(`Unsupported binary operator '${operator}'`);
        }

        const result: number = func(lhs, rhs);

        return { type: ValueType.Number, value: result };
    }

    private runUnaryExpression(
        expression: UnaryExpression,
    ): NumberValue | BooleanValue {
        const { value, operator } = expression;

        switch (operator) {
            case "!": {
                const result = this.runExpression(value);

                if (result.type !== ValueType.Boolean) {
                    throw new Error("Expected boolean in unary expression");
                }

                return {
                    type: ValueType.Boolean,
                    value: !(result as BooleanValue).value,
                };
            }
            case "-": {
                const result = this.runExpression(value);

                if (result.type !== ValueType.Number) {
                    throw new Error("Expected number in unary expression");
                }

                return {
                    type: ValueType.Number,
                    value: -(result as NumberValue).value,
                };
            }
        }
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
        throw new Error(`Variable '${expression.value}' does not exist`);
    }

    private runCellLiteral(expression: CellLiteral): Value {
        const ri = expression.row.index;
        const ci = expression.col.index;
        const cellId = SpreadsheetUtils.cellCoordsToId({ ri, ci });

        if (this.inCallExpression) {
            return {
                type: ValueType.CellLiteral,
                value: { ri, ci },
            } as CellLiteralValue;
        }

        const cellValue = this.getHistoryValue(cellId);

        if (cellValue === undefined) {
            return { type: ValueType.Number, value: 0 };
        }

        return cellValue;
    }

    private runCellRangeLiteral(expression: CellRangeLiteral): Value {
        const { left, right } = expression;

        const value: CellRangeType = {
            start: {
                ri: left.row.index,
                ci: left.col.index,
            },
            end: {
                ri: right.row.index,
                ci: right.col.index,
            },
        };

        return { type: ValueType.CellRange, value } as CellRangeValue;
    }

    // utilities

    private getHistoryValue(cellId: CellId) {
        const historyValue = this.history.get(cellId);

        if (historyValue !== undefined) {
            return historyValue[historyValue.length - 1];
        }

        return undefined;
    }
}
