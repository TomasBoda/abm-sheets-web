import { CellCoords, CellId } from "@/components/spreadsheet/spreadsheet.model";
import { Utils } from "./utils";

export interface CellItem {
    id: CellId;
    formula: string;
}

export interface CellDependencyItem {
    id: CellId;
    dependencies: CellId[];
}

const getNormalDependencies = (formula: string): CellId[] => {
    const regex = /\$?([A-Z]+)\$?([0-9]+)/g;
    const matches = [...formula.matchAll(regex)].map(match => {
        return {
            ri: parseInt(match[2]) - 1,
            ci: Utils.columnTextToIndex(match[1]),
        };
    });
    return matches.map(match => Utils.cellCoordsToId(match));
}

export const getRangeDependencies = (formula: string): CellId[] => {
    const rangeRegex = /([A-Z]+)(\d+):([A-Z]+)(\d+)/g;
    let matches: any;
    let cells: CellId[] = [];

    while ((matches = rangeRegex.exec(formula)) !== null) {
        let [, startCol, startRow, endCol, endRow] = matches;
        let startRowNum = parseInt(startRow, 10);
        let endRowNum = parseInt(endRow, 10);

        if (startCol === endCol && startRowNum <= endRowNum) {
            for (let i = startRowNum; i <= endRowNum; i++) {
                cells.push(`${startCol}${i}`);
            }
        }
    }

    return cells;
}

const getCellFormulaDependencies = (formula: string): CellCoords[] => {
    const normalDependencies = getNormalDependencies(formula);
    const rangeDependencies = getRangeDependencies(formula);

    const dependencySet = new Set<CellId>([...normalDependencies, ...rangeDependencies]);
    const dependencies = Array.from(dependencySet);

    return dependencies.map(dependency => Utils.cellIdToCoords(dependency));
}

const getPrunedFormula = (formula: string): string => {
    const parts = formula.split("=");
    return parts[1];
}

const buildCellDependencies = (cells: CellItem[]): CellDependencyItem[] => {
    const dependencyItems: CellDependencyItem[] = [];
    
    cells.forEach(({ id, formula }: CellItem) => {
        const dependencies: CellId[] = [];
        const prunedFormula = getPrunedFormula(formula);
        const cellReferences = getCellFormulaDependencies(prunedFormula);

        for (const reference of cellReferences) {
            dependencies.push(Utils.cellCoordsToId(reference));
        }

        dependencyItems.push({ id, dependencies });
    });

    return dependencyItems;
}

export const topologicalSort = (cells: CellDependencyItem[]): CellId[] => {
    const sorted: CellId[] = [];
    const visited = new Map<CellId, boolean>();
    const visiting = new Map<CellId, boolean>();

    const visit = (id: CellId, itemsMap: Map<CellId, CellDependencyItem>) => {
        if (visited.get(id)) return;
        if (visiting.get(id)) throw new Error(`Cyclic dependency detected at: ${id}`);

        visiting.set(id, true);
        const currentItem = itemsMap.get(id);

        if (currentItem) {
            for (const dependency of currentItem.dependencies) {
                visit(dependency, itemsMap);
            }
        }

        visiting.set(id, false);
        visited.set(id, true);
        sorted.push(id);
    };

    const itemsMap = new Map(cells.map(item => [item.id, item]));

    for (const item of cells) {
        if (!visited.get(item.id)) {
            visit(item.id, itemsMap);
        }
    }

    return sorted;
}

export const getSortedCells = (cells: CellItem[]) => {
    const dependencies = buildCellDependencies(cells);
    const sortedCells = topologicalSort(dependencies);
    return sortedCells;
}