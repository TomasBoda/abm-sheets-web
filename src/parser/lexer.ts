
export enum TokenType {
    Identifier,
    Number,
    Boolean,

    OpenParen,
    CloseParen,

    BinOp,
    RelOp,

    Comma,
    Dot,

    EOF,
};

export type Token = {
    type: TokenType;
    value: string;
};

export class Lexer {

    private static formula: string[] = [];
    private static tokens: Token[] = [];

    public static tokenize(formula: string): Token[] {
        this.formula = formula.split("");
        this.tokens = [];

        while (this.at() !== undefined) {
            const value = this.at()!;

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
                case "+":
                case "-":
                case "*":
                case "/": {
                    this.token(TokenType.BinOp, value);
                    this.next();
                    break;
                }
                default: {
                    if (this.isAlpha(value) || this.at() === "$") {
                        this.tokenizeIdentifier(value);
                        break;
                    }

                    if (this.isNumber(value)) {
                        this.tokenizeNumber(value);
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

        // keywords
        switch (identifier) {
            case "true":
            case "false": {
                this.token(TokenType.Boolean, identifier);
                break;
            }
            case "eq":
            case "neq":
            case "gt":
            case "ge":
            case "lt":
            case "le": {
                this.token(TokenType.RelOp, identifier);
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