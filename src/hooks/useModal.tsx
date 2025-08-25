"use client";

import { ReactNode, createContext, useContext, useState } from "react";
import styled, { keyframes } from "styled-components";

type ModalContextType = {
    showModal: (content: (props: ModalControls) => ReactNode) => void;
    hideModal: () => void;
};

type ModalControls = {
    hideModal: ModalContextType["hideModal"];
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const [modals, setModals] = useState<ReactNode[]>([]);

    const showModal = (content: (props: ModalControls) => ReactNode) => {
        setModals((prev) => [...prev, content({ hideModal })]);
    };

    const hideModal = () => {
        setModals((prev) => prev.slice(0, -1));
    };

    return (
        <ModalContext.Provider value={{ showModal, hideModal }}>
            {children}
            {modals.length > 0 && (
                <Container onClick={hideModal}>
                    <Panel onClick={(e: any) => e.stopPropagation()}>
                        {modals[modals.length - 1]}
                    </Panel>
                </Container>
            )}
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);

    if (!context) {
        throw new Error("useModal must be used within a ModalProvider");
    }

    return context;
};

const backgroundAnimation = keyframes`
    from { background-color: rgba(0, 0, 0, 0); }
    to { background-color: rgba(0, 0, 0, 0.5); }
`;

const fadeInUp = keyframes`
    from { opacity: 0; transform: translateY(50px); }
    to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    z-index: 999;

    background-color: rgba(0, 0, 0, 0.5);
    animation: ${backgroundAnimation} 0.15s ease-out;
`;

const Panel = styled.div`
    width: 500px;
    animation: ${fadeInUp} 0.15s ease-out;
`;
