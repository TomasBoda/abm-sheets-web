import { History } from "@/components/spreadsheet/spreadsheet.model";

export enum ValueType {
    Number,
    Boolean,
    String,
    CellLiteral,
    CellRange,
}

export interface Value {
    type: ValueType;
    value: number | boolean | string | number[];
}

export interface NumberValue {
    type: ValueType.Number;
    value: number;
}

export interface BooleanValue {
    type: ValueType.Boolean;
    value: boolean;
}

export interface StringValue {
    type: ValueType.String;
    value: string;
}

export interface CellLiteralValue {
    type: ValueType.CellLiteral;
    value: number[];
}

export interface CellRangeValue {
    type: ValueType.CellRange;
    value: number[];
}

export type FuncProps = {
    args: Value[];
    step: number;
    history: History;
    dataHistory: History;
};

export type FuncCall = (props: FuncProps) => Value;
