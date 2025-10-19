import { CellCoords, CellId } from "@/components/spreadsheet/spreadsheet.model";
import { SpreadsheetUtils } from "@/components/spreadsheet/spreadsheet.utils";

interface CellItem {
    id: CellId;
    formula: string;
}

interface CellDependencyItem {
    id: CellId;
    dependencies: CellId[];
}

const getNormalDependencies = (formula: string): CellId[] => {
    const regex = /\$?([A-Z]+)\$?([0-9]+)/g;
    const matches = [...formula.matchAll(regex)].map((match) => {
        return {
            ri: parseInt(match[2]) - 1,
            ci: SpreadsheetUtils.columnTextToIndex(match[1]),
        };
    });
    return matches.map((match) => SpreadsheetUtils.cellCoordsToId(match));
};

const getRangeDependencies = (formula: string): CellId[] => {
    const rangeRegex = /\$?([A-Z]+)\$?(\d+):\$?([A-Z]+)\$?(\d+)/g;
    let matches: RegExpExecArray | null;
    const cells: CellId[] = [];

    while ((matches = rangeRegex.exec(formula)) !== null) {
        const [, startCol, startRow, endCol, endRow] = matches;
        const startRowNum = parseInt(startRow, 10);
        const endRowNum = parseInt(endRow, 10);
        const startColNum = SpreadsheetUtils.columnTextToIndex(startCol);
        const endColNum = SpreadsheetUtils.columnTextToIndex(endCol);

        for (
            let ri = Math.min(startRowNum, endRowNum);
            ri <= Math.max(startRowNum, endRowNum);
            ri++
        ) {
            for (
                let ci = Math.min(startColNum, endColNum);
                ci <= Math.max(startColNum, endColNum);
                ci++
            ) {
                cells.push(SpreadsheetUtils.cellCoordsToId({ ri: ri - 1, ci }));
            }
        }
    }

    return cells;
};

const getCellFormulaDependencies = (formula: string): CellCoords[] => {
    const normalDependencies = getNormalDependencies(formula);
    const rangeDependencies = getRangeDependencies(formula);

    const dependencySet = new Set<CellId>([
        ...normalDependencies,
        ...rangeDependencies,
    ]);
    const dependencies = Array.from(dependencySet);

    return dependencies.map((dependency) =>
        SpreadsheetUtils.cellIdToCoords(dependency),
    );
};

const getPrunedFormula = (formula: string): string => {
    const parts = formula.split(/(?<![<>=])=(?![=])/);
    return parts[1];
};

const buildCellDependencies = (cells: CellItem[]): CellDependencyItem[] => {
    const dependencyItems: CellDependencyItem[] = [];

    cells.forEach(({ id, formula }: CellItem) => {
        const dependencies: CellId[] = [];
        const prunedFormula = getPrunedFormula(formula);
        const cellReferences = getCellFormulaDependencies(prunedFormula);

        for (const reference of cellReferences) {
            dependencies.push(SpreadsheetUtils.cellCoordsToId(reference));
        }

        dependencyItems.push({ id, dependencies });
    });

    return dependencyItems;
};

const topologicalSort = (
    cells: CellDependencyItem[],
): { error: false; cells: CellId[] } | { error: true; cells: CellId[] } => {
    const sorted: CellId[] = [];
    const visited = new Map<CellId, boolean>();
    const visiting = new Map<CellId, boolean>();
    const cyclePath: CellId[] = [];

    const visit = (
        id: CellId,
        itemsMap: Map<CellId, CellDependencyItem>,
    ): boolean => {
        if (visited.get(id)) return true;
        if (visiting.get(id)) {
            const cycleStart = cyclePath.indexOf(id);

            if (cycleStart !== -1) {
                return false;
            }
            return false;
        }

        visiting.set(id, true);
        cyclePath.push(id);
        const currentItem = itemsMap.get(id);

        if (currentItem) {
            for (const dependency of currentItem.dependencies) {
                if (!visit(dependency, itemsMap)) {
                    return false;
                }
            }
        }

        visiting.set(id, false);
        cyclePath.pop();
        visited.set(id, true);
        sorted.push(id);
        return true;
    };

    const itemsMap = new Map(cells.map((item) => [item.id, item]));

    for (const item of cells) {
        if (!visited.get(item.id)) {
            if (!visit(item.id, itemsMap)) {
                return { error: true, cells: [...cyclePath] };
            }
        }
    }

    return { error: false, cells: sorted };
};

export const getSortedCells = (cells: CellItem[]) => {
    const dependencies = buildCellDependencies(cells);
    return topologicalSort(dependencies);
};
