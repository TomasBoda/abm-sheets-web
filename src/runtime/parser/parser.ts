import { Utils } from "@/utils/utils";
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

    public parse(formula: string): Expression {
        this.tokens = Lexer.tokenize(formula);
        return this.parseExpression();
    }

    private parseExpression(): Expression {
        return this.parseRelationalExpression();
    }

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
                    `Unknown token '${TokenType[this.at().type]}' in parsePrimaryExpression()`,
                );
        }
    }

    private parseNumericLiteral(): Expression {
        const value = this.expect(TokenType.Number).value;
        return {
            type: NodeType.NumericLiteral,
            value: parseFloat(value),
        } as NumericLiteral;
    }

    private parseBooleanLiteral(): Expression {
        const value = this.expect(TokenType.Boolean).value;
        return {
            type: NodeType.BooleanLiteral,
            value: value === "true",
        } as BooleanLiteral;
    }

    private parseStringLiteral(): Expression {
        const value = this.expect(TokenType.String).value;
        return { type: NodeType.StringLiteral, value } as StringLiteral;
    }

    private parseIdentifier(): Expression {
        const value = this.expect(TokenType.Identifier).value;

        const cellRegex = /^([$]?)([A-Z]{1,2})([$]?)(\d+)$/;
        const match = value.match(cellRegex);

        if (!match) {
            return { type: NodeType.Identifier, value } as Identifier;
        }

        const [, colFixed, col, rowFixed, row] = match;

        const colIndex = Utils.columnTextToIndex(col);
        const rowIndex = parseInt(row) - 1;

        const cellLiteral = {
            type: NodeType.CellLiteral,
            row: { index: rowIndex, fixed: rowFixed === "$" },
            col: { index: colIndex, fixed: colFixed === "$" },
        } as CellLiteral;

        return cellLiteral;
    }

    private parseUnaryExpression(): Expression {
        switch (this.at().type) {
            case TokenType.UnOp: {
                const operator = this.expect(TokenType.UnOp).value;

                if (operator !== "!") {
                    throw new Error("Unknown unary operator");
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
                    throw new Error("Unknown unary operator");
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

    private parseParenthesisedExpression(): Expression {
        this.expect(TokenType.OpenParen);
        const expression = this.parseExpression();
        this.expect(TokenType.CloseParen);
        return expression;
    }

    private at(): Token {
        if (this.tokens.length === 0) {
            throw new Error("No more tokens");
        }

        return this.tokens[0];
    }

    private next(): Token {
        if (this.tokens.length === 0) {
            throw new Error("No more tokens");
        }

        return this.tokens.shift()!;
    }

    private expect(type: TokenType): Token {
        if (this.at()?.type !== type) {
            throw new Error("Expected token type");
        }

        return this.next()!;
    }
}
