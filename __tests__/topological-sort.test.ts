import { CellId } from "@/components/spreadsheet/spreadsheet.model";
import { CellDependencyItem, topologicalSort } from "@/utils/topological-sort";
import "@testing-library/jest-dom";

type Parameter = {
    dependencies: CellDependencyItem[];
    result?: CellId[];
};

const CORRECT_DEPENDENCIES: Parameter[] = [
    {
        dependencies: [
            { id: "A1", dependencies: ["B1"] },
            { id: "B1", dependencies: ["C1"] },
            { id: "C1", dependencies: ["D1"] },
        ],
        result: ["D1", "C1", "B1", "A1"],
    },
];

const CYCLIC_DEPENDENCIES: Parameter[] = [
    {
        dependencies: [{ id: "A1", dependencies: ["A1"] }],
    },
    {
        dependencies: [
            { id: "A1", dependencies: ["B1"] },
            { id: "B1", dependencies: ["C1"] },
            { id: "C1", dependencies: ["D1"] },
            { id: "D1", dependencies: ["A1"] },
        ],
    },
];

describe("Topological Sort", () => {
    it.each(CYCLIC_DEPENDENCIES)(
        "should throw error on cycle detected",
        ({ dependencies, result }) => {
            expect(() => topologicalSort(dependencies)).toThrow();
        },
    );

    it.each(CORRECT_DEPENDENCIES)(
        "should sort correct dependencies",
        ({ dependencies, result }) => {
            const sortedCellIds = topologicalSort(dependencies);

            const map = new Map<CellId, number>();

            sortedCellIds.forEach((cellId, index) => {
                map.set(cellId, index);
            });
            // testing

            expect(sortedCellIds).toHaveLength(result.length);

            sortedCellIds.forEach((cellId, index) => {
                expect(cellId).toEqual(result[index]);
            });

            dependencies.forEach((item) => {
                expect(map.get(item.id)).toBeDefined();

                item.dependencies.forEach((dependency) => {
                    expect(map.get(dependency)).toBeLessThan(map.get(item.id));
                });
            });
        },
    );
});
