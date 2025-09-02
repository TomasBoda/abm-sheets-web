"use client";

import { useGraph } from "@/hooks/useGraph";
import { useSpreadsheet } from "@/hooks/useSpreadsheet";
import { useStepper } from "@/hooks/useStepper";
import { GraphValue, ValueType } from "@/runtime/runtime";
import { compost as c } from "compostjs";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { CellId } from "./spreadsheet/spreadsheet.model";

const GRAPH_RENDERER_ID = "graph-renderer";

export const GraphSidebar = () => {
    const graph = useGraph();
    const spreadsheet = useSpreadsheet();
    const stepper = useStepper();

    const [graphCellId, setGraphCellId] = useState<CellId>(graph.cells[0]?.id);

    useEffect(() => {
        document.getElementById(GRAPH_RENDERER_ID).innerHTML = "";

        const value =
            spreadsheet.history.history.get(graphCellId)?.[stepper.step];

        if (!value || value.type !== ValueType.Graph) return;

        const graph = value as GraphValue;

        c.render(GRAPH_RENDERER_ID, graph.value);
    }, [graphCellId, spreadsheet.history.history, stepper.step]);

    return (
        <Container>
            <Heading>Graph</Heading>
            <Text>Render a graph and observe the results.</Text>

            <List>
                {graph.cells.map((cell) => (
                    <Item
                        onClick={() => setGraphCellId(cell.id)}
                        $selected={cell.id === graphCellId}
                        key={cell.id}
                    >
                        {cell.id}
                    </Item>
                ))}
            </List>

            <Content id={GRAPH_RENDERER_ID} />
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: flex-start;

    padding: 25px;
`;

const Heading = styled.h2`
    color: black;
    font-size: 22px;
    font-weight: 700;
    line-height: 100%;

    margin-bottom: 10px;
`;

const Text = styled.div`
    color: black;
    font-size: 14px;
    font-weight: 400;
    line-height: 150%;
    opacity: 0.6;

    margin-bottom: 15px;
`;

const List = styled.div`
    width: 100%;

    display: flex;
    flex-direction: row;
    gap: 5px;
    flex-wrap: wrap;

    margin-bottom: 25px;
`;

const Item = styled.div<{ $selected: boolean }>`
    color: black;
    font-size: 12px;
    font-weight: 500;
    line-height: 100%;

    padding: 6px 12px;

    background-color: var(--bg-1);
    border: 1px solid var(--bg-5);
    border-radius: 5px;

    cursor: pointer;
    transition: all 100ms;

    &:hover {
        background-color: var(--bg-2);
    }

    ${({ $selected }) =>
        $selected &&
        `
            color: white;
            background-color: var(--color-1);
            border-color: var(--color-2); 

            &:hover {
                background-color: var(--color-2); 
            }
    `};
`;

const Content = styled.div`
    flex: 1;
    width: 100%;
    height: 100%;
`;
