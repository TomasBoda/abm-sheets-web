"use client";

import { ColorPicker } from "@/components/color-picker/color-picker.component";
import { ProjectsSidebar } from "@/components/projects-sidebar";
import { data } from "@/components/spreadsheet/data";
import { CellId } from "@/components/spreadsheet/spreadsheet.model";
import { Tab, Tabs } from "@/components/tabs/tabs.component";
import { TextFieldSmall } from "@/components/text-field-small";
import { useCellInfo } from "@/hooks/useCells";
import { useCellStyle } from "@/hooks/useCellStyle";
import { useHistory } from "@/hooks/useHistory";
import { useModal } from "@/hooks/useModal";
import { useSelection } from "@/hooks/useSelection.hook";
import { useSpreadsheet } from "@/hooks/useSpreadsheet";
import { useStepper } from "@/hooks/useStepper";
import { SaveProjectModal } from "@/modals/save-project.modal";
import { Constants } from "@/utils/constants";
import { Logger } from "@/utils/logger";
import { createClientClient } from "@/utils/supabase/client";
import { Utils } from "@/utils/utils";
import { User } from "@supabase/supabase-js";
import {
    Ban,
    Bold,
    ChevronLeft,
    ChevronRight,
    Download,
    Italic,
    Play,
    RotateCcw,
    Square,
    Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { GraphSidebar } from "./graph-sidebar";
import { useSidebar } from "./sidebar.provider";

interface ToolbarProps {
    user: User;
}

export const Toolbar = ({ user }: ToolbarProps) => {
    const router = useRouter();
    const spreadsheet = useSpreadsheet();
    const { toggle } = useSidebar();
    const { showModal } = useModal();

    const saveProject = async () => {
        showModal(({ hideModal }) => (
            <SaveProjectModal hideModal={hideModal} />
        ));
    };

    const clearAll = () => {
        spreadsheet.clear();
        router.replace("/spreadsheet");
    };

    const openGraphSidebar = () => {
        toggle(<GraphSidebar />);
    };

    const openProjectsSidebar = () => {
        toggle(<ProjectsSidebar />);
    };

    const tabs: Tab[] = [
        {
            label: "Home",
            component: <HomeTab />,
        },
        {
            label: "Simulation",
            component: <SimulationTab />,
        },
        {
            label: "Graph",
            onClick: openGraphSidebar,
        },
        ...(user
            ? [
                  {
                      label: "Projects",
                      onClick: openProjectsSidebar,
                  },
              ]
            : []),
        {
            label: "Import & Export",
            component: <ImportExportTab />,
        },
        /* {
            label: "Advanced",
            component: <AdvancedTab />
        } */
    ];

    const signIn = () => {
        router.push("/auth/sign-in");
    };

    const signOut = async () => {
        const supabase = createClientClient();
        await supabase.auth.signOut();
        router.push("/auth/sign-in");
    };

    return (
        <TabsContainer>
            <Tabs
                tabs={tabs}
                rightContent={
                    <RightContent>
                        {user && (
                            <Button onClick={saveProject}>Save project</Button>
                        )}

                        <Button onClick={clearAll}>Clear</Button>

                        {user ? (
                            <Button onClick={signOut}>Sign out</Button>
                        ) : (
                            <Button onClick={signIn}>Sign in</Button>
                        )}

                        <GithubLogoHref
                            href="https://github.com/tomasBoda/abm-sheets-web"
                            target="_blank"
                        >
                            <GithubLogo src="/logo-github.svg" />
                        </GithubLogoHref>
                    </RightContent>
                }
            />
        </TabsContainer>
    );
};

const HomeTab = () => {
    const { selectedCells } = useSelection();
    const {
        cellColors,
        setCellColors,
        cellBolds,
        setCellBolds,
        cellItalics,
        setCellItalics,
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
    };

    const setCellBold = () => {
        const newCellBolds = new Map(cellBolds);

        for (const cellId of Array.from(selectedCells)) {
            newCellBolds.set(cellId, "bold");
        }

        setCellBolds(newCellBolds);
    };

    const setCellItalic = () => {
        const newCellItalics = new Map(cellItalics);

        for (const cellId of Array.from(selectedCells)) {
            newCellItalics.set(cellId, "italic");
        }

        setCellItalics(newCellItalics);
    };

    const setCellNormal = () => {
        const newCellBolds = new Map(cellBolds);
        const newCellItalics = new Map(cellItalics);

        for (const cellId of Array.from(selectedCells)) {
            newCellBolds.delete(cellId);
            newCellItalics.delete(cellId);
        }

        setCellBolds(newCellBolds);
        setCellItalics(newCellItalics);
    };

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
    };

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

            <ColorPicker onChange={(color) => setCellColor(color)} />

            <Divider />

            <Button onClick={clear}>
                <RotateCcw size={10} />
                Clear
            </Button>
        </TabContainer>
    );
};

const SimulationTab = () => {
    const { step, setStep, steps, setSteps, reset } = useStepper();

    const [delay, setDelay] = useState<number>(100);
    const [isPlaying, setIsPlaying] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [stepFieldValue, setStepFieldValue] = useState<number>(
        Constants.DEFAULT_STEP + 1,
    );

    const prevStep = () => {
        setStep((prev) => Math.max(0, prev - 1));
        Logger.log("click-step", "prev");
    };

    const nextStep = () => {
        setStep((prev) => Math.min(prev + 1, steps - 1));
        Logger.log("click-step", "next");
    };

    const onResetClick = () => {
        reset();
        Logger.log("click-reset", "");
    };

    const onPlayClick = () => {
        setStep(0);
        setIsPlaying(true);
        Logger.log("click-play", "");
    };

    const onStopClick = () => {
        setIsPlaying(false);
        Logger.log("click-stop", "");
    };

    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = setInterval(() => {
                setStep((prev) => Math.min(prev + 1, steps - 1));
            }, delay);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isPlaying, delay, steps]);

    useEffect(() => {
        if (isPlaying && step >= steps - 1) {
            setIsPlaying(false);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }
    }, [step, steps, isPlaying]);

    useEffect(() => {
        setStepFieldValue(step + 1);
    }, [step]);

    const handleStepsInput = (value: string) => {
        if (/^[0-9]*$/.test(value)) {
            setStepFieldValue(Number(value));
        }
    };

    const confirmStep = () => {
        const newStep = Number(stepFieldValue);

        if (newStep === 0) {
            setStep(0);
            setStepFieldValue(1);
        } else if (newStep > steps) {
            setStep(steps - 1);
            setStepFieldValue(steps);
        } else {
            setStep(newStep - 1);
        }
    };

    const onHandleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            confirmStep();
        }
    };

    return (
        <TabContainer>
            <Stepper>
                <Button onClick={prevStep}>
                    <ChevronLeft size={12} />
                </Button>

                <TextFieldSmall
                    value={stepFieldValue.toString()}
                    disabled={false}
                    onChange={(newValue) => handleStepsInput(newValue)}
                    onBlur={confirmStep}
                    onKeyDown={onHandleKeyDown}
                />

                <Button onClick={nextStep}>
                    <ChevronRight size={12} />
                </Button>
            </Stepper>

            <Divider />

            <TextFieldSmall
                value={steps.toString()}
                onChange={(value) =>
                    value === "" ? setSteps(0) : setSteps(parseInt(value))
                }
                placeholder="Steps"
            />

            <Divider />

            <Button onClick={onResetClick}>
                <RotateCcw size={10} />
                Reset
            </Button>

            <Divider />

            <TextFieldSmall
                value={delay.toString()}
                onChange={(value) =>
                    value === "" ? setDelay(0) : setDelay(parseInt(value))
                }
                placeholder="Delay"
            />

            <Divider />

            {isPlaying ? (
                <Button onClick={onStopClick}>
                    <Square size={10} />
                    Stop
                </Button>
            ) : (
                <Button onClick={onPlayClick}>
                    <Play size={10} />
                    Play
                </Button>
            )}
        </TabContainer>
    );
};

const ImportExportTab = () => {
    const { setCellColors, setCellBolds, setCellItalics } = useCellStyle();
    const { usedCells, setUsedCells, setGraphCells } = useCellInfo();
    const { dataHistory, setDataHistory } = useHistory();
    const spreadsheet = useSpreadsheet();

    const [filename, setFilename] = useState<string>("");

    const exportAndSave = () => {
        const object = {};

        for (let ri = 0; ri < data.length; ri++) {
            for (let ci = 0; ci < data[ri].length; ci++) {
                const cellId = Utils.cellCoordsToId({ ri, ci });
                const { formula, value, color, font, isInGraph } = data[ri][ci];

                if (formula.trim() === "" && value.trim() === "") {
                    continue;
                }

                object[cellId] = {
                    formula,
                    value,
                    color,
                    font,
                    isInGraph,
                    history,
                };
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
    };

    const onFileInputClick = () => {
        document.getElementById("fileInput").click();
    };

    const addUsedCells = (cellIds: CellId[]) => {
        const newUsedCells = new Set<CellId>(usedCells);

        for (const cellId of cellIds) {
            newUsedCells.add(cellId);
        }

        setUsedCells(newUsedCells);
    };

    const importAndLoad = (importedData: any) => {
        spreadsheet.clear();

        const newUsedCells: CellId[] = [];
        const newCellColors = new Map<CellId, string>();
        const newCellBolds = new Map<CellId, string>();
        const newCellItalics = new Map<CellId, string>();
        const newGraphCells = new Set<CellId>();
        const newDataHistory = new Map(dataHistory);

        for (const [cellId, cellData] of Object.entries(importedData)) {
            const { formula, value, color, font, isInGraph } = cellData as any;
            const { ri, ci } = Utils.cellIdToCoords(cellId as CellId);

            data[ri][ci].formula = formula;
            data[ri][ci].value = value;
            data[ri][ci].color = color;
            data[ri][ci].font = font;
            data[ri][ci].isInGraph = isInGraph;

            if (color) {
                newCellColors.set(cellId as CellId, color);
            }

            if (font) {
                for (let i = 0; i < font.length; i++) {
                    if (font[i] === "bold") {
                        newCellBolds.set(cellId as CellId, "bold");
                    } else if (font[i] === "italic") {
                        newCellItalics.set(cellId as CellId, "italic");
                    }
                }
            }

            if (isInGraph) {
                newGraphCells.add(cellId as CellId);
            }

            if (formula[0] === "=") {
                newUsedCells.push(cellId as CellId);
            } else {
                Utils.getCellSpan({ ri, ci }).innerText = formula;
            }

            if ((cellData as any).dataHistory) {
                newDataHistory.set(
                    cellId as CellId,
                    (cellData as any).dataHistory,
                );
            }
        }

        addUsedCells(newUsedCells);
        setCellColors(newCellColors);
        setCellBolds(newCellBolds);
        setCellItalics(newCellItalics);
        setGraphCells(newGraphCells);
        setDataHistory(newDataHistory);
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
            <Button onClick={onFileInputClick}>
                <Upload size={10} />
                Import
            </Button>

            <input
                type="file"
                id="fileInput"
                name="input-file"
                accept=".json"
                style={{ display: "none" }}
            />

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
    );
};

const TabsContainer = styled.div`
    width: 100%;

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

const GithubLogoHref = styled.a``;

const GithubLogo = styled.img`
    width: 22px;
    color: white;
`;

const RightContent = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 15px;
`;
