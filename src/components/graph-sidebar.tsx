"use client";

import { useCellInfo } from "@/hooks/useCells";
import { useHistory } from "@/hooks/useHistory";
import { useStepper } from "@/hooks/useStepper";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useSidebar } from "./sidebar.provider";
import { Button } from "./button/button.component";
import { CellId } from "./spreadsheet/spreadsheet.model";
import { scale as s, compost as c } from "compostjs";
import { Utils } from "@/utils/utils";
import { data } from "./spreadsheet/data";
import { getgroups } from "node:process";

const colors: string[] = [
    "#e6194b", // vivid red
    "#3cb44b", // bright green
    "#ffe119", // yellow
    "#4363d8", // strong blue
    "#f58231", // orange
    "#911eb4", // purple
    "#46f0f0", // cyan
    "#f032e6", // magenta
    "#bcf60c", // lime
    "#fabebe", // light pink
];

export const GraphSidebar = () => {
    const { graphCells, setGraphCells, xGraphCell, usedCells } = useCellInfo();
    const { history } = useHistory();
    const { step } = useStepper();
    const { toggle } = useSidebar();
    const [currentGraphDisplay, setCurrentGraphDisplay] = useState<
        CellId | undefined
    >();

    const graphCellsArray = [...graphCells];
    const listGraphCells = graphCellsArray.map((cell) => (
        <GraphButtonWrapper key={cell}>
            <Button onClick={() => changeCurrentGraph(cell)} variant="primary">
                Graph - {cell}
            </Button>
        </GraphButtonWrapper>
    ));

    const tryRenderGraph = () => {
        const { ri, ci } = Utils.cellIdToCoords(currentGraphDisplay);
        if (data[ri][ci].compostGraphValue) {
            const graphValue = data[ri][ci].compostGraphValue[step].value;
            c.render("graphDisplay", graphValue);
            return true;
        }
        return false;
    };

    const handleReplaceGraph = () => {
        if (graphCells.size > 0) {
            setCurrentGraphDisplay([...graphCells].at(-1));
            const currentGraph = [...graphCells].at(-1);
            const { ri, ci } = Utils.cellIdToCoords(currentGraph);
            if (data[ri][ci].compostGraphValue) {
                const graphValue = data[ri][ci].compostGraphValue[step].value;
                c.render("graphDisplay", graphValue);
            } else {
                document.getElementById("graphDisplay").innerHTML = "";
                setCurrentGraphDisplay(undefined);
            }
        } else {
            document.getElementById("graphDisplay").innerHTML = "";
            setCurrentGraphDisplay(undefined);
        }
    };

    useEffect(
        function updateGraphDisplay() {
            if (currentGraphDisplay) {
                if (!tryRenderGraph()) {
                    handleReplaceGraph();
                }
            } else {
                handleReplaceGraph();
            }
        },
        [graphCells, currentGraphDisplay, step],
    );

    const changeCurrentGraph = (value: string) => {
        setCurrentGraphDisplay(value as CellId);
    };

    return (
        <Container>
            <H1>
                Visualisation
                <X
                    onClick={() => toggle()}
                    color="rgba(0, 0, 0, 0.4)"
                    size={16}
                    style={{ cursor: "pointer" }}
                />
            </H1>

            <Spacing />

            <P1>
                Render graphs based on your spreadsheet.
                <br />
                {currentGraphDisplay
                    ? ""
                    : " You have currently no graphs to display."}
            </P1>

            <GraphCanvas id="graphDisplay"></GraphCanvas>
            <GraphList>{listGraphCells}</GraphList>
        </Container>
    );
};

const Container = styled.div`
    flex: 1;

    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 30px;

    transition: right 300ms;

    background-color: white;

    * {
        font-family: "Poppins", sans-serif;
        font-weight: 400;
        font-style: normal;
    }
`;

const H1 = styled.h1`
    color: var(--text-1);
    font-size: 22px;
    font-weight: 600;
    line-height: 120%;

    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
`;

const P1 = styled.p`
    color: var(--text-1);
    font-size: 14px;
    font-weight: 300;
    line-height: 150%;
    opacity: 0.6;
`;

const Spacing = styled.div`
    height: 10px;
`;

const Graph = styled.div`
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    padding: 0px;

    border-radius: 5px;
    background-color: rgba(0, 0, 0, 0.02);
    border: 1px solid rgba(0, 0, 0, 0.05);
`;

const GraphButtonWrapper = styled.div`
    width: 100px;
    margin: 5px;
`;

const GraphList = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
    justify-content: center;
`;

const GraphCanvas = styled.div`
    margin-top: 20px;
    width: 100%;
    height: 90%;
`;
