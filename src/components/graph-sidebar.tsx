"use client"

import styled from "styled-components";
import React, { PureComponent, ReactNode, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from "./button/button.component";
import { CellId } from "./spreadsheet/spreadsheet.model";
import { useCellInfo } from "@/hooks/useCells";
import { useHistory } from "@/hooks/useHistory";
import { useStepper } from "@/hooks/useStepper";
import { useSidebar } from "./sidebar.provider";
import { X } from "lucide-react";

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
    "#fabebe"  // light pink
];

export const GraphSidebar = () => {

    const { graphCells, xGraphCell } = useCellInfo();
    const { history } = useHistory();
    const { step } = useStepper();
    const { toggle } = useSidebar();

    const data = useMemo(() => {
        const cells = Array.from(graphCells);

        const cellHistories = cells
            .filter(cellId => history.get(cellId) !== undefined)
            .map(cellId => {
                const data = history.get(cellId)!;
                const sliced = data.slice(0, step + 1);
                return {
                    cellId,
                    history: sliced,
                };
            });

        const xHistory = xGraphCell && history.get(xGraphCell)
            ? history.get(xGraphCell)!.slice(0, step + 1)
            : null;

        const data = [];

        for (let i = 0; i <= step; i++) {
            const entry: Record<string, any> = {};

            if (xHistory) {
                entry.x = xHistory[i];
            } else {
                entry.x = i;
            }

            for (const cell of cellHistories) {
                entry[cell.cellId] = cell.history[i];
            }

            data.push(entry);
        }

        return data;
    }, [graphCells, xGraphCell, history, step]);

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
            </P1>

            <AddedCellsContainer>
                {Array.from(graphCells).map(cellId => (
                    <CellTag key={cellId}>
                        {cellId}
                    </CellTag>
                ))}
            </AddedCellsContainer>

            <Graph>
                {graphCells.size > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={data}
                        >

                        <XAxis dataKey="x" />
                        <YAxis domain={['dataMin - 10', 'dataMax + 10']} />

                        <Tooltip />
                        <Legend />

                        {Array.from(graphCells).map((cellId, index) => (
                            <Line
                                type="monotone"
                                dataKey={cellId}
                                stroke={colors[index % colors.length]}
                                isAnimationActive={false}
                                key={cellId}
                            />
                        ))}

                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <NoGraphData>
                        No data to show...
                    </NoGraphData>
                )}
            </Graph>
        </Container>
    )
}

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

const NoGraphData = styled.div`
    color: var(--text-1);
    font-size: 14px;
    font-weight: 400;
    line-height: 100%;
`;

const InputContainer = styled.div`
    width: 100%;

    display: grid;
    grid-template-columns: 1fr auto;
    gap: 10px;

    margin: 15px 0px;
`;

const TextField = styled.input`
    color: var(--text-1);
    font-size: 12px;
    font-weight: 400;

    width: 100%;

    border-radius: 10px;
    border: 1px solid rgba(0, 0, 0, 0.1);

    outline: none;

    padding: 10px;

    background-color: rgba(0, 0, 0, 0.05);

    &::placeholder {
        font-weight: 400;
    }
`;

const AddedCellsContainer = styled.div`
    width: 100%;

    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 10px;

    margin: 15px 0px;
`;

const CellTag = styled.div`
    color: var(--text-1);
    font-size: 10px;
    font-weight: 400;
    line-height: 100%;

    padding: 8px 12px;

    border-radius: 10px;
    border: 1px solid rgba(0, 0, 0, 0.1);

    background-color: rgba(0, 0, 0, 0.05);

    cursor: pointer;

    transition: all 100ms;
`;