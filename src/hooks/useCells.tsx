"use client"

import { CellId } from "@/components/spreadsheet/spreadsheet.model";
import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from "react";

type CellInfoContextType = {
    usedCells: Set<CellId>;
    setUsedCells: Dispatch<SetStateAction<Set<CellId>>>;
};
  
const CellInfoContext = createContext<CellInfoContextType | undefined>(undefined);

export const CellInfoProvider = ({ children }: { children: ReactNode; }) => {
  
    const [usedCells, setUsedCells] = useState<Set<CellId>>(new Set());

    const values = {
        usedCells,
        setUsedCells,
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