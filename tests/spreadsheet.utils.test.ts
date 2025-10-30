import { CellId } from "@/components/spreadsheet/spreadsheet.model";
import { SpreadsheetUtils } from "@/components/spreadsheet/spreadsheet.utils";

const CELL_MOCKS = [
    { ri: 0, ci: 0, id: "A1" },
    { ri: 1, ci: 1, id: "B2" },
    { ri: 2, ci: 2, id: "C3" },
    { ri: 3, ci: 3, id: "D4" },
    { ri: 4, ci: 4, id: "E5" },
    { ri: 0, ci: 26, id: "AA1" },
    { ri: 0, ci: 27, id: "AB1" },
    { ri: 0, ci: 28, id: "AC1" },
    { ri: 0, ci: 702, id: "AAA1" },
    { ri: 0, ci: 703, id: "AAB1" },
    { ri: 0, ci: 704, id: "AAC1" },
];

describe("SpreadsheetUtils", () => {
    it.each(CELL_MOCKS)(
        "should convert cell coords $ri, $ci to $id",
        ({ ri, ci, id }) => {
            expect(SpreadsheetUtils.cellCoordsToId({ ri, ci })).toEqual(id);
        },
    );

    it.each(CELL_MOCKS)(
        "should convert $id to cell coords $ri, $ci",
        ({ ri, ci, id }) => {
            expect(SpreadsheetUtils.cellIdToCoords(id as CellId)).toEqual({
                ri,
                ci,
            });
        },
    );

    it("should parse primary/default formula", () => {
        const expectFormula = (
            formula: string,
            defaultFormula: string,
            primaryFormula: string,
        ) => {
            expect(SpreadsheetUtils.getFormula(formula)).toEqual({
                defaultFormula,
                primaryFormula,
            });
        };

        expectFormula("", undefined, undefined);
        expectFormula("Hello, World!", undefined, undefined);
        expectFormula("A1+B1", undefined, undefined);

        expectFormula("=A1", undefined, "A1");
        expectFormula("=A1+B1", undefined, "A1+B1");

        expectFormula("=A1=B1", "A1", "B1");
        expectFormula("=A1+B1=C1", "A1+B1", "C1");
        expectFormula("=A1+B1=C1+D1", "A1+B1", "C1+D1");
    });
});
