import { ColorPicker } from "@/components/color-picker/color-picker.component";
import { data } from "@/components/spreadsheet/data";
import { Spreadsheet } from "@/components/spreadsheet/spreadsheet.component";
import { CellId } from "@/components/spreadsheet/spreadsheet.model";
import { Tab, Tabs } from "@/components/tabs/tabs.component";
import { TextFieldSmall } from "@/components/text-field-small";
import { useCellInfo } from "@/hooks/useCells";
import { useCellStyle } from "@/hooks/useCellStyle";
import { useHistory } from "@/hooks/useHistory";
import { useModal } from "@/hooks/useModal";
import { useSelection } from "@/hooks/useSelection.hook";
import { useStepper } from "@/hooks/useStepper";
import { GraphModal } from "@/modals/graph-modal";
import { Utils } from "@/utils/utils";
import { AlignJustify, AlignLeft, AlignRight, Ban, Bold, ChartLine, ChevronLeft, ChevronRight, Download, Grid2x2Plus, Italic, RotateCcw, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";

export function IndexScreen() {
    
    const tabs: Tab[] = [
        {
            label: "Home",
            component: <HomeTab />
        },
        {
            label: "Simulation",
            component: <SimulationTab />
        },
        {
            label: "Import & Export",
            component: <ExportTab />
        },
        {
            label: "Advanced",
            component: <AdvancedTab />
        }
    ]

    return (
        <Page>
            <TabsContainer>
                <Tabs
                    tabs={tabs}
                    logo={(
                        <Logo>
                            <Grid2x2Plus size={20} color="var(--color-2)" style={{ transform: "translateY(-1px)" }} />
                            ABM Sheets
                        </Logo>
                    )}
                    rightContent={
                        <GithubLogoHref href="https://github.com/tomasBoda/abm-sheets-web" target="_blank">
                            <GithubLogo src="/logo-github.svg" />
                        </GithubLogoHref>
                    }
                />
            </TabsContainer>
            
            <Spreadsheet />
        </Page>
    )
}

const HomeTab = () => {

    const { selectedCells } = useSelection();
    const {
        cellColors, setCellColors,
        cellBolds, setCellBolds,
        cellItalics, setCellItalics,
    } = useCellStyle();

    const setCellColor = (color: string) => {
        const newCellColors = new Map(cellColors);

        for (const cellId of Array.from(selectedCells)) {
            if (color === "") {
                newCellColors.delete(cellId);
            } else {
                newCellColors.set(cellId, color);
            }
        }

        setCellColors(newCellColors);
    }

    const setCellBold = () => {
        const newCellBolds = new Map(cellBolds);

        for (const cellId of Array.from(selectedCells)) {
            newCellBolds.set(cellId, "bold");
        }

        setCellBolds(newCellBolds);
    }

    const setCellItalic = () => {
        const newCellItalics = new Map(cellItalics);

        for (const cellId of Array.from(selectedCells)) {
            newCellItalics.set(cellId, "italic");
        }

        setCellItalics(newCellItalics);
    }

    const setCellNormal = () => {
        const newCellBolds = new Map(cellBolds);
        const newCellItalics = new Map(cellItalics);

        for (const cellId of Array.from(selectedCells)) {
            newCellBolds.delete(cellId);
            newCellItalics.delete(cellId);
        }

        setCellBolds(newCellBolds);
        setCellItalics(newCellItalics);
    }

    const clear = () => {
        const newCellColors = new Map(cellColors);
        for (const cellId of Array.from(selectedCells)) {
            newCellColors.delete(cellId);
        }
        setCellColors(newCellColors);

        const newCellBolds = new Map(cellBolds);
        for (const cellId of Array.from(selectedCells)) {
            newCellBolds.delete(cellId);
        }
        setCellBolds(newCellBolds);

        const newCellItalics = new Map(cellItalics);
        for (const cellId of Array.from(selectedCells)) {
            newCellItalics.delete(cellId);
        }
        setCellItalics(newCellItalics);
    }

    return (
        <TabContainer>
            <Button onClick={setCellBold}>
                <Bold size={10} />
                Bold
            </Button>

            <Button onClick={setCellItalic}>
                <Italic size={10} />
                Italics
            </Button>

            <Button onClick={setCellNormal}>
                <Ban size={10} />
                Normal
            </Button>

            <Divider />

            <Button>
                <AlignLeft size={10} />
                Left
            </Button>

            <Button>
                <AlignJustify size={10} />
                Center
            </Button>

            <Button>
                <AlignRight size={10} />
                Right
            </Button>

            <Divider />

            <ColorPicker onChange={color => setCellColor(color)} />

            <Divider />

            <Button onClick={clear}>
                <RotateCcw size={10} />
                Clear
            </Button>
        </TabContainer>
    )
}

const SimulationTab = () => {

    const { step, setStep, steps, setSteps, reset } = useStepper();
    const { selectedCells } = useSelection();
    const { history, dataHistory } = useHistory();
    const { showModal } = useModal();

    const prevStep = () => {
        setStep(prev => Math.max(0, prev - 1));
    }

    const nextStep = () => {
        setStep(prev => Math.min(prev + 1, steps - 1));
    }

    const openGraphModal = () => {
        const cellId: CellId = Array.from(selectedCells)[0];
        const historyData = history.get(cellId);
        const dataHistoryData = dataHistory.get(cellId);

        if (historyData) {
            const data = historyData;

            const values = data
                ? data
                    .filter(value => !isNaN(parseFloat(value)))
                    .map(value => parseFloat(value))
                : [];

            return showModal(({ hideModal }) => (
                <GraphModal hideModal={hideModal} values={values} />
            ));
        }

        if (dataHistoryData) {
            const data = dataHistoryData;

            const values = data
                ? data
                    .filter(value => !isNaN(parseFloat(value)))
                    .map(value => parseFloat(value))
                : [];

            return showModal(({ hideModal }) => (
                <GraphModal hideModal={hideModal} values={values} />
            ));
        }
    }

    return (
        <TabContainer>
            <Stepper>
                <Button onClick={prevStep}>
                    <ChevronLeft size={12} />
                </Button>

                <TextFieldSmall
                    value={(step + 1).toString()}
                    disabled={true}
                />

                <Button onClick={nextStep}>
                    <ChevronRight size={12} />
                </Button>
            </Stepper>

            <Divider />

            <TextFieldSmall
                value={steps.toString()}
                onChange={value => value === "" ? setSteps(0) : setSteps(parseInt(value))}
                placeholder="Steps"
            />

            <Divider />

            <Button onClick={reset}>
                <RotateCcw size={10} />
                Reset
            </Button>

            <Divider />

            <Button onClick={openGraphModal}>
                <ChartLine size={10} />
                Graph
            </Button>
        </TabContainer>
    )
}

const ExportTab = () => {

    const { setCellColors } = useCellStyle();
    const { usedCells, setUsedCells } = useCellInfo();
    const { dataHistory, setDataHistory } = useHistory();

    const [filename, setFilename] = useState<string>("");

    const exportAndSave = () => {
        const object = {};

        for (let ri = 0; ri < data.length; ri++) {
            for (let ci = 0; ci < data[ri].length; ci++) {
                const cellId = Utils.cellCoordsToId({ ri, ci });
                const { formula, value, color } = data[ri][ci];

                if (formula.trim() === "" && value.trim() === "") {
                    continue;
                }
                
                object[cellId] = { formula, value, color, history };
            }
        }

        for (const [cellId, values] of dataHistory.entries()) {
            const { ri, ci } = Utils.cellIdToCoords(cellId);

            object[cellId] = {
                formula: "",
                value: "",
                color: data[ri][ci].color,
                ...object[cellId],
                dataHistory: values,
            };
        }

        Utils.download(object, filename);
        setFilename("");
    }

    const onFileInputClick = () => {
        document.getElementById("fileInput").click();
    }

    const addUsedCells = (cellIds: CellId[]) => {
        const newUsedCells = new Set<CellId>(usedCells);

        for (const cellId of cellIds) {
            newUsedCells.add(cellId);
        }

        setUsedCells(newUsedCells);
    }

    const importAndLoad = (importedData: any) => {
        const newUsedCells: CellId[] = [];
        const newCellColors = new Map<CellId, string>();
        const newDataHistory = new Map(dataHistory);

        for (const [cellId, cellData] of Object.entries(importedData)) {
            const { formula, value, color } = cellData as any;
            const { ri, ci } = Utils.cellIdToCoords(cellId as CellId);

            data[ri][ci].formula = formula;
            data[ri][ci].value = value;
            data[ri][ci].color = color;

            if (color) {
                newCellColors.set(cellId as CellId, color);
            }

            if (formula[0] === "=") {
                newUsedCells.push(cellId as CellId);
            } else {
                Utils.getCellSpan({ ri, ci }).innerText = formula;
            }

            if ((cellData as any).dataHistory) {
                newDataHistory.set(cellId as CellId, (cellData as any).dataHistory);
            }
        }

        addUsedCells(newUsedCells);
        setCellColors(newCellColors);
        setDataHistory(newDataHistory);
    }

    useEffect(() => {
        const fileInput = document.getElementById("fileInput") as HTMLInputElement;

        fileInput.addEventListener("change", () => {
            const file = fileInput.files[0];

            if (!file) {
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                const jsonContent = JSON.parse(e.target.result as string);
                importAndLoad(jsonContent);
            };
            reader.readAsText(file);
        });
    }, []);

    return (
        <TabContainer>
            <Button onClick={onFileInputClick}>
                <Upload size={10} />
                Import
            </Button>

            <input type="file" id="fileInput" name="input-file" accept=".json" style={{ display: "none" }} />

            <Divider />

            <TextFieldSmall
                value={filename}
                onChange={setFilename}
                placeholder="Enter filename"
            />

            <Button onClick={exportAndSave}>
                <Download size={10} />
                Export
            </Button>
        </TabContainer>
    )
}

const AdvancedTab = () => {

    const { selectedCells } = useSelection();
    const { dataHistory, setDataHistory } = useHistory();

    const [column, setColumn] = useState<string>("");

    const selectedCell = useMemo(() => Array.from(selectedCells)[0], [selectedCells]);

    const onFileInputClick = () => {
        document.getElementById("fileInput").click();
    }

    const importAndLoad = (content: string) => {
        const header = content.split("\n")[0];
        const columns = header.split(",");

        const index = columns.findIndex(value => value === column);

        const rows = content.split("\n").slice(1);
        const data: string[] = [];

        for (const row of rows) {
            const values = row.split(",");
            data.push(values[index]);
        }

        const newHistory = new Map<CellId, string[]>(dataHistory);
        newHistory.set(selectedCell, data);
        setDataHistory(newHistory);
    }

    const onFileInput = useCallback(() => {
        const fileInput = document.getElementById("fileInput") as HTMLInputElement;
        const file = fileInput.files[0];

        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const csvContent = e.target.result as string;
            importAndLoad(csvContent);
            fileInput.value = "";
        };
        reader.readAsText(file);
    }, [column]);

    useEffect(() => {
        const fileInput = document.getElementById("fileInput") as HTMLInputElement;

        fileInput.addEventListener("change", onFileInput);

        return () => {
            fileInput.removeEventListener("change", onFileInput);
        }
    }, [column]);

    return (
        <TabContainer>
            <TextFieldSmall
                value={column}
                onChange={setColumn}
                placeholder="Enter column name"
            />

            <Button onClick={onFileInputClick}>
                Add data to {selectedCell}
            </Button>

            <input type="file" id="fileInput" name="input-file" accept=".csv" style={{ display: "none" }} />
        </TabContainer>
    )
}

const Page = styled.div`
    width: 100vw;
    height: 100vh;

    background-color: var(--bg-0);
`;

const TabsContainer = styled.div`
    background-color: rgb(28, 39, 35);
`;

const TabContainer = styled.div`
    width: 100%;

    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;

    padding: 6px;
`;

const Divider = styled.div`
    width: 2px;
    height: 20px;
    border-radius: 100px;
    background-color: var(--color-1);
`;

const Button = styled.div`
    color: white;
    font-size: 11px;
    font-weight: 400;

    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 5px;

    cursor: pointer;

    padding: 5px 12px;
    border-radius: 5px;

    border: 1px solid var(--color-2);

    background-color: var(--color-1);

    transition: all 100ms;

    &:hover {
        background-color: var(--color-2);
    }
`;

const Stepper = styled.div`
    display: grid;
    grid-template-columns: auto 60px auto;
    gap: 10px;
`;

const Logo = styled.div`
    font-size: 16px;
    font-weight: 500;
    line-height: 100%;

    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;

    cursor: pointer;
`;

const GithubLogoHref = styled.a`

`;

const GithubLogo = styled.img`
    width: 22px;
    color: white;
`;