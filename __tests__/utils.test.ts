import { Utils } from "@/utils/utils";
import "@testing-library/jest-dom";

describe("Utils", () => {
    it("should return correct default and primary formulas", () => {
        expect(Utils.getFormula("=10")).toEqual({
            primaryFormula: "10",
            defaultFormula: undefined,
        });

        expect(Utils.getFormula("=10=A1+1")).toEqual({
            primaryFormula: "A1+1",
            defaultFormula: "10",
        });
    });

    it("should return correct column index", () => {
        expect(Utils.columnTextToIndex("A")).toEqual(0);
        expect(Utils.columnTextToIndex("B")).toEqual(1);
        expect(Utils.columnTextToIndex("C")).toEqual(2);

        expect(Utils.columnTextToIndex("AA")).toEqual(26);
        expect(Utils.columnTextToIndex("BB")).toEqual(53);
        expect(Utils.columnTextToIndex("CC")).toEqual(80);
    });

    it("should return correct column text", () => {
        expect(Utils.columnIndexToText(0)).toEqual("A");
        expect(Utils.columnIndexToText(1)).toEqual("B");
        expect(Utils.columnIndexToText(2)).toEqual("C");

        expect(Utils.columnIndexToText(26)).toEqual("AA");
        expect(Utils.columnIndexToText(53)).toEqual("BB");
        expect(Utils.columnIndexToText(80)).toEqual("CC");
    });

    it("should return correct cell coords from cell ID", () => {
        expect(Utils.cellIdToCoords("A1")).toEqual({ ri: 0, ci: 0 });
        expect(Utils.cellIdToCoords("B2")).toEqual({ ri: 1, ci: 1 });
        expect(Utils.cellIdToCoords("C3")).toEqual({ ri: 2, ci: 2 });
    });

    it("should return correct cell ID from cell coords", () => {
        expect(Utils.cellCoordsToId({ ri: 0, ci: 0 })).toEqual("A1");
        expect(Utils.cellCoordsToId({ ri: 1, ci: 1 })).toEqual("B2");
        expect(Utils.cellCoordsToId({ ri: 2, ci: 2 })).toEqual("C3");
    });

    it("should return correct cell IDs from formula", () => {
        expect(Utils.getCellIdsFromFormula("= A1 + B2 * C3")).toEqual([
            "A1",
            "B2",
            "C3",
        ]);
        expect(Utils.getCellIdsFromFormula("= $A$1 + $B2 * C$3")).toEqual([
            "A1",
            "B2",
            "C3",
        ]);
    });
});
