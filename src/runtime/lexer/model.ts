export enum TokenType {
    Identifier = "Identifier",
    Number = "Number",
    Boolean = "Boolean",
    String = "String",
    OpenParen = "OpenParen",
    CloseParen = "CloseParen",
    BinOp = "BinaryOperator",
    RelOp = "RelationalOperator",
    UnOp = "UnaryOperator",
    Comma = "Comma",
    Dot = "Dot",
    Colon = "Colon",
    EOF = "EndOfFile",
}

export type Token = {
    type: TokenType;
    value: string;
};
