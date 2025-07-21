"use client";

import { Constants } from "@/utils/constants";
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

export const StepperProvider = ({ children }: { children: ReactNode }) => {
    const [step, setStep] = useState<number>(Constants.DEFAULT_STEP);
    const [steps, setSteps] = useState<number>(Constants.DEFAULT_STEPS);

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
