import { NodeType, Parser } from "@/runtime/parser";

describe("Parser", () => {
    const parser = new Parser();

    it("should parse numbers", () => {
        expect(parser.parse("5")).toEqual({
            type: NodeType.NumericLiteral,
            value: 5,
        });

        expect(parser.parse("12")).toEqual({
            type: NodeType.NumericLiteral,
            value: 12,
        });

        expect(parser.parse("15.85")).toEqual({
            type: NodeType.NumericLiteral,
            value: 15.85,
        });
    });

    it("should parse booleans", () => {
        expect(parser.parse("TRUE")).toEqual({
            type: NodeType.BooleanLiteral,
            value: true,
        });

        expect(parser.parse("FALSE")).toEqual({
            type: NodeType.BooleanLiteral,
            value: false,
        });
    });

    it("should parse strings", () => {
        expect(parser.parse('"Hello, World!"')).toEqual({
            type: NodeType.StringLiteral,
            value: "Hello, World!",
        });

        expect(parser.parse('"   "')).toEqual({
            type: NodeType.StringLiteral,
            value: "   ",
        });
    });

    it("should parse cell literals", () => {
        expect(parser.parse("A1")).toEqual({
            type: NodeType.CellLiteral,
            row: { index: 0, fixed: false },
            col: { index: 0, fixed: false },
        });

        expect(parser.parse("B2")).toEqual({
            type: NodeType.CellLiteral,
            row: { index: 1, fixed: false },
            col: { index: 1, fixed: false },
        });
    });

    it("should parse binary expressions", () => {
        expect(parser.parse("(2 + 3) * 5")).toEqual({
            type: NodeType.BinaryExpression,
            operator: "*",
            left: {
                type: NodeType.BinaryExpression,
                left: { type: NodeType.NumericLiteral, value: 2 },
                right: { type: NodeType.NumericLiteral, value: 3 },
                operator: "+",
            },
            right: { type: NodeType.NumericLiteral, value: 5 },
        });

        expect(parser.parse("A1 + B2")).toEqual({
            type: NodeType.BinaryExpression,
            operator: "+",
            left: {
                type: NodeType.CellLiteral,
                row: { index: 0, fixed: false },
                col: { index: 0, fixed: false },
            },
            right: {
                type: NodeType.CellLiteral,
                row: { index: 1, fixed: false },
                col: { index: 1, fixed: false },
            },
        });
    });

    it("should parse fixed row/column cell literals", () => {
        expect(parser.parse("$A1")).toEqual({
            type: NodeType.CellLiteral,
            row: { index: 0, fixed: false },
            col: { index: 0, fixed: true },
        });

        expect(parser.parse("A$1")).toEqual({
            type: NodeType.CellLiteral,
            row: { index: 0, fixed: true },
            col: { index: 0, fixed: false },
        });

        expect(parser.parse("$BC$12")).toEqual({
            type: NodeType.CellLiteral,
            row: { index: 11, fixed: true },
            col: { index: 54, fixed: true },
        });
    });

    it("should parse unary expressions for numerical and boolean negation", () => {
        expect(parser.parse("-5")).toEqual({
            type: NodeType.UnaryExpression,
            operator: "-",
            value: { type: NodeType.NumericLiteral, value: 5 },
        });

        expect(parser.parse("!TRUE")).toEqual({
            type: NodeType.UnaryExpression,
            operator: "!",
            value: { type: NodeType.BooleanLiteral, value: true },
        });
    });

    it("should enforce operator precedence: *, /, % over +, -", () => {
        expect(parser.parse("2 + 3 * 4")).toEqual({
            type: NodeType.BinaryExpression,
            operator: "+",
            left: { type: NodeType.NumericLiteral, value: 2 },
            right: {
                type: NodeType.BinaryExpression,
                operator: "*",
                left: { type: NodeType.NumericLiteral, value: 3 },
                right: { type: NodeType.NumericLiteral, value: 4 },
            },
        });

        expect(parser.parse("(2 + 3) * 4")).toEqual({
            type: NodeType.BinaryExpression,
            operator: "*",
            left: {
                type: NodeType.BinaryExpression,
                operator: "+",
                left: { type: NodeType.NumericLiteral, value: 2 },
                right: { type: NodeType.NumericLiteral, value: 3 },
            },
            right: { type: NodeType.NumericLiteral, value: 4 },
        });
    });

    it("should parse modulo operator with correct precedence", () => {
        expect(parser.parse("10 - 6 % 4")).toEqual({
            type: NodeType.BinaryExpression,
            operator: "-",
            left: { type: NodeType.NumericLiteral, value: 10 },
            right: {
                type: NodeType.BinaryExpression,
                operator: "%",
                left: { type: NodeType.NumericLiteral, value: 6 },
                right: { type: NodeType.NumericLiteral, value: 4 },
            },
        });
    });

    it("should parse relational expressions after arithmetic", () => {
        expect(parser.parse("5 + 2 * 3 > 10")).toEqual({
            type: NodeType.RelationalExpression,
            operator: ">",
            left: {
                type: NodeType.BinaryExpression,
                operator: "+",
                left: { type: NodeType.NumericLiteral, value: 5 },
                right: {
                    type: NodeType.BinaryExpression,
                    operator: "*",
                    left: { type: NodeType.NumericLiteral, value: 2 },
                    right: { type: NodeType.NumericLiteral, value: 3 },
                },
            },
            right: { type: NodeType.NumericLiteral, value: 10 },
        });
    });

    it("should parse chained relational expressions left-associatively", () => {
        const ast = parser.parse("1 < 2 < 3") as any;
        expect(ast.type).toBe(NodeType.RelationalExpression);
        expect(ast.left.type).toBe(NodeType.RelationalExpression);
        expect(ast.right).toEqual({ type: NodeType.NumericLiteral, value: 3 });
    });

    it("should parse call expressions with zero, one and multiple args", () => {
        expect(parser.parse("RAND()")).toEqual({
            type: NodeType.CallExpression,
            identifier: "RAND",
            args: [],
        });

        expect(parser.parse("ABS(5)")).toEqual({
            type: NodeType.CallExpression,
            identifier: "ABS",
            args: [{ type: NodeType.NumericLiteral, value: 5 }],
        });

        expect(parser.parse('CONCAT("a", 1, TRUE)')).toEqual({
            type: NodeType.CallExpression,
            identifier: "CONCAT",
            args: [
                { type: NodeType.StringLiteral, value: "a" },
                { type: NodeType.NumericLiteral, value: 1 },
                { type: NodeType.BooleanLiteral, value: true },
            ],
        });
    });

    it("should parse nested call expressions and parenthesised args", () => {
        expect(parser.parse("ROUND(AVERAGE(A1:A3), 2)")).toEqual({
            type: NodeType.CallExpression,
            identifier: "ROUND",
            args: [
                {
                    type: NodeType.CallExpression,
                    identifier: "AVERAGE",
                    args: [
                        {
                            type: NodeType.CellRangeLiteral,
                            left: {
                                type: NodeType.CellLiteral,
                                row: { index: 0, fixed: false },
                                col: { index: 0, fixed: false },
                            },
                            right: {
                                type: NodeType.CellLiteral,
                                row: { index: 2, fixed: false },
                                col: { index: 0, fixed: false },
                            },
                        },
                    ],
                },
                { type: NodeType.NumericLiteral, value: 2 },
            ],
        });
    });

    it("should parse cell range literals (1D and 2D) with fixed anchors", () => {
        expect(parser.parse("A1:A3")).toEqual({
            type: NodeType.CellRangeLiteral,
            left: {
                type: NodeType.CellLiteral,
                row: { index: 0, fixed: false },
                col: { index: 0, fixed: false },
            },
            right: {
                type: NodeType.CellLiteral,
                row: { index: 2, fixed: false },
                col: { index: 0, fixed: false },
            },
        });

        expect(parser.parse("$B$2:$D4")).toEqual({
            type: NodeType.CellRangeLiteral,
            left: {
                type: NodeType.CellLiteral,
                row: { index: 1, fixed: true },
                col: { index: 1, fixed: true },
            },
            right: {
                type: NodeType.CellLiteral,
                row: { index: 3, fixed: false },
                col: { index: 3, fixed: true },
            },
        });
    });

    it("should parse complex mixed expression with calls, ranges, unary and binary ops", () => {
        expect(
            parser.parse("25 + MAX(A2:A5) * (25.5 - MIN(C$9:$C12))"),
        ).toEqual({
            type: NodeType.BinaryExpression,
            operator: "+",
            left: { type: NodeType.NumericLiteral, value: 25 },
            right: {
                type: NodeType.BinaryExpression,
                operator: "*",
                left: {
                    type: NodeType.CallExpression,
                    identifier: "MAX",
                    args: [
                        {
                            type: NodeType.CellRangeLiteral,
                            left: {
                                type: NodeType.CellLiteral,
                                row: { index: 1, fixed: false },
                                col: { index: 0, fixed: false },
                            },
                            right: {
                                type: NodeType.CellLiteral,
                                row: { index: 4, fixed: false },
                                col: { index: 0, fixed: false },
                            },
                        },
                    ],
                },
                right: {
                    type: NodeType.BinaryExpression,
                    operator: "-",
                    left: { type: NodeType.NumericLiteral, value: 25.5 },
                    right: {
                        type: NodeType.CallExpression,
                        identifier: "MIN",
                        args: [
                            {
                                type: NodeType.CellRangeLiteral,
                                left: {
                                    type: NodeType.CellLiteral,
                                    row: { index: 8, fixed: true },
                                    col: { index: 2, fixed: false },
                                },
                                right: {
                                    type: NodeType.CellLiteral,
                                    row: { index: 11, fixed: false },
                                    col: { index: 2, fixed: true },
                                },
                            },
                        ],
                    },
                },
            },
        });
    });

    it("should throw error on unknown unary operator", () => {
        expect(() => parser.parse("~5")).toThrow("Unrecognized symbol '~'");
    });

    it("should throw error when tokens run out unexpectedly", () => {
        expect(() => parser.parse("(")).toThrow(
            "Unknown token 'EOF' during parsing",
        );
    });
});
