import { GraphValue, Value } from "@/runtime/runtime";
export type SpreadsheetCell = {
    formula: string;
    value: string;
    color?: string;
    font?: string[];
    isInGraph?: boolean;
    compostGraphValue?: GraphValue[];
};

export type SpreadsheetRow = SpreadsheetCell[];
export type SpreadsheetData = SpreadsheetRow[];

export type CellId = `${string}${number}`;

export type CellCoords = { ri: number; ci: number };

export type History = Map<CellId, string[]>;
