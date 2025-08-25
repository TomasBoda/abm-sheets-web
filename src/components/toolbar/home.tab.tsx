import { Ban, Bold, Italic, RotateCcw, Underline } from "lucide-react";
import {
    TabContainer,
    ToolbarButton,
    ToolbarDivider,
} from "./toolbar.component";
import { ColorPicker } from "../color-picker/color-picker.component";
import { useSelection } from "@/hooks/useSelection";
import { useSpreadsheet } from "@/hooks/useSpreadsheet";

export const HomeTab = () => {
    const { selectedCells } = useSelection();
    const spreadsheet = useSpreadsheet();

    const setCellColor = (color: string) => {
        for (const cellId of selectedCells) {
            spreadsheet.cells.style.setCellStyle(
                cellId,
                "color",
                color === "" ? undefined : color,
            );
        }
    };

    const setCellBold = () => {
        for (const cellId of selectedCells) {
            spreadsheet.cells.style.setCellStyle(cellId, "bold", true);
        }
    };

    const setCellItalic = () => {
        for (const cellId of selectedCells) {
            spreadsheet.cells.style.setCellStyle(cellId, "italic", true);
        }
    };

    const setCellUnderline = () => {
        for (const cellId of selectedCells) {
            spreadsheet.cells.style.setCellStyle(cellId, "underline", true);
        }
    };

    const setCellNormal = () => {
        for (const cellId of selectedCells) {
            spreadsheet.cells.style.setCellStyle(cellId, "bold", undefined);
            spreadsheet.cells.style.setCellStyle(cellId, "italic", undefined);
            spreadsheet.cells.style.setCellStyle(
                cellId,
                "underline",
                undefined,
            );
        }
    };

    const clear = () => {
        for (const cellId of selectedCells) {
            spreadsheet.cells.style.setCellStyle(cellId, "color", "");
        }
    };

    return (
        <TabContainer>
            <ToolbarButton onClick={setCellBold}>
                <Bold size={10} />
                Bold
            </ToolbarButton>

            <ToolbarButton onClick={setCellItalic}>
                <Italic size={10} />
                Italics
            </ToolbarButton>

            <ToolbarButton onClick={setCellUnderline}>
                <Underline size={10} />
                Underline
            </ToolbarButton>

            <ToolbarButton onClick={setCellNormal}>
                <Ban size={10} />
                Normal
            </ToolbarButton>

            <ToolbarDivider />

            <ColorPicker onChange={(color) => setCellColor(color)} />

            <ToolbarDivider />

            <ToolbarButton onClick={clear}>
                <RotateCcw size={10} />
                Clear
            </ToolbarButton>
        </TabContainer>
    );
};
