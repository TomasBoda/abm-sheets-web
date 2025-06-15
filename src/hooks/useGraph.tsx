"use client"

import { CellId } from "@/components/spreadsheet/spreadsheet.model";
import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from "react";

type GraphContextType = {
    cells: Set<CellId>;
    setCells: Dispatch<SetStateAction<Set<CellId>>>;
};
  
const GraphContext = createContext<GraphContextType | undefined>(undefined);

export const GraphProvider = ({ children }: { children: ReactNode; }) => {
  
    const [cells, setCells] = useState<Set<CellId>>(new Set());

    const values = {
        cells,
        setCells,
    }

    return (
        <GraphContext.Provider value={values}>
            {children}
        </GraphContext.Provider>
    );
};

export const useGraph = () => {
    const context = useContext(GraphContext);

    if (!context) {
      throw new Error("useGraph must be used within a GraphContext");
    }
    
    return context;
};