"use client"

import { CellId } from "@/components/spreadsheet/spreadsheet.model";
import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from "react";

type CellInfoContextType = {
    usedCells: Set<CellId>;
    setUsedCells: Dispatch<SetStateAction<Set<CellId>>>;

    graphCells: Set<CellId>;
    setGraphCells: Dispatch<SetStateAction<Set<CellId>>>;
    addGraphCell: (cellId: CellId) => void;
    removeGraphCell: (cellId: CellId) => void;

    xGraphCell?: CellId;
    setXGraphCell: Dispatch<SetStateAction<CellId | undefined>>;
};
  
const CellInfoContext = createContext<CellInfoContextType | undefined>(undefined);

export const CellInfoProvider = ({ children }: { children: ReactNode; }) => {
  
    const [usedCells, setUsedCells] = useState<Set<CellId>>(new Set());
    const [graphCells, setGraphCells] = useState<Set<CellId>>(new Set());
    const [xGraphCell, setXGraphCell] = useState<CellId | undefined>(undefined);

    const addGraphCell = (cellId: CellId) => {
        const newGraphCells = new Set(graphCells);
        newGraphCells.add(cellId);
        setGraphCells(newGraphCells);
    }

    const removeGraphCell = (cellId: CellId) => {
        const newGraphCells = new Set(graphCells);
        newGraphCells.delete(cellId);
        setGraphCells(newGraphCells);
    }

    const values = {
        usedCells,
        setUsedCells,
        graphCells,
        setGraphCells,
        addGraphCell,
        removeGraphCell,
        xGraphCell,
        setXGraphCell,
    }

    return (
        <CellInfoContext.Provider value={values}>
            {children}
        </CellInfoContext.Provider>
    );
};

export const useCellInfo = () => {
    const context = useContext(CellInfoContext);

    if (!context) {
      throw new Error("useCellInfo must be used within a CellInfoProvider");
    }
    
    return context;
};