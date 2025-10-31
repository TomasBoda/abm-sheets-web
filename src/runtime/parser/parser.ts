import { SpreadsheetUtils } from "@/components/spreadsheet/spreadsheet.utils";
import { Lexer, Token, TokenType } from "../lexer";
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
} from "./model";

export class Parser {
    private tokens: Token[] = [];

    /**
     * Parse a raw formula string into an AST (Abstract Syntax Tree)
     *
     * @param formula - raw formula string
     * @returns AST as an Expression
     */
    public parse(formula: string): Expression {
        // use lexer to tokenize the formula
        this.tokens = new Lexer().tokenize(formula);
        return this.parseExpression();
    }

    // parses any expression
    private parseExpression(): Expression {
        return this.parseRelationalExpression();
    }

    // parses a relational expression (e.g. A3 < 12)
    private parseRelationalExpression(): Expression {
        let left: Expression = this.parseAdditiveExpression();

        while (
            this.at().type !== TokenType.EOF &&
            this.at().type === TokenType.RelOp &&
            ["==", "!=", ">", ">=", "<", "<="].includes(this.at().value)
        ) {
            const operator = this.next().value;
            const right = this.parseAdditiveExpression();

            left = {
                type: NodeType.RelationalExpression,
                left,
                right,
                operator,
            } as RelationalExpression;
        }

        return left;
    }

    // parses an additive expression (e.g. 3 + 5)
    private parseAdditiveExpression(): Expression {
        let left: Expression = this.parseMultiplicativeExpression();

        while (
            this.at().type !== TokenType.EOF &&
            this.at().type === TokenType.BinOp &&
            ["+", "-"].includes(this.at().value)
        ) {
            const operator = this.next().value;
            const right = this.parseMultiplicativeExpression();

            left = {
                type: NodeType.BinaryExpression,
                left,
                right,
                operator,
            } as BinaryExpression;
        }

        return left;
    }

    // parses a multiplicative expression (e.g. 6 / 4)
    private parseMultiplicativeExpression(): Expression {
        let left: Expression = this.parseCallExpression();

        while (
            this.at().type !== TokenType.EOF &&
            this.at().type === TokenType.BinOp &&
            ["*", "/", "%"].includes(this.at().value)
        ) {
            const operator = this.next().value;
            const right = this.parseCallExpression();

            left = {
                type: NodeType.BinaryExpression,
                left,
                right,
                operator,
            } as BinaryExpression;
        }

        return left;
    }

    // parses a call expression (e.g. RANDBETWEEN(1, 2))
    private parseCallExpression(): Expression {
        const result = this.parseCellRangeExpression();

        if (
            result.type === NodeType.Identifier &&
            this.at().type === TokenType.OpenParen
        ) {
            this.expect(TokenType.OpenParen);

            const args: Expression[] = [];

            while (this.at().type !== TokenType.CloseParen) {
                const expression: Expression = this.parseExpression();
                args.push(expression);

                if (this.at().type === TokenType.Comma) {
                    this.next();
                }
            }

            this.expect(TokenType.CloseParen);

            return {
                type: NodeType.CallExpression,
                identifier: (result as Identifier).value,
                args,
            } as CallExpression;
        }

        return result;
    }

    // parses a cell range expression (e.g. A1:B2)
    private parseCellRangeExpression(): Expression {
        const left = this.parsePrimaryExpression();

        if (this.at().type === TokenType.Colon) {
            this.next();
            const right = this.parseIdentifier();

            return {
                type: NodeType.CellRangeLiteral,
                left,
                right,
            } as CellRangeLiteral;
        }

        return left;
    }

    // parses a primary expression (e.g. 12, TRUE, "Hello, World!")
    private parsePrimaryExpression(): Expression {
        switch (this.at().type) {
            case TokenType.Number:
                return this.parseNumericLiteral();
            case TokenType.Boolean:
                return this.parseBooleanLiteral();
            case TokenType.String:
                return this.parseStringLiteral();
            case TokenType.Identifier:
                return this.parseIdentifier();
            case TokenType.BinOp:
            case TokenType.UnOp:
                return this.parseUnaryExpression();
            case TokenType.OpenParen:
                return this.parseParenthesisedExpression();
            default:
                throw new Error(
                    `Unknown token '${this.at().value}' during parsing`,
                );
        }
    }

    // parses a numeric literal (e.g. 12, 15.85)
    private parseNumericLiteral(): Expression {
        const value = this.expect(TokenType.Number).value;
        return {
            type: NodeType.NumericLiteral,
            value: parseFloat(value),
        } as NumericLiteral;
    }

    // parses a boolean literal (e.g. TRUE, FALSE)
    private parseBooleanLiteral(): Expression {
        const value = this.expect(TokenType.Boolean).value;
        return {
            type: NodeType.BooleanLiteral,
            value: value.toLowerCase() === "true",
        } as BooleanLiteral;
    }

    // parses a string literal (e.g. "Hello, World!")
    private parseStringLiteral(): Expression {
        const value = this.expect(TokenType.String).value;
        return { type: NodeType.StringLiteral, value } as StringLiteral;
    }

    // parses an identifier (e.g. A1, B2, C3, etc.)
    private parseIdentifier(): Expression {
        const value = this.expect(TokenType.Identifier).value;

        const cellRegex = /^([$]?)([A-Z]{1,4})([$]?)(\d+)$/;
        const match = value.match(cellRegex);

        if (!match) {
            return { type: NodeType.Identifier, value } as Identifier;
        }

        const [, colFixed, col, rowFixed, row] = match;

        const colIndex = SpreadsheetUtils.columnTextToIndex(col);
        const rowIndex = parseInt(row) - 1;

        const cellLiteral = {
            type: NodeType.CellLiteral,
            row: { index: rowIndex, fixed: rowFixed === "$" },
            col: { index: colIndex, fixed: colFixed === "$" },
        } as CellLiteral;

        return cellLiteral;
    }

    // parses a unary expression (e.g. !TRUE, -12)
    private parseUnaryExpression(): Expression {
        switch (this.at().type) {
            case TokenType.UnOp: {
                const operator = this.expect(TokenType.UnOp).value;

                if (operator !== "!") {
                    throw new Error(`Unknown unary operator '${operator}'`);
                }

                const value = this.parseExpression();

                return {
                    type: NodeType.UnaryExpression,
                    value,
                    operator,
                } as UnaryExpression;
            }
            case TokenType.BinOp: {
                const operator = this.expect(TokenType.BinOp).value;

                if (operator !== "-") {
                    throw new Error(`Unknown binary operator '${operator}'`);
                }

                const value = this.parseExpression();

                return {
                    type: NodeType.UnaryExpression,
                    value,
                    operator,
                } as UnaryExpression;
            }
        }
    }

    // parses a parenthesised expression (e.g. (12 + 5))
    private parseParenthesisedExpression(): Expression {
        this.expect(TokenType.OpenParen);
        const expression = this.parseExpression();
        this.expect(TokenType.CloseParen);
        return expression;
    }

    // returns the current token
    private at(): Token {
        if (this.tokens.length === 0) {
            throw new Error("No more tokens to parse");
        }

        return this.tokens[0];
    }

    // returns the current token and advances to the next token
    private next(): Token {
        if (this.tokens.length === 0) {
            throw new Error("No more tokens to parse");
        }

        return this.tokens.shift()!;
    }

    // expects a token of a specific type and returns it and advances to the next token or throws an error
    private expect(type: TokenType): Token {
        if (this.at()?.type !== type) {
            throw new Error(
                `Expected token of type '${type}', got '${this.at()?.type}'`,
            );
        }

        return this.next()!;
    }
}
