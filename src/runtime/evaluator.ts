import { Spreadsheet } from "@/components/spreadsheet/spreadsheet.constants";
import { CellId, History } from "@/components/spreadsheet/spreadsheet.model";
import { SpreadsheetUtils } from "@/components/spreadsheet/spreadsheet.utils";
import { Parser } from "./parser";
import { Runtime, Value, ValueType } from "./runtime";

export class Evaluator {
    // evaluates one specific cell
    private evaluateCell(
        cellId: CellId,
        history: History,
        step: number,
        steps: number,
    ): Value | undefined {
        const cell = Spreadsheet.get(cellId);

        const formulaWithoutFixes = cell.formula.replaceAll("$", "");

        const { defaultFormula, primaryFormula } =
            SpreadsheetUtils.getFormula(formulaWithoutFixes);

        if (!defaultFormula && !primaryFormula) {
            return undefined;
        }

        // if step is 0, attempt to use the default formula, otherwise use the primary formula
        const formula =
            step === 0 ? (defaultFormula ?? primaryFormula) : primaryFormula;

        return this.evaluateFormula(formula, history, step, steps);
    }

    // evaluates one specific cell formula
    private evaluateFormula(
        formula: string,
        history: History,
        step: number,
        steps: number,
    ): Value {
        try {
            const expression = new Parser().parse(formula);
            const result = new Runtime().run(expression, history, step, steps);
            return result;
        } catch (e) {
            // return an error object if the formula is invalid (to display the error in the grid)
            return { type: ValueType.Error, value: e.toString() };
        }
    }

    /**
     * Evaluates the cells in the spreadsheet and returns the history object
     *
     * @param cells - cell ids
     * @param steps - number of steps
     * @returns history object
     */
    public evaluateCells(cells: CellId[], steps: number) {
        const history: History = new Map();

        // loop through all steps
        for (let step = 0; step < steps; step++) {
            // in each step, evaluate all spreadsheet cells
            for (const cellId of cells) {
                const result = this.evaluateCell(cellId, history, step, steps);

                if (!result) {
                    continue;
                }

                const current = history.get(cellId)
                    ? [...history.get(cellId)]
                    : [];
                current.push(result);

                history.set(cellId, current);
            }
        }

        return history;
    }
}
