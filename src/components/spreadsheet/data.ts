import { Utils } from "@/utils/utils";
import { SpreadsheetData } from "./spreadsheet.model";

const ROW_COUNT = 35;
const COL_COUNT = 35;

export const data: SpreadsheetData = Utils.createEmptySpreadsheet(
    COL_COUNT,
    ROW_COUNT,
);
