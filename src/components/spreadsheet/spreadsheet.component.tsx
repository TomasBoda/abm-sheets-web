import { Evaluator } from "@/parser/evaluator";
import { AlignLeft, ChevronLeft, ChevronRight, Download, Grid2x2Plus, Play } from "lucide-react";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { Button } from "../button/button.component";
import { TextField } from "../text-field/text-field.component";
import { SpreadsheetUtil } from "./spreadsheet-util";
import { SpreadsheetCell, SpreadsheetData, SpreadsheetRow } from "./spreadsheet.model";
import { useSelection } from "./useSelection.hook";
import { useModal } from "@/hooks/useModal";
import { VariablesModal } from "@/modals/variables-modal";
import { Value } from "@/parser/runtime";

export type CellCoords = { ri: number; ci: number; }

export let data: SpreadsheetData = SpreadsheetUtil.createEmptySpreadsheet(30, 20);
export let variables: Map<string, Value> = new Map();

export type CellId = `cell-${number}-${number}`;

export const getCellId = ({ ri, ci }: CellCoords): CellId => {
    return `cell-${ri}-${ci}`;
}

export function Spreadsheet() {

    const { showModal } = useModal();

    const showVariableModal = () => {
        showModal(({ hideModal }) => (
            <VariablesModal hideModal={hideModal} />
        ))
    }

    const [step, setStep] = useState<number>(0);
    const [steps, setSteps] = useState<number>(100);

    // cells with non-empty value
    const [usedCells, setUsedCells] = useState<Set<CellId>>(new Set<CellId>());
    // cells copied in the clipboard
    const [copiedCells, setCopiedCells] = useState<Set<CellId>>(new Set<CellId>());
    // cells selected by selection
    const { selectedCells, selectAllCells, isCellSelected, selectionListeners, dragWithCopy } = useSelection();

    // history
    const [history, setHistory] = useState<Map<CellId, string[]>>(new Map());

    useEffect(() => {
        for (const [key, value] of history.entries()) {
            const cellId = key;
            const values = value;

            const { ri, ci } = getCellCoors(cellId);
            getCellSpan({ ri, ci }).innerText = values[step]
        }
    }, [step]);

    // select initial cell
    useEffect(() => {
        onCellClick({ ri: 0, ci: 0 });
    }, []);

    useEffect(() => {
        evaluateUsedCells();
    }, [usedCells]);

    useEffect(() => {
        if (selectedCells.size > 1) {
            setFormulaValue("");
        }
    }, [selectedCells]);

    function onMouseUp() {
        if (dragWithCopy) {
            const baseCellCoors = getCellCoors(Array.from(selectedCells)[0]);
            const newUsedCells: CellId[] = [];

            for (let i = 1; i < Array.from(selectedCells).length; i++) {
                const currentCellCoors = getCellCoors(Array.from(selectedCells)[i]);

                const rowOffset = currentCellCoors.ri - baseCellCoors.ri;
                const colOffset = currentCellCoors.ci - baseCellCoors.ci;

                const regex = /cell\((\d+),\s*(\d+)\)/g;

                let copiedCellFormula = data[baseCellCoors.ri][baseCellCoors.ci].formula;

                const newFormula = copiedCellFormula.replace(regex, (match, row, col) => {
                    const newRow = parseInt(row, 10) + rowOffset;
                    const newCol = parseInt(col, 10) + colOffset;
                    return `cell(${newRow},${newCol})`;
                });

                data[currentCellCoors.ri][currentCellCoors.ci].formula = newFormula;
                evaluateUsedCells([getCellId({ ri: currentCellCoors.ri, ci: currentCellCoors.ci })]);
                //evaluateCell({ ri: cellRow, ci: cellCol });
                newUsedCells.push(getCellId(currentCellCoors));
            }

            addUsedCells(newUsedCells);
        }
    }

    useEffect(() => {
        const handleDragOver = (event) => {
            event.preventDefault();
        };
    
        const handleDrop = (event) => {
            event.preventDefault();
          
            const files = event.dataTransfer.files;

            if (files.length > 0) {
                const file = files[0];
        
                if (file.type === "application/json") {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            // @ts-ignore
                            const jsonData = JSON.parse(e.target.result);
                            importAndLoad(jsonData);
                        } catch (error) {
                            console.error("Invalid JSON file:", error);
                        }
                    };

                    reader.readAsText(file);
                } else {
                    console.error("Only JSON files are allowed");
                }
            }
        };
    
        window.addEventListener("dragover", handleDragOver);
        window.addEventListener("drop", handleDrop);
    
        return () => {
            window.removeEventListener("dragover", handleDragOver);
            window.removeEventListener("drop", handleDrop);
        };
    }, []);

    function importAndLoad(importedData: any) {
        const newUsedCells: CellId[] = [];

        for (const [cellId, cellData] of Object.entries(importedData)) {
            const { formula, value } = cellData as any;
            const { ri, ci } = getCellCoors(cellId);

            data[ri][ci].formula = formula;
            data[ri][ci].value = value;

            if (formula[0] === "=") {
                newUsedCells.push(cellId as CellId);
                evaluateUsedCells([cellId as CellId]);
            } else {
                getCellSpan({ ri, ci }).innerText = formula;
            }
        }

        addUsedCells(newUsedCells);
    }

    function exportAndSave() {
        const download = (data: any) => {
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "export.json";
            document.body.appendChild(a); 
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        const object = {};

        for (let ri = 0; ri < data.length; ri++) {
            for (let ci = 0; ci < data[ri].length; ci++) {
                const formula = data[ri][ci].formula;
                const value = data[ri][ci].value;

                if (formula.trim() === "" && value.trim() === "") {
                    continue;
                }
                
                object[`cell-${ri}-${ci}`] = {
                    formula: data[ri][ci].formula,
                    value: data[ri][ci].value,
                }
            }
        }

        download(object);
    }

    // formula utilities

    function setFormulaFocus(): void {
        const input = document.getElementById("formula") as HTMLInputElement;
        input.focus();
    }

    function setFormulaValue(value: string): void {
        const input = document.getElementById("formula") as HTMLInputElement;
        input.value = value;
    }

    function onFormulaKeyDown(event: any): void {
        if (event.key === 'Enter') {
            event.preventDefault();
            onFormulaEnter();
            return;
        }
    }

    function onFormulaEnter(): void {
        const { ri, ci } = getFirstSelectedCell();

        if (data[ri][ci].formula.trim() !== "") {
            addUsedCell({ ri, ci });
        } else {
            removeUsedCell({ ri, ci });
        }

        setCellIndicatorText({ ri: 0, ci: 0 });
    }

    function onFormulaInput(value: string): void {
        const { ri, ci } = getFirstSelectedCell();
        data[ri][ci].formula = value;

        if (value.length === 0 || (value.length > 0 && value[0] !== "=")) {
            data[ri][ci].value = value;
            getCellSpan({ ri, ci }).innerText = value;
        } else {
            data[ri][ci].value = "";
            getCellSpan({ ri, ci }).innerText = "";
        }
    }

    // cell utilities

    function onCellKeyDown(event: any) {
        // backspace
        if (event.key === "Backspace") {
            event.preventDefault();
            onCellBackspace();
            return;
        }

        if (event.ctrlKey || event.metaKey) {
            // ctrl + c
            if (event.key === "c") {
                event.preventDefault();
                onCellCopy();
                return;
            }

            // ctrl + v
            if (event.key === "v") {
                event.preventDefault();
                onCellPaste();
                return;
            }

            // ctrl + a
            if (event.key === "a") {
                event.preventDefault();
                onCellSelectAll();
                return;
            }

            return;
        }

        setFormulaFocus();
    };

    function onCellBackspace(): void {
        for (const selectedCellId of Array.from(selectedCells)) {
            const { ri, ci } = getCellCoors(selectedCellId);

            data[ri][ci].formula = "";
            data[ri][ci].value = "";
            getCellSpan({ ri, ci }).innerText = "";
            removeUsedCell({ ri, ci });
        }

        setFormulaValue("");
    }

    function onCellCopy(): void {
        const newCopiedCells = new Set<CellId>();

        for (const selectedCell of Array.from(selectedCells)) {
            newCopiedCells.add(selectedCell);
        }

        setCopiedCells(newCopiedCells);
    }

    function onCellPaste(): void {
        const currentCellCoors = getCellCoors(Array.from(selectedCells)[0]);
        const copiedCellCoors = getCellCoors(Array.from(copiedCells)[0]);

        const rowOffset = currentCellCoors.ri - copiedCellCoors.ri;
        const colOffset = currentCellCoors.ci - copiedCellCoors.ci;

        const regex = /cell\((\d+),\s*(\d+)\)/g;

        const newUsedCells: CellId[] = [];

        for (const copiedCell of Array.from(copiedCells)) {
            const cellRow = getCellCoors(copiedCell).ri + rowOffset;
            const cellCol = getCellCoors(copiedCell).ci + colOffset;

            let copiedCellFormula = data[getCellCoors(copiedCell).ri][getCellCoors(copiedCell).ci].formula;

            const newFormula = copiedCellFormula.replace(regex, (match, row, col) => {
                const newRow = parseInt(row, 10) + rowOffset;
                const newCol = parseInt(col, 10) + colOffset;
                return `cell(${newRow},${newCol})`;
            });

            data[cellRow][cellCol].formula = newFormula;
            evaluateUsedCells([getCellId({ ri: cellRow, ci: cellCol })]);
            //evaluateCell({ ri: cellRow, ci: cellCol });
            newUsedCells.push(getCellId({ ri: cellRow, ci: cellCol }));
        }

        addUsedCells(newUsedCells);
    }

    function onCellSelectAll(): void {
        selectAllCells();
    }

    function onCellClick({ ri, ci }: CellCoords): void {
        const formula = data[ri][ci].formula;
        setFormulaValue(formula);

        setCellIndicatorText({ ri, ci });

        evaluateUsedCells();
    }

    function onCellDoubleClick({ ri, ci }: CellCoords): void {
        const formula = data[ri][ci].formula;
        setFormulaValue(formula);
        setFormulaFocus();

        setCellIndicatorText({ ri, ci });
    }

    // evaluation

    function run(): void {
        setStep(0);
        evaluateUsedCells();
    }
    
    function evaluateUsedCells(cells: CellId[] = Array.from(usedCells)): void {
        const usedCellsWithFormula = cells.filter(cellId => {
            const { ri, ci } = getCellCoors(cellId);
            return data[ri][ci].formula[0] === "=";
        });

        const history = new Evaluator().evaluateCells(usedCellsWithFormula, steps);

        for (const [key, value] of history.entries()) {
            const cellId = key;
            const values = value;

            const { ri, ci } = getCellCoors(cellId);
            getCellSpan({ ri, ci }).innerText = values[step];
        }

        setHistory(history);

        cells.filter(cellId => {
            const { ri, ci } = getCellCoors(cellId);
            return data[ri][ci].formula[0] !== "=";
        }).forEach(cellId => {
            const { ri, ci } = getCellCoors(cellId);
            getCellSpan({ ri, ci }).innerText = data[ri][ci].formula;
        });
    }

    // utilities

    function getCell({ ri, ci }: CellCoords): HTMLDivElement {
        return document.getElementById(getCellId({ ri, ci })) as HTMLDivElement;
    }

    function getCellSpan({ ri, ci }: CellCoords): HTMLSpanElement {
        return (getCell({ ri, ci }).children[0] as HTMLSpanElement);
    }

    function getFirstSelectedCell(): CellCoords {
        return getCellCoors(Array.from(selectedCells)[0]);
    }

    function getCellCoors(cellId: string): CellCoords {
        const ri = parseInt(cellId.split("-")[1]);
        const ci = parseInt(cellId.split("-")[2]);
        return { ri, ci };
    }

    function addUsedCell({ ri, ci }: CellCoords): void {
        const newUsedCells = new Set<CellId>(usedCells);
        newUsedCells.add(getCellId({ ri, ci }));
        setUsedCells(newUsedCells);
    }

    function addUsedCells(cellIds: CellId[]): void {
        const newUsedCells = new Set<CellId>(usedCells);

        for (const cellId of cellIds) {
            newUsedCells.add(cellId);
        }

        setUsedCells(newUsedCells);
    }

    function removeUsedCell({ ri, ci }: CellCoords): void {
        const newUsedCells = new Set<CellId>(usedCells);
        newUsedCells.delete(getCellId({ ri, ci }));
        setUsedCells(newUsedCells);
    }

    function setCellIndicatorText({ ri, ci }: CellCoords): void {
        const currentCell = document.getElementById("current-cell") as HTMLDivElement;
        currentCell.innerText = `(${ri},${ci})`;
    }

    function isRowSelected({ ri }): boolean {
        return Array.from(selectedCells).find(cellId => {
            const coords = getCellCoors(cellId);
            return coords.ri == ri;
        }) !== undefined;
    }

    function isColSelected({ ci }): boolean {
        return Array.from(selectedCells).find(cellId => {
            const coords = getCellCoors(cellId);
            return coords.ci == ci;
        }) !== undefined;
    }

    return (
        <Container>
            <Header>
                <Logo>
                    <Grid2x2Plus size={20} />
                    ABM Sheets
                </Logo>

                <TextField
                    id="formula"
                    onKeyDown={e => onFormulaKeyDown(e)}
                    onChange={value => onFormulaInput(value)}
                    placeholder="Enter formula"
                />

                <Stepper>
                    <Icon onClick={() => setStep(prev => Math.max(0, prev - 1))}>
                        <ChevronLeft size={16} color="var(--text-1)" />
                    </Icon>
                    
                    <TextField
                        value={step.toString()}
                        disabled={true}
                    />
                    <Icon onClick={() => setStep(prev => Math.min(prev + 1, steps))}>
                        <ChevronRight size={16} color="var(--text-1)" />
                    </Icon>
                </Stepper>

                <TextField
                    value={steps.toString()}
                    onChange={value => value === "" ? setSteps(0) : setSteps(parseInt(value))}
                    placeholder="Steps"
                />

                <Button onClick={() => run()}>
                    <Play size={12} />
                    Run
                </Button>

                <Button onClick={showVariableModal}>
                    <AlignLeft size={12} />
                    Variables
                </Button>

                <Button onClick={() => exportAndSave()}>
                    <Download size={12} />
                    Export
                </Button>
            </Header>

            <TableContainer>
                <TableWrapper>
                    <Table id="table">
                        <ColumnRow $entries={data[0].length + 1}>
                            <TopLeftCell id="current-cell" $selected={false} $special={true} />
                            
                            {data[0].map((cell: SpreadsheetCell, ci: number) =>
                                <ColCell $selected={isColSelected({ ci })} $special={true} key={ci}>
                                    {ci}
                                </ColCell>
                            )}
                        </ColumnRow>

                        <Wrapper onMouseUp={selectionListeners.handleMouseUp}>
                            {data.map((row: SpreadsheetRow, ri: number) =>
                                <Row $entries={row.length + 1} key={ri}>
                                    <RowCell $selected={isRowSelected({ ri })} $special={true}>
                                        {ri}
                                    </RowCell>

                                    {row.map((cell: SpreadsheetCell, ci: number) =>
                                        <Cell
                                            key={ci}
                                            id={getCellId({ ri, ci })}
                                            onClick={() => onCellClick({ ri, ci })}
                                            onDoubleClick={() => onCellDoubleClick({ ri, ci })}
                                            tabIndex={-1}
                                            onKeyDown={onCellKeyDown}
                                            onMouseDown={() => selectionListeners.handleMouseDown({ ri, ci })}
                                            onMouseEnter={() => selectionListeners.handleMouseMove({ ri, ci })}
                                            onMouseUp={() => onMouseUp()}
                                            $selected={isCellSelected({ ri, ci })}
                                        >
                                            <span>{""}</span>
                                            <CellDrag
                                                onMouseDown={e => { e.stopPropagation(); selectionListeners.handleMouseDown({ ri, ci }, true); }}
                                            />
                                        </Cell>
                                    )}
                                </Row>
                            )}
                        </Wrapper>
                    </Table>
                </TableWrapper>
            </TableContainer>
        </Container>
    )
}

const Container = styled.div`
    width: 100vw;
    height: 100vh;

    display: flex;
    flex-direction: column;
    gap: 20px;

    padding: 20px;
`;

const Header = styled.div`
    width: 100%;

    display: grid;
    grid-template-columns: auto 1fr 150px 100px auto auto auto;
    align-items: center;
    gap: 15px;
`;

const Logo = styled.div`
    color: var(--text-1);
    font-size: 18px;
    font-weight: 400;
    line-height: 100%;

    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;

    margin: 0px 20px;

    cursor: pointer;
`;

const Stepper = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 15px;
`;

const Icon = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    padding: 8px;

    border: 2px solid var(--bg-3);
    border-radius: 10px;
    background-color: var(--bg-1);

    cursor: pointer;
    transition: all 100ms;

    &:hover {
        background-color: var(--bg-2);
    }
`;

const TableContainer = styled.div`
    flex: 1;
    display: flex;

    border: 2px solid var(--bg-6);
    border-radius: 10px;

    overflow: hidden;

    & * {
        -webkit-user-select: none;      
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
`;

const TableWrapper = styled.div`
    width: 100%;
    height: 100%;
    overflow: auto;
    display: flex;
    flex-wrap: wrap;

    &::-webkit-scrollbar { width: 6px; height: 6px; }
    &::-webkit-scrollbar-corner { display: none; }
    &::-webkit-scrollbar-thumb { background-color: var(--bg-5); }
    &::-webkit-scrollbar-track { display: none; }
    &::-webkit-scrollbar-track-piece { display: none; }
`;

const Table = styled.div`
    &::-webkit-scrollbar-track {
        background-color: red !important;
    }
`;

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;

    padding-top: 0px;
`;

const Row = styled.div<{ $entries: number; }>`
    display: grid;
    grid-template-columns: repeat(${props => props.$entries}, auto);
`;

const CellDrag = styled.div`
    position: absolute;
    right: 0px;
    bottom: 0px;
    width: 15px;
    height: 10px;
    border-top-left-radius: 10px;

    background-color: var(--bg-3);
    border-left: 2px solid var(--bg-6);
    border-top: 2px solid var(--bg-6);

    cursor: grab;

    transition: all 150ms;
    opacity: 0;
`;

const Cell = styled.div<{ $selected: boolean; $special?: boolean; }>`
    width: 100px;
    height: 35px;

    position: relative;

    font-size: 12px;

    display: flex;
    flex-direction: column;
    align-items: flex-start;
    align-items: ${({ $special }) => $special && "center"};
    justify-content: center;

    color: var(--text-1);

    padding: 10px;

    outline: none;
    border: 1px solid var(--bg-6);

    cursor: pointer;
    transition: all 50ms;

    user-select: none;

    background-color: ${({ $special, $selected }) => $selected ? "var(--bg-3)" : ($special ? "var(--bg-0)" : "var(--bg-1)")};
    
    border: ${({ $special }) => $special && "1px solid transparent"};

    &:hover ${CellDrag} {
        opacity: 1;
    }
`;

const ColumnRow = styled(Row)`
    position: sticky;
    top: 0;

    z-index: 2;
`;

const ColCell = styled(Cell)`

`;

const RowCell = styled(Cell)`
    position: sticky;
    left: 0;

    z-index: 2;
`;

const TopLeftCell = styled(RowCell)`
    position: sticky;
    left: 0;
    top: 0;

    z-index: 10;
`;