"use client";

import {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import { useModal } from "./useModal";
import { OnboardingModal } from "@/modals/onboarding.modal";
import { useLocalStorage } from "./useLocalStorage";

type OnboardingContextType = {
    active: boolean;
    setActive: (active: boolean) => void;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(
    undefined,
);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
    const modal = useModal();
    const storage = useLocalStorage();

    const [active, setActive] = useState(() => {
        if (typeof window === "undefined") {
            return false;
        }

        return !!storage.get("onboarding");
    });

    useEffect(() => {
        storage.set("onboarding", active);
    }, [active]);

    useEffect(() => {
        if (!active) return;

        modal.showModal(({ hideModal }) => (
            <OnboardingModal hideModal={hideModal} setActive={setActive} />
        ));
    }, [active]);

    const values = { active, setActive };

    return (
        <OnboardingContext.Provider value={values}>
            {children}
        </OnboardingContext.Provider>
    );
};

export const useOnboarding = () => {
    const context = useContext(OnboardingContext);

    if (!context) {
        throw new Error(
            "useOnboarding must be used within a OnboardingProvider",
        );
    }

    return context;
};
