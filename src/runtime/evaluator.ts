import { SPREADSHEET_DATA } from "@/components/spreadsheet/spreadsheet.constants";
import { CellId, History } from "@/components/spreadsheet/spreadsheet.model";
import { SpreadsheetUtils } from "@/components/spreadsheet/spreadsheet.utils";
import { Parser } from "./parser";
import { Runtime, Value, ValueType } from "./runtime";

export class Evaluator {
    private evaluateCell(
        cellId: CellId,
        step: number,
        history: History,
    ): Value | undefined {
        const { ri, ci } = SpreadsheetUtils.cellIdToCoords(cellId);
        const cell = SPREADSHEET_DATA[ri][ci];

        const formulaWithoutFixes = cell.formula.replaceAll("$", "");

        const { defaultFormula, primaryFormula } =
            SpreadsheetUtils.getFormula(formulaWithoutFixes);

        if (!defaultFormula && !primaryFormula) {
            return undefined;
        }

        const formula =
            step === 0 ? (defaultFormula ?? primaryFormula) : primaryFormula;

        return this.evaluateFormula(formula, step, history);
    }

    private evaluateFormula(
        formula: string,
        step: number,
        history: History,
    ): Value {
        try {
            const expression = new Parser().parse(formula);
            const result = new Runtime().run(expression, step, history);
            return result;
        } catch (e) {
            return { type: ValueType.Error, value: e.toString() };
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
