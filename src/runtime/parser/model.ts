export enum NodeType {
    NumericLiteral = "NumericLiteral",
    BooleanLiteral = "BooleanLiteral",
    StringLiteral = "StringLiteral",
    Identifier = "Identifier",
    CellLiteral = "CellLiteral",
    CellRangeLiteral = "CellRangeLiteral",
    RelationalExpression = "RelationalExpression",
    BinaryExpression = "BinaryExpression",
    UnaryExpression = "UnaryExpression",
    CallExpression = "CallExpression",
}

export interface Expression {
    type: NodeType;
}

export interface NumericLiteral extends Expression {
    type: NodeType.NumericLiteral;
    value: number;
}

export interface BooleanLiteral extends Expression {
    type: NodeType.BooleanLiteral;
    value: boolean;
}

export interface StringLiteral extends Expression {
    type: NodeType.StringLiteral;
    value: string;
}

export interface Identifier extends Expression {
    type: NodeType.Identifier;
    value: string;
}

type CellAxis = {
    index: number;
    fixed: boolean;
};

export interface CellLiteral extends Expression {
    type: NodeType.CellLiteral;
    row: CellAxis;
    col: CellAxis;
}

export interface CellRangeLiteral extends Expression {
    type: NodeType.CellRangeLiteral;
    left: CellLiteral;
    right: CellLiteral;
}

export interface BinaryExpression extends Expression {
    type: NodeType.BinaryExpression;
    left: Expression;
    right: Expression;
    operator: string;
}

export interface UnaryExpression extends Expression {
    type: NodeType.UnaryExpression;
    value: Expression;
    operator: string;
}

export interface RelationalExpression extends Expression {
    type: NodeType.RelationalExpression;
    left: Expression;
    right: Expression;
    operator: string;
}

export interface CallExpression extends Expression {
    type: NodeType.CallExpression;
    identifier: string;
    args: Expression[];
}
