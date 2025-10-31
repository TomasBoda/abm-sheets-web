"use client";

import {
    DEFAULT_STEP,
    DEFAULT_STEPS,
} from "@/components/spreadsheet/spreadsheet.constants";
import {
    Dispatch,
    ReactNode,
    SetStateAction,
    createContext,
    useContext,
    useState,
} from "react";

type StepperContextType = {
    step: number;
    setStep: Dispatch<SetStateAction<number>>;
    steps: number;
    setSteps: Dispatch<SetStateAction<number>>;
    reset: () => void;
};

const StepperContext = createContext<StepperContextType | undefined>(undefined);

// holds the current step and total number of steps
export const StepperProvider = ({ children }: { children: ReactNode }) => {
    const [step, setStep] = useState<number>(DEFAULT_STEP);
    const [steps, setSteps] = useState<number>(DEFAULT_STEPS);

    const reset = () => {
        setStep(0);
    };

    return (
        <StepperContext.Provider
            value={{ step, steps, setStep, setSteps, reset }}
        >
            {children}
        </StepperContext.Provider>
    );
};

export const useStepper = () => {
    const context = useContext(StepperContext);

    if (!context) {
        throw new Error("useStepper must be used within a StepperProvider");
    }

    return context;
};
