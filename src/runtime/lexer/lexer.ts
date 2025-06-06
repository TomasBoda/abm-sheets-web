import { Token, TokenType } from "./model";

export class Lexer {

    private static formula: string[] = [];
    private static tokens: Token[] = [];

    public static tokenize(formula: string): Token[] {
        this.formula = formula.split("");
        this.tokens = [];

        while (this.at()) {
            const value = this.at();

            if (this.isSkippable(value)) {
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
                        console.log("HERE");
                        this.next();
                        break;
                    }

                    throw new Error("Expected = sign after = sign.");
                }
                case "!": {
                    this.next();

                    if (this.at() === "=") {
                        this.token(TokenType.RelOp, "!=");
                        this.next();
                        break;
                    }

                    throw new Error("Expected = sign after = sign.");
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
                    if (this.isAlpha(value) || value === "$") {
                        this.tokenizeIdentifier(value);
                        break;
                    }

                    if (this.isNumber(value)) {
                        this.tokenizeNumber(value);
                        break;
                    }

                    if (this.at() === "\"") {
                        this.tokenizeString();
                        break;
                    }

                    this.next();
                }
            }
        }

        this.token(TokenType.EOF, "EOF");

        return this.tokens;
    }

    private static tokenizeIdentifier(value: string): void {
        let identifier = value;
        
        this.next();

        while (this.at() !== undefined && (this.isAlpha(this.at()!) || this.isNumber(this.at()!) || this.at()! === "$")) {
            identifier += this.next()!;
        }

        identifier = identifier.toLowerCase();

        switch (identifier) {
            case "true":
            case "false": {
                this.token(TokenType.Boolean, identifier);
                break;
            }
            default: {
                this.token(TokenType.Identifier, identifier);
                break;
            }
        }
    }

    private static tokenizeNumber(value: string): void {
        let number = value;
        let foundDot = false;

        this.next();

        while (this.at() !== undefined && (this.isNumber(this.at()!) || this.at()! === ".")) {
            if (this.at()! === ".") {
                if (foundDot) {
                    throw new Error("Second dot in number");
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

    private static tokenizeString(): void {
        this.next();

        let string = "";

        while (this.at() !== "\"") {
            string += this.next();
        }

        this.next();

        this.token(TokenType.String, string);
    }

    private static token(type: TokenType, value: string): void {
        this.tokens.push({ type, value });
    }

    private static at(): string | undefined {
        if (this.formula.length === 0) {
            return undefined;
        }

        return this.formula[0];
    }

    private static next(): string | undefined {
        return this.formula.shift();
    }

    private static isAlpha(value: string): boolean {
        return /^[A-Za-z]+$/.test(value);
    }

    private static isNumber(value: string): boolean {
        const symbol = value.charCodeAt(0);
        const bounds = {
            lower: "0".charCodeAt(0),
            upper: "9".charCodeAt(0)
        };

        return symbol >= bounds.lower && symbol <= bounds.upper;
    }

    private static isSkippable(value: string) {
        return value === " ";
    }
}