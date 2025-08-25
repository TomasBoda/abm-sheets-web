import { useSpreadsheet } from "@/hooks/useSpreadsheet";
import { Utils } from "@/utils/utils";
import { useEffect, useState } from "react";
import {
    TabContainer,
    ToolbarButton,
    ToolbarDivider,
} from "./toolbar.component";
import { Download, Upload } from "lucide-react";
import { TextFieldSmall } from "../text-field-small";

export const ImportExportTab = () => {
    const spreadsheet = useSpreadsheet();

    const [filename, setFilename] = useState<string>("");

    const exportAndSave = () => {
        const data = spreadsheet.file.getExportedData();
        Utils.download(data, filename);
        setFilename("");
    };

    const importAndLoad = (importedData: any) => {
        spreadsheet.file.loadImportedData(importedData);
    };

    const onFileInputClick = () => {
        document.getElementById("fileInput").click();
    };

    useEffect(() => {
        const fileInput = document.getElementById(
            "fileInput",
        ) as HTMLInputElement;

        fileInput.addEventListener("change", () => {
            const file = fileInput.files[0];

            if (!file) {
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                const jsonContent = JSON.parse(e.target.result as string);
                importAndLoad(jsonContent);
            };
            reader.readAsText(file);
        });
    }, []);

    return (
        <TabContainer>
            <ToolbarButton onClick={onFileInputClick}>
                <Upload size={10} />
                Import
            </ToolbarButton>

            <input
                type="file"
                id="fileInput"
                name="input-file"
                accept=".json"
                style={{ display: "none" }}
            />

            <ToolbarDivider />

            <TextFieldSmall
                value={filename}
                onChange={setFilename}
                placeholder="Enter filename"
            />

            <ToolbarButton onClick={exportAndSave}>
                <Download size={10} />
                Export
            </ToolbarButton>
        </TabContainer>
    );
};
