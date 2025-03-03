import { CellCoords, CellId, data } from "@/components/spreadsheet/spreadsheet.component";
import { Parser } from "./parser";
import { Runtime } from "./runtime";

export class Evaluator {

    public evaluateCells(cells: CellId[], steps: number) {
        const history = new Map<CellId, string[]>();

        for (const cellId of cells) {
            const { ri, ci } = this.getCellCoors(cellId);
            const cell = data[ri][ci];

            const cellParts = cell.formula.split("=");

            let defaultFormula: string | undefined = undefined;
            let primaryFormula: string | undefined = undefined;

            if (cellParts.length === 3) {
                defaultFormula = cellParts[1];
                primaryFormula = cellParts[2];
            } else if (cellParts.length === 2) {
                primaryFormula = cellParts[1];
            } else {
                throw new Error("evaluateCells() error code 1");
            }

            let result = undefined;

            if (defaultFormula !== undefined) {
                result = new Runtime().runWithHistory(new Parser().parse(defaultFormula), 0, history);
            } else if (primaryFormula !== undefined) {
                result = new Runtime().runWithHistory(new Parser().parse(primaryFormula), 0, history);
            } else {
                throw new Error("evaluateCells() error code 2");
            }

            history.set(cellId, [result]);
        }

        for (let step = 0; step < steps; step++) {
            for (const cellId of cells) {
                const { ri, ci } = this.getCellCoors(cellId);
                const cell = data[ri][ci];

                const formula = cell.formula.split("=")[cell.formula.split("=").length - 1];
                const result = new Runtime().runWithHistory(new Parser().parse(formula), step, history);

                const historyArray = history.get(cellId)!;
                history.set(cellId, [...historyArray, result]);
            }
        }

        return history;
    }

    private getCellCoors(cellId: string): CellCoords {
        const ri = parseInt(cellId.split("-")[1]);
        const ci = parseInt(cellId.split("-")[2]);
        return { ri, ci };
    }
}