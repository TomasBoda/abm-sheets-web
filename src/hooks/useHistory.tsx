"use client";

import { CellId, History } from "@/components/spreadsheet/spreadsheet.model";
import {
    Dispatch,
    ReactNode,
    SetStateAction,
    createContext,
    useContext,
    useState,
} from "react";

type HistoryContextType = {
    history: History;
    setHistory: Dispatch<SetStateAction<History>>;
    dataHistory: History;
    setDataHistory: Dispatch<SetStateAction<History>>;
};

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider = ({ children }: { children: ReactNode }) => {
    const [history, setHistory] = useState<History>(
        new Map<CellId, string[]>(),
    );
    const [dataHistory, setDataHistory] = useState<History>(
        new Map<CellId, string[]>(),
    );

    const values = {
        history,
        setHistory,
        dataHistory,
        setDataHistory,
    };

    return (
        <HistoryContext.Provider value={values}>
            {children}
        </HistoryContext.Provider>
    );
};

export const useHistory = () => {
    const context = useContext(HistoryContext);

    if (!context) {
        throw new Error("useHistory must be used within a HistoryProvider");
    }

    return context;
};
