import { CellId, History } from "@/components/spreadsheet/spreadsheet.model";
import { SpreadsheetUtils } from "@/components/spreadsheet/spreadsheet.utils";
import { Parser } from "@/runtime/parser";
import { Runtime, ValueType } from "@/runtime/runtime";
import { getSortedCells } from "@/utils/topological-sort";

interface RuntimeInput {
    [key: CellId]: string;
}

interface CellEntry {
    id: CellId;
    formula: string;
}

describe("Runtime", () => {
    it("should evaluate binary expressions", () => {
        const result = run({
            A1: "= 5 + 2 * 3",
            B1: "= 10 - 6 / 2",
            C1: "= 5 % 2",
        });

        result.expect("A1", 0, ValueType.Number, 11);
        result.expect("B1", 0, ValueType.Number, 7);
        result.expect("C1", 0, ValueType.Number, 1);
    });

    it("should evaluate unary expressions", () => {
        const result = run({
            A1: "= -5",
            B1: "= !TRUE",
        });

        result.expect("A1", 0, ValueType.Number, -5);
        result.expect("B1", 0, ValueType.Boolean, false);
    });

    it("should throw error on invalid unary operand types", () => {
        expect(() => run({ A1: "= !1" })).toThrow(
            /Expected boolean in unary expression/,
        );
        expect(() => run({ A1: "= -TRUE" })).toThrow(
            /Expected number in unary expression/,
        );
    });

    it("should evaluate numeric relational expressions", () => {
        const result = run({
            A1: "= 5 > 2",
            B1: "= 5 < 2",
            C1: "= 5 >= 2",
            D1: "= 5 <= 2",
            E1: "= 5 == 2",
            F1: "= 5 != 2",
        });

        result.expect("A1", 0, ValueType.Boolean, true);
        result.expect("B1", 0, ValueType.Boolean, false);
        result.expect("C1", 0, ValueType.Boolean, true);
        result.expect("D1", 0, ValueType.Boolean, false);
        result.expect("E1", 0, ValueType.Boolean, false);
        result.expect("F1", 0, ValueType.Boolean, true);
    });

    it("should evaluate boolean and string relational expressions", () => {
        const result = run({
            A1: "= TRUE == FALSE",
            A2: "= TRUE != FALSE",
            B1: '= "abc" == "abc"',
            B2: '= "abc" != "xyz"',
        });

        result.expect("A1", 0, ValueType.Boolean, false);
        result.expect("A2", 0, ValueType.Boolean, true);
        result.expect("B1", 0, ValueType.Boolean, true);
        result.expect("B2", 0, ValueType.Boolean, true);
    });

    it("should respect parentheses precedence", () => {
        const result = run({ A1: "= (5 + 2) * 3" });

        result.expect("A1", 0, ValueType.Number, 21);
    });

    it("should default to 0 when referencing empty cells", () => {
        const result = run({ A1: "= B1 + 5" });
        result.expect("A1", 0, ValueType.Number, 5);
    });

    it("should evaluate formulas with references", () => {
        const result = run({
            A1: "= 5 + 2 * 3",
            B1: "= A1 * 2",
            C1: "= A1 * B1",
        });

        result.expect("A1", 0, ValueType.Number, 11);
        result.expect("B1", 0, ValueType.Number, 22);
        result.expect("C1", 0, ValueType.Number, 242);
    });

    it("should evaluate function call with cell range", () => {
        const result = run({
            A1: "= 1",
            A2: "= 2",
            A3: "= 3",
            B1: "= SUM(A1:A3)",
        });

        result.expect("A1", 0, ValueType.Number, 1);
        result.expect("A2", 0, ValueType.Number, 2);
        result.expect("A3", 0, ValueType.Number, 3);
        result.expect("B1", 0, ValueType.Number, 6);
    });

    it("should evaluate time-aware cell", () => {
        const result = run(
            {
                A1: "= 1 = A1 + 1",
            },
            5,
        );

        result.expect("A1", 0, ValueType.Number, 1);
        result.expect("A1", 1, ValueType.Number, 2);
        result.expect("A1", 2, ValueType.Number, 3);
        result.expect("A1", 3, ValueType.Number, 4);
        result.expect("A1", 4, ValueType.Number, 5);
    });

    it("should use current cell value using reference", () => {
        const result = run(
            {
                A1: "= 1 = A1 + 1",
                B1: "= A1 + 5",
                C1: "= B1 * A1",
            },
            5,
        );

        result.expect("A1", 0, ValueType.Number, 1);
        result.expect("A1", 1, ValueType.Number, 2);
        result.expect("A1", 2, ValueType.Number, 3);
        result.expect("A1", 3, ValueType.Number, 4);
        result.expect("A1", 4, ValueType.Number, 5);

        result.expect("B1", 0, ValueType.Number, 6);
        result.expect("B1", 1, ValueType.Number, 7);
        result.expect("B1", 2, ValueType.Number, 8);
        result.expect("B1", 3, ValueType.Number, 9);
        result.expect("B1", 4, ValueType.Number, 10);

        result.expect("C1", 0, ValueType.Number, 6);
        result.expect("C1", 1, ValueType.Number, 14);
        result.expect("C1", 2, ValueType.Number, 24);
        result.expect("C1", 3, ValueType.Number, 36);
        result.expect("C1", 4, ValueType.Number, 50);
    });

    it("should evaluate math library functions", () => {
        const result = run({
            A1: "= ABS(-5)",
            A2: "= FLOOR(5.9)",
            A3: "= CEILING(5.1)",
            A4: "= POWER(2, 3)",
            A5: "= ROUND(3.14159, 2)",
            A6: "= SQRT(9)",
        });

        result.expect("A1", 0, ValueType.Number, 5);
        result.expect("A2", 0, ValueType.Number, 5);
        result.expect("A3", 0, ValueType.Number, 6);
        result.expect("A4", 0, ValueType.Number, 8);
        result.expect("A5", 0, ValueType.Number, 3.14);
        result.expect("A6", 0, ValueType.Number, 3);
    });

    it("should evaluate cell range aggregation functions", () => {
        const result = run({
            A1: "= 1",
            A2: "= 2",
            A3: "= 3",
            B1: "= MIN(A1:A3)",
            B2: "= MAX(A1:A3)",
            B3: "= SUM(A1:A3)",
            B4: "= PRODUCT(A1:A3)",
            B5: "= AVERAGE(A1:A3)",
            B6: "= COUNT(A1:A3)",
        });

        result.expect("B1", 0, ValueType.Number, 1);
        result.expect("B2", 0, ValueType.Number, 3);
        result.expect("B3", 0, ValueType.Number, 6);
        result.expect("B4", 0, ValueType.Number, 6);
        result.expect("B5", 0, ValueType.Number, 2);
        result.expect("B6", 0, ValueType.Number, 3);
    });

    it("should evaluate COUNTIF over numbers, strings and booleans", () => {
        const result = run({
            A1: "= 1",
            A2: "= 2",
            A3: "= 1",
            B1: '= "x"',
            B2: '= "y"',
            B3: '= "x"',
            C1: "= TRUE",
            C2: "= FALSE",
            C3: "= TRUE",
            D1: "= COUNTIF(A1:A3, 1)",
            D2: '= COUNTIF(B1:B3, "x")',
            D3: "= COUNTIF(C1:C3, TRUE)",
        });

        result.expect("D1", 0, ValueType.Number, 2);
        result.expect("D2", 0, ValueType.Number, 2);
        result.expect("D3", 0, ValueType.Number, 2);
    });

    it("should evaluate string functions", () => {
        const result = run({
            A1: '= CONCAT("a", 1, TRUE)',
            A2: '= LEFT("hello", 2)',
            A3: '= RIGHT("hello", 3)',
            A4: '= MID("abcdef", 2, 2)',
            A5: '= LEN("hello")',
        });

        result.expect("A1", 0, ValueType.String, "a1TRUE");
        result.expect("A2", 0, ValueType.String, "he");
        result.expect("A3", 0, ValueType.String, "llo");
        result.expect("A4", 0, ValueType.String, "cd");
        result.expect("A5", 0, ValueType.Number, 5);
    });

    it("should evaluate logical and conditional functions", () => {
        const result = run({
            A1: "= IF(TRUE, 1, 2)",
            A2: "= IF(FALSE, 1, 2)",
            A3: "= AND(TRUE, TRUE, TRUE)",
            A4: "= AND(TRUE, FALSE, TRUE)",
            A5: "= OR(FALSE, FALSE)",
            A6: "= OR(FALSE, TRUE)",
        });

        result.expect("A1", 0, ValueType.Number, 1);
        result.expect("A2", 0, ValueType.Number, 2);
        result.expect("A3", 0, ValueType.Boolean, true);
        result.expect("A4", 0, ValueType.Boolean, false);
        result.expect("A5", 0, ValueType.Boolean, false);
        result.expect("A6", 0, ValueType.Boolean, true);
    });

    it("should evaluate INDEX and MATCH", () => {
        const result = run({
            A1: "= 10",
            A2: "= 20",
            A3: "= 30",
            B1: "= INDEX(A1:A3, 1)",
            B2: "= INDEX(A1:A3, 2)",
            B3: "= INDEX(A1:A3, 5)",
            C1: "= MATCH(20, A1:A3)",
            C2: "= MATCH(40, A1:A3)",
        });

        result.expect("B1", 0, ValueType.Number, 20);
        result.expect("B2", 0, ValueType.Number, 30);
        result.expect("B3", 0, ValueType.Number, -1);
        result.expect("C1", 0, ValueType.Number, 1);
        result.expect("C2", 0, ValueType.Number, -1);
    });

    it("should evaluate STEP, STEPS, PREV, TIMERANGE", () => {
        const result = run(
            {
                A1: "= 1 = A1 + 1",
                B1: "= STEP()",
                B2: "= STEPS()",
                C1: "= PREV(A1)",
                C2: "= PREV(A1, 2)",
                D1: "= TIMERANGE(A1, 2)",
            },
            5,
        );

        // STEP / STEPS
        result.expect("B1", 0, ValueType.Number, 0);
        result.expect("B1", 1, ValueType.Number, 1);
        result.expect("B1", 2, ValueType.Number, 2);
        result.expect("B1", 3, ValueType.Number, 3);
        result.expect("B1", 4, ValueType.Number, 4);

        result.expect("B2", 0, ValueType.Number, 5);
        result.expect("B2", 1, ValueType.Number, 5);
        result.expect("B2", 2, ValueType.Number, 5);
        result.expect("B2", 3, ValueType.Number, 5);
        result.expect("B2", 4, ValueType.Number, 5);

        result.expect("C1", 0, ValueType.Number, 0);
        result.expect("C1", 1, ValueType.Number, 1);
        result.expect("C1", 2, ValueType.Number, 2);
        result.expect("C1", 3, ValueType.Number, 3);
        result.expect("C1", 4, ValueType.Number, 4);

        result.expect("C2", 0, ValueType.Number, 0);
        result.expect("C2", 1, ValueType.Number, 0);
        result.expect("C2", 2, ValueType.Number, 1);
        result.expect("C2", 3, ValueType.Number, 2);
        result.expect("C2", 4, ValueType.Number, 3);

        result.expect("D1", 0, ValueType.Range, [
            { type: ValueType.Number, value: 1 },
        ]);

        result.expect("D1", 1, ValueType.Range, [
            { type: ValueType.Number, value: 1 },
            { type: ValueType.Number, value: 2 },
        ]);

        result.expect("D1", 2, ValueType.Range, [
            { type: ValueType.Number, value: 1 },
            { type: ValueType.Number, value: 2 },
            { type: ValueType.Number, value: 3 },
        ]);

        result.expect("D1", 3, ValueType.Range, [
            { type: ValueType.Number, value: 2 },
            { type: ValueType.Number, value: 3 },
            { type: ValueType.Number, value: 4 },
        ]);

        result.expect("D1", 4, ValueType.Range, [
            { type: ValueType.Number, value: 3 },
            { type: ValueType.Number, value: 4 },
            { type: ValueType.Number, value: 5 },
        ]);
    });

    it("should return error for PREV with negative offset", () => {
        const result = run(
            {
                A1: "= 1 = A1 + 1",
                B1: "= PREV(A1, -1)",
            },
            2,
        );

        result.expect(
            "B1",
            0,
            ValueType.Error,
            "Offset needs to be a positive number",
        );
    });

    it("should create POINT and CATEGORICALCOORDS and render GRAPH", () => {
        const result = run({
            A1: "= POINT(1, 2)",
            A2: '= CATEGORICALCOORD("A", 1)',
            A3: '= CATEGORICALCOORD(1, "B")',
            A4: '= TEXT(POINT(1,2), "hi")',
            A5: '= RENDER(TEXT(POINT(1,2), "hi"))',
        });

        result.expectType("A1", 0, ValueType.Point);
        result.expectType("A2", 0, ValueType.CategoricalCoord);
        result.expectType("A3", 0, ValueType.CategoricalCoord);
        result.expectType("A4", 0, ValueType.Shape);
        result.expectType("A5", 0, ValueType.Graph);
    });

    it("should throw error on unknown identifier", () => {
        expect(() => run({ A1: "= FOO" })).toThrow(
            /Variable 'FOO' does not exist/,
        );
    });

    const run = (input: RuntimeInput, steps?: number) => {
        const cellEntries: CellEntry[] = Object.entries(input).map(
            ([key, value]) => ({ id: key as CellId, formula: value as string }),
        );

        const topologicallySortedCells = getSortedCells(cellEntries);

        const sortedCells: CellEntry[] = topologicallySortedCells.cells
            .map(
                (cellId) =>
                    cellEntries.find((cellEntry) => cellEntry.id === cellId)!,
            )
            .filter((cellEntry) => cellEntry !== undefined);

        const history: History = new Map();

        const parser = new Parser();
        const runtime = new Runtime();

        for (let step = 0; step < (steps ?? 1); step++) {
            for (const { id: cellId, formula: cellFormula } of sortedCells) {
                const { defaultFormula, primaryFormula } =
                    SpreadsheetUtils.getFormula(cellFormula);

                const formula =
                    step === 0
                        ? (defaultFormula ?? primaryFormula)
                        : primaryFormula;

                const expression = parser.parse(formula);
                const result = runtime.run(expression, history, step, steps);

                if (!result) continue;

                history.set(cellId, [...(history.get(cellId) ?? []), result]);
            }
        }

        return {
            expect: (
                cellId: CellId,
                step: number,
                type: ValueType,
                value: any,
            ) => {
                expect(history.get(cellId)?.[step]).toEqual({ type, value });
            },
            expectType: (cellId: CellId, step: number, type: ValueType) => {
                expect(history.get(cellId)?.[step]?.type).toBe(type);
            },
            history,
        };
    };
});
