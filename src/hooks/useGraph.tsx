"use client";

import { CellId } from "@/components/spreadsheet/spreadsheet.model";
import { GraphType, GraphValue, ValueType } from "@/runtime/runtime";
import {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import { useSpreadsheet } from "./useSpreadsheet";
import { useStepper } from "./useStepper";

interface GraphCell {
    id: CellId;
    value: GraphType;
}

type GraphContextType = {
    cells: GraphCell[];
};

const GraphContext = createContext<GraphContextType | undefined>(undefined);

export const GraphProvider = ({ children }: { children: ReactNode }) => {
    const spreadsheet = useSpreadsheet();
    const stepper = useStepper();

    const [cells, setCells] = useState<GraphCell[]>([]);

    useEffect(() => {
        const graphCells: GraphCell[] = [];

        for (const cellId of spreadsheet.cells.usedCells) {
            const value =
                spreadsheet.history.history.get(cellId)?.[stepper.step];

            if (!value || value.type !== ValueType.Graph) continue;
            graphCells.push({
                id: cellId,
                value: (value as GraphValue).value,
            });
        }

        setCells(graphCells);
    }, [
        spreadsheet.cells.usedCells,
        spreadsheet.history.history,
        stepper.step,
    ]);

    const values = {
        cells,
    };

    return (
        <GraphContext.Provider value={values}>{children}</GraphContext.Provider>
    );
};

export const useGraph = () => {
    const context = useContext(GraphContext);

    if (!context) {
        throw new Error("useGraph must be used within a GraphContext");
    }

    return context;
};
