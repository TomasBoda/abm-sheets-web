import { data } from "@/components/spreadsheet/data";
import { CellId, History } from "@/components/spreadsheet/spreadsheet.model";
import { Utils } from "@/utils/utils";
import { Parser } from "./parser";
import { Runtime } from "./runtime";

export class Evaluator {

    private evaluateCell(cellId: CellId, step: number, history: History, dataHistory: History): string | undefined {
        const { ri, ci } = Utils.cellIdToCoords(cellId);
        const cell = data[ri][ci];

        const formulaWithoutFixes = cell.formula.replaceAll("$", "");
        
        const { defaultFormula, primaryFormula } = Utils.getFormula(formulaWithoutFixes);
    
        if (!defaultFormula && !primaryFormula) {
            return undefined;
        }

        const formula = step === 0 ? (defaultFormula ?? primaryFormula) : primaryFormula;

        return this.evaluateFormula(formula, step, history, dataHistory);
    }

    private evaluateFormula(formula: string, step: number, history: History, dataHistory: History): string {
        try {
            const expression = new Parser().parse(formula);
            const result = new Runtime().run(expression, step, history, dataHistory);
            return result;
        } catch (e) {
            return "ERROR " + e;
        }
    }

    public evaluateCells(cells: CellId[], steps: number, dataHistory: History) {
        const history: History = new Map();

        for (let step = 0; step < steps; step++) {
            for (const cellId of cells) {
                const result = this.evaluateCell(cellId, step, history, dataHistory);

                if (!result) {
                    continue;
                }

                history.set(cellId, [...(history.get(cellId) ?? []), result]);
            }
        }

        return history;
    }
}