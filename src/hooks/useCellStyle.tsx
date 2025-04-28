"use client"

import { CellId } from "@/components/spreadsheet/spreadsheet.model";
import { Constants } from "@/utils/constants";
import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from "react";

type CellStyleMap = Map<CellId, string>;

type CellStyleContextType = {
    cellColors: CellStyleMap;
    cellBolds: CellStyleMap;
    cellItalics: CellStyleMap;

    setCellColors: Dispatch<SetStateAction<CellStyleMap>>;
    setCellBolds: Dispatch<SetStateAction<CellStyleMap>>;
    setCellItalics: Dispatch<SetStateAction<CellStyleMap>>;
};
  
const CellStyleContext = createContext<CellStyleContextType | undefined>(undefined);

export const CellStyleProvider = ({ children }: { children: ReactNode; }) => {

    const [cellColors, setCellColors] = useState<CellStyleMap>(new Map());
    const [cellBolds, setCellBolds] = useState<CellStyleMap>(new Map());
    const [cellItalics, setCellItalics] = useState<CellStyleMap>(new Map());
  
    const values = {
        cellColors,
        cellBolds,
        cellItalics,

        setCellColors,
        setCellBolds,
        setCellItalics,
    }

    return (
        <CellStyleContext.Provider value={values}>
            {children}
        </CellStyleContext.Provider>
    );
};

export const useCellStyle = () => {
    const context = useContext(CellStyleContext);

    if (!context) {
      throw new Error("useCellStyle must be used within a CellStyleProvider");
    }
    
    return context;
};