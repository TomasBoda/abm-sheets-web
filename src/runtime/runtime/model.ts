import { History } from "@/components/spreadsheet/spreadsheet.model";

export enum ValueType {
    Number = "Number",
    Boolean = "Boolean",
    String = "String",

    CellLiteral = "CellLiteral",
    Range = "Range",

    Point = "Point",
    CategoricalCoord = "CategoricalCoord",
    Shape = "Shape",
    Graph = "Graph",
    Scale = "Scale",

    Error = "Error",
}

export type NumberType = number;

export type BooleanType = boolean;

export type StringType = string;

export type CellLiteralType = {
    ri: number;
    ci: number;
};

export type RangeType = Value[];

export type PointType = {
    x: number | CategoricalCoord;
    y: number | CategoricalCoord;
};

export type CategoricalCoord = [string, number] | [number, string];

export type ShapeType = any;

export type ScaleType = any;

export type GraphType = ShapeType;

export type ErrorType = string;

export interface Value {
    type: ValueType;
    value:
        | NumberType
        | BooleanType
        | StringType
        | CellLiteralType
        | RangeType
        | PointType
        | CategoricalCoord
        | ShapeType
        | ScaleType
        | GraphType
        | ErrorType;
}

export interface NumberValue extends Value {
    type: ValueType.Number;
    value: NumberType;
}

export interface BooleanValue extends Value {
    type: ValueType.Boolean;
    value: BooleanType;
}

export interface StringValue extends Value {
    type: ValueType.String;
    value: StringType;
}

export interface CellLiteralValue extends Value {
    type: ValueType.CellLiteral;
    value: CellLiteralType;
}

export interface RangeValue extends Value {
    type: ValueType.Range;
    value: RangeType;
}

export interface PointValue extends Value {
    type: ValueType.Point;
    value: PointType;
}

export interface CategoricalCoordValue extends Value {
    type: ValueType.CategoricalCoord;
    value: CategoricalCoord;
}

export interface ShapeValue extends Value {
    type: ValueType.Shape;
    value: ShapeType;
    label: string;
}

export interface ScaleValue extends Value {
    type: ValueType.Scale;
    value: ScaleType;
    label: string;
}

export interface GraphValue extends Value {
    type: ValueType.Graph;
    value: GraphType;
}

export interface ErrorValue extends Value {
    type: ValueType.Error;
    value: ErrorType;
}

export type FuncProps = {
    args: Value[];
    history: History;
    step: number;
    steps: number;
};

export type FuncCall = (props: FuncProps) => Value;
