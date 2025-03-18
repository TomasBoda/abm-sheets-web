import { CellId } from "@/components/spreadsheet/spreadsheet.component";
import { Utils } from "./utils";

class GraphNode {

    public cellId: CellId;
    public children: GraphNode[];

    constructor(cellId: CellId, children: GraphNode[]) {
        this.cellId = cellId;
        this.children = children;
    }

    public addChild(child: GraphNode): void {
        this.children.push(child);
    }
}

export interface CellItem {
    id: CellId;
    formula: string;
}

export interface CellDependencyItem {
    id: CellId;
    dependencies: CellId[];
}

const buildCellDependencies = (cells: CellItem[]): CellDependencyItem[] => {
    const dependencyItems: CellDependencyItem[] = [];
    
    cells.forEach(({ id, formula }: CellItem) => {
        const dependencies: CellId[] = [];
        const cellReferences = Utils.getCellFormulaDependencies(formula);

        for (const reference of cellReferences) {
            dependencies.push(Utils.cellCoordsToId(reference));
        }

        dependencyItems.push({ id, dependencies });
    });

    return dependencyItems;
}

const topologicalSort = (cells: CellDependencyItem[]): CellId[] => {
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
    return topologicalSort(dependencies);
}