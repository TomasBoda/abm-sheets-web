import { Token, TokenType } from "./model";
import { LexerUtils } from "./utils";

export class Lexer {
    private formula: string[] = [];
    private tokens: Token[] = [];

    /**
     * Converts a raw formula string into an array of tokens
     *
     * @param formula - raw formula string
     * @returns array of tokens
     */
    public tokenize(formula: string): Token[] {
        this.formula = formula.split("");
        this.tokens = [];

        while (this.at()) {
            const value = this.at();

            if (LexerUtils.isSkippable(value)) {
                this.next();
                continue;
            }

            switch (value) {
                case "(": {
                    this.token(TokenType.OpenParen, value);
                    this.next();
                    break;
                }
                case ")": {
                    this.token(TokenType.CloseParen, value);
                    this.next();
                    break;
                }
                case ",": {
                    this.token(TokenType.Comma, value);
                    this.next();
                    break;
                }
                case ".": {
                    this.token(TokenType.Dot, value);
                    this.next();
                    break;
                }
                case ":": {
                    this.token(TokenType.Colon, value);
                    this.next();
                    break;
                }
                case "+":
                case "-":
                case "*":
                case "/":
                case "%": {
                    this.token(TokenType.BinOp, value);
                    this.next();
                    break;
                }
                case "=": {
                    this.next();

                    if (this.at() === "=") {
                        this.token(TokenType.RelOp, "==");
                        this.next();
                        break;
                    }

                    throw new Error("Expected '==', got '='");
                }
                case "!": {
                    this.next();

                    if (this.at() === "=") {
                        this.token(TokenType.RelOp, "!=");
                        this.next();
                        break;
                    }

                    this.token(TokenType.UnOp, "!");
                    break;
                }
                case ">": {
                    let operator = this.next();

                    if (this.at() === "=") {
                        operator += this.next();
                    }

                    this.token(TokenType.RelOp, operator);
                    break;
                }
                case "<": {
                    let operator = this.next();

                    if (this.at() === "=") {
                        operator += this.next();
                    }

                    this.token(TokenType.RelOp, operator);
                    break;
                }
                default: {
                    if (LexerUtils.isAlpha(value) || value === "$") {
                        this.tokenizeIdentifier(value);
                        break;
                    }

                    if (LexerUtils.isNumber(value)) {
                        this.tokenizeNumber(value);
                        break;
                    }

                    if (this.at() === '"') {
                        this.tokenizeString();
                        break;
                    }

                    throw new Error(`Unrecognized symbol '${this.at()}'`);
                }
            }
        }

        this.token(TokenType.EOF, "EOF");
        return this.tokens;
    }

    // tokenizes identifiers, e.g. MAX, SUM, A1, B2, C3, etc.
    private tokenizeIdentifier(value: string): void {
        let identifier = value;

        this.next();

        while (
            this.at() !== undefined &&
            (LexerUtils.isAlpha(this.at()!) ||
                LexerUtils.isNumber(this.at()!) ||
                this.at()! === "$")
        ) {
            identifier += this.next()!;
        }

        identifier = identifier.toUpperCase();

        switch (identifier) {
            case "TRUE":
            case "FALSE": {
                this.token(TokenType.Boolean, identifier);
                break;
            }
            default: {
                this.token(TokenType.Identifier, identifier);
                break;
            }
        }
    }

    // tokenizes numbers, e.g. 12, 15.85
    private tokenizeNumber(value: string): void {
        let number = value;
        let foundDot = false;

        this.next();

        while (
            this.at() !== undefined &&
            (LexerUtils.isNumber(this.at()!) || this.at()! === ".")
        ) {
            if (this.at()! === ".") {
                if (foundDot) {
                    throw new Error("Number cannot contain more than one dot.");
                }

                foundDot = true;
                number += ".";
                this.next();
            } else {
                number += this.next();
            }
        }

        this.token(TokenType.Number, number);
    }

    // tokenizes strings, e.g. "Hello, World!"
    private tokenizeString(): void {
        this.next();

        let string = "";

        while (this.at() !== '"') {
            string += this.next();
        }

        this.next();
        this.token(TokenType.String, string);
    }

    // append a new token to the tokens array
    private token(type: TokenType, value: string): void {
        this.tokens.push({ type, value });
    }

    // returns the current symbol in the formula
    private at(): string | undefined {
        if (this.formula.length === 0) {
            return undefined;
        }

        return this.formula[0];
    }

    // returns the current symbol in the formula and advances to the next symbol
    private next(): string | undefined {
        return this.formula.shift();
    }
}
