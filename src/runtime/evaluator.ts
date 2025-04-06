import { data } from "@/components/spreadsheet/spreadsheet.component";
import { CellId, History } from "@/components/spreadsheet/spreadsheet.model";
import { Utils } from "@/utils/utils";
import { Expression, Parser } from "./parser";
import { Runtime } from "./runtime";

export class Evaluator {

    private evaluateCell(cellId: CellId, step: number, history: History): string | undefined {
        const { ri, ci } = Utils.cellIdToCoords(cellId);
        const cell = data[ri][ci];

        const { defaultFormula, primaryFormula } = Utils.getFormula(cell.formula);
    
        if (!defaultFormula && !primaryFormula) {
            return undefined;
        }

        const formula = step === 0 ? (defaultFormula ?? primaryFormula) : primaryFormula;

        return this.evaluateFormula(formula, step, history);
    }

    private evaluateFormula(formula: string, step: number, history: History): string {
        try {
            const expression = new Parser().parse(formula);
            const result = new Runtime().run(expression, step, history);
            return result;
        } catch (e) {
            console.log(e);
            return "ERROR";
        }
    }

    public evaluateCells(cells: CellId[], steps: number) {
        const history: History = new Map();

        for (let step = 0; step < steps; step++) {
            for (const cellId of cells) {
                const result = this.evaluateCell(cellId, step, history);

                if (!result) {
                    continue;
                }

                history.set(cellId, [...(history.get(cellId) ?? []), result]);
            }
        }

        return history;
    }
}