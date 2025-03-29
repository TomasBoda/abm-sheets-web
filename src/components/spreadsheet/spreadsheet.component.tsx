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
import { Utils } from "@/utils/utils";
import { getSortedCells } from "@/utils/topological-sort";

export type CellCoords = { ri: number; ci: number; }

export let data: SpreadsheetData = SpreadsheetUtil.createEmptySpreadsheet(26, 26);
export let variables: Map<string, Value> = new Map();

export type CellId = `${string}${number}`;

export function Spreadsheet() {

    const { showModal } = useModal();
    const {
        selectedCells,
        selectAllCells,
        deselectAllCells,
        isCellSelected,
        selectionListeners,
        dragWithCopy
    } = useSelection();

    const [step, setStep] = useState<number>(0);
    const [steps, setSteps] = useState<number>(100);

    const [history, setHistory] = useState<Map<CellId, string[]>>(new Map());

    const [usedCells, setUsedCells] = useState<Set<CellId>>(new Set<CellId>());
    const [copiedCells, setCopiedCells] = useState<Set<CellId>>(new Set<CellId>());

    const [cmdKey, setCmdKey] = useState<boolean>(false);

    useEffect(() => {
        /* data[0][0].formula = "= B1 + 1"
        data[0][1].formula = "= 1"

        const usedCells = new Set<CellId>();
        usedCells.add("cell-0-0");
        usedCells.add("cell-0-1");

        setUsedCells(usedCells); */
    }, []);

    // select initial cell
    useEffect(() => {
        onCellClick(Utils.cellIdToCoords("A1"));
    }, []);

    // update cell values in steps
    useEffect(() => {
        for (const [key, value] of history.entries()) {
            const cellId = key;
            const values = value;

            const { ri, ci } = Utils.cellIdToCoords(cellId);
            getCellSpan({ ri, ci }).innerText = values[step]
        }
    }, [step]);

    // evaluate cells on change
    useEffect(() => {
        evaluateUsedCells();
    }, [usedCells]);

    // if more than 1 cell is selected, clear formula
    useEffect(() => {
        if (selectedCells.size > 1) {
            setFormulaValue("");
        }
    }, [selectedCells]);

    // cmd key down
    useEffect(() => {
        const handleCmdKey = (event: any) => {
            setCmdKey(event.ctrlKey || event.metaKey);
        }

        window.addEventListener("keydown", handleCmdKey);
        window.addEventListener("keyup", handleCmdKey);

        return () => {
            window.removeEventListener("keydown", handleCmdKey);
            window.removeEventListener("keyup", handleCmdKey);
        }
    }, [])

    // drag & drop
    useEffect(() => {
        const handleDragOver = (event: any) => {
            event.preventDefault();
        };
    
        const handleDrop = (event: any) => {
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

    const showVariableModal = () => {
        showModal(({ hideModal }) => (
            <VariablesModal hideModal={hideModal} />
        ))
    }

    function onMouseUp() {
        if (!dragWithCopy) {
            return;
        }

        const baseCellCoors = Utils.cellIdToCoords(Array.from(selectedCells)[0]);
        const newUsedCells: CellId[] = [];

        for (let i = 1; i < Array.from(selectedCells).length; i++) {
            const currentCellCoors = Utils.cellIdToCoords(Array.from(selectedCells)[i]);

            const rowOffset = currentCellCoors.ri - baseCellCoors.ri;
            const colOffset = currentCellCoors.ci - baseCellCoors.ci;

            const regex = /\$?[A-Z]+\$?\d+/g;

            function shiftCellReference(ref: string): string {
                const match = ref.match(/(\$?)([A-Z]+)(\$?)(\d+)/);

                if (!match) return ref;

                const [, colDollar, colLetters, rowDollar, rowNumber] = match;

                let newColLetters = colLetters;
                let newRowNumber = parseInt(rowNumber, 10);

                if (!colDollar) {
                    const currentColIndex = colLetters.split('').reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 64), 0);
                    const newColIndex = currentColIndex + colOffset;

                    newColLetters = '';
                    let index = newColIndex;
                    while (index > 0) {
                        const charCode = ((index - 1) % 26) + 65;
                        newColLetters = String.fromCharCode(charCode) + newColLetters;
                        index = Math.floor((index - 1) / 26);
                    }
                }

                if (!rowDollar) {
                    newRowNumber += rowOffset;
                }

                return `${colDollar}${newColLetters}${rowDollar}${newRowNumber}`;
            }

            let copiedCellFormula = data[baseCellCoors.ri][baseCellCoors.ci].formula;

            const newFormula = copiedCellFormula.replace(regex, (match) => shiftCellReference(match));

            data[currentCellCoors.ri][currentCellCoors.ci].formula = newFormula;
            const cellId = Utils.cellCoordsToId(currentCellCoors);
            evaluateUsedCells([cellId]);
            newUsedCells.push(cellId);
        }

        addUsedCells(newUsedCells);
    }

    // formula utilities

    function getFormulaElement(): HTMLInputElement {
        return document.getElementById("formula") as HTMLInputElement;
    }

    function setFormulaFocus(): void {
        getFormulaElement().focus();
    }

    function setFormulaValue(value: string): void {
        getFormulaElement().value = value;
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

    // cell keyboard handlers

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
        for (const cellId of Array.from(selectedCells)) {
            const { ri, ci } = Utils.cellIdToCoords(cellId);

            data[ri][ci].formula = "";
            data[ri][ci].value = "";
            getCellSpan({ ri, ci }).innerText = "";
            removeUsedCell({ ri, ci });
        }

        setFormulaValue("");
    }

    function onCellCopy(): void {
        const newCopiedCells = new Set<CellId>();

        for (const cellId of Array.from(selectedCells)) {
            newCopiedCells.add(cellId);
        }

        setCopiedCells(newCopiedCells);
    }

    function onCellPaste(): void {
        const currentCellCoors = Utils.cellIdToCoords(Array.from(selectedCells)[0]);
        const copiedCellCoors = Utils.cellIdToCoords(Array.from(copiedCells)[0]);
    
        const rowOffset = currentCellCoors.ri - copiedCellCoors.ri;
        const colOffset = currentCellCoors.ci - copiedCellCoors.ci;
    
        const regex = /\$?[A-Z]+\$?\d+/g;
    
        const newUsedCells: CellId[] = [];
    
        function shiftCellReference(ref: string): string {
            const match = ref.match(/(\$?)([A-Z]+)(\$?)(\d+)/);
    
            if (!match) return ref;
    
            const [, colDollar, colLetters, rowDollar, rowNumber] = match;
    
            let newColLetters = colLetters;
            let newRowNumber = parseInt(rowNumber, 10);
    
            if (!colDollar) {
                const currentColIndex = colLetters.split("").reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 64), 0);
                const newColIndex = currentColIndex + colOffset;
    
                newColLetters = "";
                let index = newColIndex;

                while (index > 0) {
                    const charCode = ((index - 1) % 26) + 65;
                    newColLetters = String.fromCharCode(charCode) + newColLetters;
                    index = Math.floor((index - 1) / 26);
                }
            }
    
            if (!rowDollar) {
                newRowNumber += rowOffset;
            }
    
            return `${colDollar}${newColLetters}${rowDollar}${newRowNumber}`;
        }
    
        for (const copiedCell of Array.from(copiedCells)) {
            const cellRow = Utils.cellIdToCoords(copiedCell).ri + rowOffset;
            const cellCol = Utils.cellIdToCoords(copiedCell).ci + colOffset;
    
            let copiedCellFormula = data[Utils.cellIdToCoords(copiedCell).ri][Utils.cellIdToCoords(copiedCell).ci].formula;
    
            const newFormula = copiedCellFormula.replace(regex, (match) => shiftCellReference(match));
    
            data[cellRow][cellCol].formula = newFormula;
            evaluateUsedCells([Utils.cellCoordsToId({ ri: cellRow, ci: cellCol })]);
            newUsedCells.push(Utils.cellCoordsToId({ ri: cellRow, ci: cellCol }));
        }
    
        addUsedCells(newUsedCells);
    }

    function onCellSelectAll(): void {
        selectAllCells();
    }

    // cell mouse handlers

    function onCellClick({ ri, ci }: CellCoords): void {
        if (cmdKey) {
            const input = getFormulaElement();
            const textToInsert = Utils.cellCoordsToId({ ri, ci });

            const { selectionStart, selectionEnd, value } = input;

            const newValue =
                value.substring(0, selectionStart) +
                textToInsert +
                value.substring(selectionEnd);

            input.value = newValue;

            const coords = Utils.cellIdToCoords(Array.from(selectedCells)[0]);
            data[coords.ri][coords.ci].formula = newValue;

            const newPosition = selectionStart + textToInsert.length;
            input.setSelectionRange(newPosition, newPosition);
            input.focus();

            return;
        }

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
            const { ri, ci } = Utils.cellIdToCoords(cellId);
            return data[ri][ci].formula[0] === "=";
        });

        // topological sort
        const sortedCells = getSortedCells(usedCellsWithFormula.map(cellId => {
            const { ri, ci } = Utils.cellIdToCoords(cellId);
            const formula = data[ri][ci].formula;
            return { id: cellId, formula };
        }));

        const history = new Evaluator().evaluateCells(sortedCells, steps);

        for (const [key, value] of history.entries()) {
            const cellId = key;
            const values = value;

            const { ri, ci } = Utils.cellIdToCoords(cellId);
            getCellSpan({ ri, ci }).innerText = values[step];
        }

        setHistory(history);

        cells.filter(cellId => {
            const { ri, ci } = Utils.cellIdToCoords(cellId);
            return data[ri][ci].formula[0] !== "=";
        }).forEach(cellId => {
            const { ri, ci } = Utils.cellIdToCoords(cellId);
            getCellSpan({ ri, ci }).innerText = data[ri][ci].formula;
        });
    }

    // utilities

    function getCellSpan({ ri, ci }: CellCoords): HTMLSpanElement {
        return (document.getElementById(Utils.cellCoordsToId({ ri, ci })) as HTMLDivElement).children[0] as HTMLSpanElement;
    }

    function getFirstSelectedCell(): CellCoords {
        return Utils.cellIdToCoords(Array.from(selectedCells)[0]);
    }

    function addUsedCell({ ri, ci }: CellCoords): void {
        const newUsedCells = new Set<CellId>(usedCells);
        newUsedCells.add(Utils.cellCoordsToId({ ri, ci }));
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
        newUsedCells.delete(Utils.cellCoordsToId({ ri, ci }));
        setUsedCells(newUsedCells);
    }

    function setCellIndicatorText({ ri, ci }: CellCoords): void {
        const currentCell = document.getElementById("current-cell") as HTMLDivElement;
        currentCell.innerText = `${Utils.columnIndexToText(ci)}${ri + 1}`;
    }

    function isRowSelected({ ri }): boolean {
        return Array.from(selectedCells).find(cellId => {
            const coords = Utils.cellIdToCoords(cellId);
            return coords.ri == ri;
        }) !== undefined;
    }

    function isColSelected({ ci }): boolean {
        return Array.from(selectedCells).find(cellId => {
            const coords = Utils.cellIdToCoords(cellId);
            return coords.ci == ci;
        }) !== undefined;
    }

    // import and export

    function importAndLoad(importedData: any) {
        const newUsedCells: CellId[] = [];

        for (const [cellId, cellData] of Object.entries(importedData)) {
            const { formula, value } = cellData as any;
            const { ri, ci } = Utils.cellIdToCoords(cellId as CellId);

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
                
                object[Utils.cellCoordsToId({ ri, ci })] = {
                    formula: data[ri][ci].formula,
                    value: data[ri][ci].value,
                }
            }
        }

        download(object);
    }

    return (
        <Container>
            <Header>
                <Logo>
                    <Grid2x2Plus size={20} color="var(--primary)" />
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

                {/* <Button onClick={showVariableModal}>
                    <AlignLeft size={12} />
                    Variables
                </Button> */}

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
                                    {Utils.columnIndexToText(ci)}
                                </ColCell>
                            )}
                        </ColumnRow>

                        <Wrapper onMouseUp={selectionListeners.handleMouseUp}>
                            {data.map((row: SpreadsheetRow, ri: number) =>
                                <Row $entries={row.length + 1} key={ri}>
                                    <RowCell $selected={isRowSelected({ ri })} $special={true}>
                                        {ri + 1}
                                    </RowCell>

                                    {row.map((cell: SpreadsheetCell, ci: number) =>
                                        <Cell
                                            key={ci}
                                            id={Utils.cellCoordsToId({ ri, ci })}
                                            onClick={() => onCellClick({ ri, ci })}
                                            onDoubleClick={() => onCellDoubleClick({ ri, ci })}
                                            tabIndex={-1}
                                            onKeyDown={onCellKeyDown}
                                            onMouseDown={() => !cmdKey ? selectionListeners.handleMouseDown({ ri, ci }) : {}}
                                            onMouseEnter={() => selectionListeners.handleMouseMove({ ri, ci })}
                                            onMouseUp={() => !cmdKey ? onMouseUp() : {}}
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
    grid-template-columns: auto 1fr 150px 100px auto auto;
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
`;

const ColumnRow = styled(Row)`
    position: sticky;
    top: 0;

    z-index: 10;
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

    z-index: 100;
`;