import { SpreadsheetScreen } from "@/screens/spreadsheet.screen";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "ABM Sheets"
}

export default function SpreadsheetPage() {
 
    return (
        <SpreadsheetScreen />
    )
}