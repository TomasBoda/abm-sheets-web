
export enum TokenType {
    Identifier, Number, Boolean, String,
    OpenParen, CloseParen,
    BinOp, RelOp, UnOp,
    Comma, Dot, Colon,
    EOF,
};

export type Token = {
    type: TokenType;
    value: string;
};