import { SpreadsheetScreen } from "@/screens/spreadsheet.screen";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Spreadsheet"
}

export default function SpreadsheetPage() {
 
    return (
        <SpreadsheetScreen />
    )
}