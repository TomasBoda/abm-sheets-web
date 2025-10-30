import { Lexer, Token, TokenType } from "@/runtime/lexer";

describe("Lexer", () => {
    const lexer = new Lexer();

    it("should tokenize numbers", () => {
        expect(lexer.tokenize("5")).toEqual([
            expectToken(TokenType.Number, "5"),
            expectToken(TokenType.EOF, "EOF"),
        ]);

        expect(lexer.tokenize("12")).toEqual([
            expectToken(TokenType.Number, "12"),
            expectToken(TokenType.EOF, "EOF"),
        ]);

        expect(lexer.tokenize("15.85")).toEqual([
            expectToken(TokenType.Number, "15.85"),
            expectToken(TokenType.EOF, "EOF"),
        ]);
    });

    it("should tokenize booleans", () => {
        expect(lexer.tokenize("TRUE")).toEqual([
            expectToken(TokenType.Boolean, "TRUE"),
            expectToken(TokenType.EOF, "EOF"),
        ]);

        expect(lexer.tokenize("FALSE")).toEqual([
            expectToken(TokenType.Boolean, "FALSE"),
            expectToken(TokenType.EOF, "EOF"),
        ]);
    });

    it("should tokenize strings", () => {
        expect(lexer.tokenize('"Hello, World!"')).toEqual([
            expectToken(TokenType.String, "Hello, World!"),
            expectToken(TokenType.EOF, "EOF"),
        ]);

        expect(lexer.tokenize('"   "')).toEqual([
            expectToken(TokenType.String, "   "),
            expectToken(TokenType.EOF, "EOF"),
        ]);
    });

    it("should tokenize identifiers", () => {
        expect(lexer.tokenize("MAX")).toEqual([
            expectToken(TokenType.Identifier, "MAX"),
            expectToken(TokenType.EOF, "EOF"),
        ]);

        expect(lexer.tokenize("MIN")).toEqual([
            expectToken(TokenType.Identifier, "MIN"),
            expectToken(TokenType.EOF, "EOF"),
        ]);

        expect(lexer.tokenize("SUM")).toEqual([
            expectToken(TokenType.Identifier, "SUM"),
            expectToken(TokenType.EOF, "EOF"),
        ]);

        expect(lexer.tokenize("A1")).toEqual([
            expectToken(TokenType.Identifier, "A1"),
            expectToken(TokenType.EOF, "EOF"),
        ]);

        expect(lexer.tokenize("B2")).toEqual([
            expectToken(TokenType.Identifier, "B2"),
            expectToken(TokenType.EOF, "EOF"),
        ]);
    });

    it("should tokenize complex formulas", () => {
        expect(lexer.tokenize("(2 + 3) * 5")).toEqual([
            expectToken(TokenType.OpenParen, "("),
            expectToken(TokenType.Number, "2"),
            expectToken(TokenType.BinOp, "+"),
            expectToken(TokenType.Number, "3"),
            expectToken(TokenType.CloseParen, ")"),
            expectToken(TokenType.BinOp, "*"),
            expectToken(TokenType.Number, "5"),
            expectToken(TokenType.EOF, "EOF"),
        ]);

        expect(lexer.tokenize("A1 + B2")).toEqual([
            expectToken(TokenType.Identifier, "A1"),
            expectToken(TokenType.BinOp, "+"),
            expectToken(TokenType.Identifier, "B2"),
            expectToken(TokenType.EOF, "EOF"),
        ]);

        expect(
            lexer.tokenize("25 + MAX(A2:A5) * (25.5 - MIN(C9:C12))"),
        ).toEqual([
            expectToken(TokenType.Number, "25"),
            expectToken(TokenType.BinOp, "+"),
            expectToken(TokenType.Identifier, "MAX"),
            expectToken(TokenType.OpenParen, "("),
            expectToken(TokenType.Identifier, "A2"),
            expectToken(TokenType.Colon, ":"),
            expectToken(TokenType.Identifier, "A5"),
            expectToken(TokenType.CloseParen, ")"),
            expectToken(TokenType.BinOp, "*"),
            expectToken(TokenType.OpenParen, "("),
            expectToken(TokenType.Number, "25.5"),
            expectToken(TokenType.BinOp, "-"),
            expectToken(TokenType.Identifier, "MIN"),
            expectToken(TokenType.OpenParen, "("),
            expectToken(TokenType.Identifier, "C9"),
            expectToken(TokenType.Colon, ":"),
            expectToken(TokenType.Identifier, "C12"),
            expectToken(TokenType.CloseParen, ")"),
            expectToken(TokenType.CloseParen, ")"),
            expectToken(TokenType.EOF, "EOF"),
        ]);
    });

    const expectToken = (type: TokenType, value: string): Token => {
        return { type, value: value };
    };
});
