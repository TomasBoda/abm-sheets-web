import { CellId } from "@/components/spreadsheet/spreadsheet.model";
import { Functions } from "@/runtime/functions";
import {
    BooleanValue,
    CellLiteralValue,
    CellRangeValue,
    FuncProps,
    NumberValue,
    StringValue,
    Value,
    ValueType,
} from "@/runtime/runtime";
import { Utils } from "@/utils/utils";
import "@testing-library/jest-dom";

describe("Functions", () => {
    let props: FuncProps;

    beforeEach(() => {
        props = {
            args: [],
            step: 0,
            history: new Map<CellId, string[]>(),
            dataHistory: new Map<CellId, string[]>(),
        };
    });

    describe("match", () => {
        it("should match numbers vertically", () => {
            const range: CellId[] = ["A1", "A5"];
            const { ri: r1, ci: c1 } = Utils.cellIdToCoords(range[0]);
            const { ri: r2, ci: c2 } = Utils.cellIdToCoords(range[1]);

            props.args = [createNumber(1), createCellRange([c1, r1, c2, r2])];

            props.history.set("A1", ["1"]);
            props.history.set("A2", ["2"]);
            props.history.set("A3", ["3"]);
            props.history.set("A4", ["4"]);
            props.history.set("A5", ["5"]);

            props.args[0].value = 1;
            expect(Functions.match(props)).toEqual(createNumber(0));

            props.args[0].value = 2;
            expect(Functions.match(props)).toEqual(createNumber(1));

            props.args[0].value = 3;
            expect(Functions.match(props)).toEqual(createNumber(2));

            props.args[0].value = 4;
            expect(Functions.match(props)).toEqual(createNumber(3));

            props.args[0].value = 5;
            expect(Functions.match(props)).toEqual(createNumber(4));
        });

        // TODO: add boolean matching

        it("should match strings horizontally", () => {
            const range: CellId[] = ["A1", "E1"];
            const { ri: r1, ci: c1 } = Utils.cellIdToCoords(range[0]);
            const { ri: r2, ci: c2 } = Utils.cellIdToCoords(range[1]);

            props.args = [createString(""), createCellRange([c1, r1, c2, r2])];

            props.history.set("A1", ["a"]);
            props.history.set("B1", ["b"]);
            props.history.set("C1", ["c"]);
            props.history.set("D1", ["d"]);
            props.history.set("E1", ["e"]);

            props.args[0].value = "a";
            expect(Functions.match(props)).toEqual(createNumber(0));

            props.args[0].value = "b";
            expect(Functions.match(props)).toEqual(createNumber(1));

            props.args[0].value = "c";
            expect(Functions.match(props)).toEqual(createNumber(2));

            props.args[0].value = "d";
            expect(Functions.match(props)).toEqual(createNumber(3));

            props.args[0].value = "e";
            expect(Functions.match(props)).toEqual(createNumber(4));
        });

        it("should not match value", () => {
            const range: CellId[] = ["A1", "A3"];
            const { ri: r1, ci: c1 } = Utils.cellIdToCoords(range[0]);
            const { ri: r2, ci: c2 } = Utils.cellIdToCoords(range[1]);

            props.args = [createNumber(1), createCellRange([c1, r1, c2, r2])];

            props.history.set("A1", ["1"]);
            props.history.set("A2", ["2"]);
            props.history.set("A3", ["3"]);

            props.args[0].value = 4;
            expect(Functions.match(props)).toEqual(createNumber(-1));
        });

        it("should not support multi-dimensional matching", () => {
            const range: CellId[] = ["A1", "B2"];
            const { ri: r1, ci: c1 } = Utils.cellIdToCoords(range[0]);
            const { ri: r2, ci: c2 } = Utils.cellIdToCoords(range[1]);

            props.args = [createNumber(1), createCellRange([c1, r1, c2, r2])];

            props.history.set("A1", ["1"]);
            props.history.set("A2", ["2"]);
            props.history.set("B1", ["3"]);
            props.history.set("B2", ["4"]);

            props.args[0].value = 3;
            expect(() => Functions.match(props)).toThrow();
        });
    });

    describe("index", () => {
        it("should correctly index", () => {
            const range: CellId[] = ["A1", "A5"];
            const { ri: r1, ci: c1 } = Utils.cellIdToCoords(range[0]);
            const { ri: r2, ci: c2 } = Utils.cellIdToCoords(range[1]);

            props.args = [createCellRange([c1, r1, c2, r2]), createNumber(0)];

            props.history.set("A1", ["1"]);
            props.history.set("A2", ["2"]);
            props.history.set("A3", ["3"]);
            props.history.set("A4", ["4"]);
            props.history.set("A5", ["5"]);

            props.args[1].value = 0;
            expect(Functions.index(props)).toEqual(createNumber(1));

            props.args[1].value = 1;
            expect(Functions.index(props)).toEqual(createNumber(2));

            props.args[1].value = 2;
            expect(Functions.index(props)).toEqual(createNumber(3));

            props.args[1].value = 3;
            expect(Functions.index(props)).toEqual(createNumber(4));

            props.args[1].value = 4;
            expect(Functions.index(props)).toEqual(createNumber(5));
        });

        it("should return default value 0 on index out of bounds", () => {
            const range: CellId[] = ["A1", "A5"];
            const { ri: r1, ci: c1 } = Utils.cellIdToCoords(range[0]);
            const { ri: r2, ci: c2 } = Utils.cellIdToCoords(range[1]);

            props.args = [createCellRange([c1, r1, c2, r2]), createNumber(0)];

            props.history.set("A1", ["1"]);
            props.history.set("A2", ["2"]);
            props.history.set("A3", ["3"]);
            props.history.set("A4", ["4"]);
            props.history.set("A5", ["5"]);

            props.args[1].value = 5;
            expect(Functions.index(props)).toEqual(createNumber(0));
        });
    });

    describe("concat", () => {
        it("should concat numbers", () => {
            props.args = [createNumber(1), createNumber(2), createNumber(3)];

            expectString(Functions.concat(props), "123");
        });

        it("should concat booleans", () => {
            props.args = [
                createBoolean(true),
                createBoolean(false),
                createBoolean(false),
            ];

            expectString(Functions.concat(props), "TRUEFALSEFALSE");
        });

        it("should concat strings", () => {
            props.args = [
                createString("Hello, "),
                createString("John"),
                createString("!"),
            ];

            expectString(Functions.concat(props), "Hello, John!");
        });

        it("should concat mixed", () => {
            props.args = [
                createNumber(12),
                createBoolean(true),
                createString("hello"),
            ];

            expectString(Functions.concat(props), "12TRUEhello");
        });
    });

    describe("step", () => {
        it("should return correct step", () => {
            props.step = 0;
            expect(Functions.step(props)).toEqual(createNumber(0));

            props.step = 1;
            expect(Functions.step(props)).toEqual(createNumber(1));

            props.step = 2;
            expect(Functions.step(props)).toEqual(createNumber(2));
        });
    });

    describe("if", () => {
        it("should return consequent on true", () => {
            props.args = [
                createBoolean(true),
                createString("YES"),
                createString("NO"),
            ];

            expect(Functions.conditional(props)).toEqual(createString("YES"));
        });

        it("should return alternate on false", () => {
            props.args = [
                createBoolean(false),
                createString("YES"),
                createString("NO"),
            ];

            expect(Functions.conditional(props)).toEqual(createString("NO"));
        });
    });

    describe("sum", () => {
        it("should return correct sum", () => {
            const range: CellId[] = ["A1", "A9"];
            const { ri: r1, ci: c1 } = Utils.cellIdToCoords(range[0]);
            const { ri: r2, ci: c2 } = Utils.cellIdToCoords(range[1]);

            props.args = [createCellRange([c1, r1, c2, r2])];

            props.history.set("A1", ["1"]);
            props.history.set("A2", ["a"]);
            props.history.set("A3", ["2"]);
            props.history.set("A4", ["TRUE"]);
            props.history.set("A5", ["3"]);
            props.history.set("A6", ["hello"]);
            props.history.set("A7", ["4"]);
            props.history.set("A8", [""]);
            props.history.set("A9", ["5"]);

            expect(Functions.sum(props)).toEqual(
                createNumber(1 + 2 + 3 + 4 + 5),
            );
        });
    });

    describe("countif", () => {
        it("should return correct value", () => {
            const range: CellId[] = ["A1", "A5"];
            const { ri: r1, ci: c1 } = Utils.cellIdToCoords(range[0]);
            const { ri: r2, ci: c2 } = Utils.cellIdToCoords(range[1]);

            props.args = [createCellRange([c1, r1, c2, r2]), createNumber(0)];

            props.history.set("A1", ["1"]);
            props.history.set("A2", ["2"]);
            props.history.set("A3", ["2"]);
            props.history.set("A4", ["1"]);
            props.history.set("A5", ["2"]);

            props.args[1].value = 1;
            expect(Functions.countif(props)).toEqual(createNumber(2));

            props.args[1].value = 2;
            expect(Functions.countif(props)).toEqual(createNumber(3));
        });
    });

    describe("min", () => {
        it("should return correct min value", () => {
            const range: CellId[] = ["A1", "A5"];
            const { ri: r1, ci: c1 } = Utils.cellIdToCoords(range[0]);
            const { ri: r2, ci: c2 } = Utils.cellIdToCoords(range[1]);

            props.args = [createCellRange([c1, r1, c2, r2])];

            props.history.set("A1", ["1"]);
            props.history.set("A2", ["TRUE"]);
            props.history.set("A3", ["hello"]);
            props.history.set("A4", [""]);
            props.history.set("A5", ["-20"]);

            expect(Functions.min(props)).toEqual(createNumber(-20));
        });
    });

    describe("max", () => {
        it("should return correct max value", () => {
            const range: CellId[] = ["A1", "A5"];
            const { ri: r1, ci: c1 } = Utils.cellIdToCoords(range[0]);
            const { ri: r2, ci: c2 } = Utils.cellIdToCoords(range[1]);

            props.args = [createCellRange([c1, r1, c2, r2])];

            props.history.set("A1", ["1"]);
            props.history.set("A2", ["TRUE"]);
            props.history.set("A3", ["hello"]);
            props.history.set("A4", [""]);
            props.history.set("A5", ["-20"]);

            expect(Functions.max(props)).toEqual(createNumber(1));
        });
    });

    describe("average", () => {
        it("should return correct average value", () => {
            const range: CellId[] = ["A1", "A5"];
            const { ri: r1, ci: c1 } = Utils.cellIdToCoords(range[0]);
            const { ri: r2, ci: c2 } = Utils.cellIdToCoords(range[1]);

            props.args = [createCellRange([c1, r1, c2, r2])];

            props.history.set("A1", ["1"]);
            props.history.set("A2", ["TRUE"]);
            props.history.set("A3", ["hello"]);
            props.history.set("A4", ["5"]);
            props.history.set("A5", ["20"]);

            expect(Functions.average(props)).toEqual(
                createNumber((1 + 5 + 20) / 3),
            );
        });
    });

    describe("and", () => {
        it("should return correct value", () => {
            props.args = [createBoolean(true), createBoolean(true)];
            expect(Functions.and(props)).toEqual(createBoolean(true));

            props.args = [createBoolean(true), createBoolean(false)];
            expect(Functions.and(props)).toEqual(createBoolean(false));

            props.args = [createBoolean(false), createBoolean(true)];
            expect(Functions.and(props)).toEqual(createBoolean(false));

            props.args = [createBoolean(false), createBoolean(false)];
            expect(Functions.and(props)).toEqual(createBoolean(false));
        });
    });

    describe("or", () => {
        it("should return correct value", () => {
            props.args = [createBoolean(true), createBoolean(true)];
            expect(Functions.or(props)).toEqual(createBoolean(true));

            props.args = [createBoolean(true), createBoolean(false)];
            expect(Functions.or(props)).toEqual(createBoolean(true));

            props.args = [createBoolean(false), createBoolean(true)];
            expect(Functions.or(props)).toEqual(createBoolean(true));

            props.args = [createBoolean(false), createBoolean(false)];
            expect(Functions.or(props)).toEqual(createBoolean(false));
        });
    });

    describe("prev", () => {
        it("should return correct previous value", () => {
            const cellId = "A1";
            const { ri, ci } = Utils.cellIdToCoords(cellId);
            props.args = [createCellLiteral([ci, ri])];

            props.step = 1;

            props.history.set(cellId, ["1", "2"]);
            expect(Functions.prev(props)).toEqual(createNumber(1));

            props.step = 2;

            props.history.set(cellId, ["1", "2", "3"]);
            expect(Functions.prev(props)).toEqual(createNumber(2));
        });

        it("should return default value 0 when previous is not present", () => {
            const cellId = "A1";
            const { ri, ci } = Utils.cellIdToCoords(cellId);
            props.args = [createCellLiteral([ci, ri])];

            expect(Functions.prev(props)).toEqual(createNumber(0));

            props.history.set(cellId, ["1"]);
            expect(Functions.prev(props)).toEqual(createNumber(0));
        });
    });

    describe("history", () => {
        it("should return correct historical value", () => {
            const cellId = "A1";
            const { ri, ci } = Utils.cellIdToCoords(cellId);
            props.args = [createCellLiteral([ci, ri]), createNumber(0)];

            props.history.set(cellId, ["1", "2", "3", "4", "5"]);

            props.step = 4;

            props.args[1].value = 1;
            expect(Functions.history(props)).toEqual(createNumber(4));

            props.args[1].value = 2;
            expect(Functions.history(props)).toEqual(createNumber(3));

            props.args[1].value = 3;
            expect(Functions.history(props)).toEqual(createNumber(2));

            props.args[1].value = 4;
            expect(Functions.history(props)).toEqual(createNumber(1));
        });
    });

    function createNumber(value: number): NumberValue {
        return { type: ValueType.Number, value };
    }

    function createBoolean(value: boolean): BooleanValue {
        return { type: ValueType.Boolean, value };
    }

    function createString(value: string): StringValue {
        return { type: ValueType.String, value };
    }

    function createCellLiteral(value: number[]): CellLiteralValue {
        return { type: ValueType.CellLiteral, value };
    }

    function createCellRange(value: number[]): CellRangeValue {
        return { type: ValueType.CellRange, value };
    }

    function expectNumber(value: Value, result: number): void {
        expect(value.type).toEqual(ValueType.Number);
        expect((value as NumberValue).value).toEqual(result);
    }

    function expectBoolean(value: Value, result: number): void {
        expect(value.type).toEqual(ValueType.Boolean);
        expect((value as BooleanValue).value).toEqual(result);
    }

    function expectString(value: Value, result: string): void {
        expect(value.type).toEqual(ValueType.String);
        expect((value as StringValue).value).toEqual(result);
    }
});
