"use client";

import { CircleCheck, CircleX, Info, TriangleAlert, X } from "lucide-react";
import { ReactNode, createContext, useContext, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { v4 as uuid } from "uuid";

export type MessageType = "info" | "success" | "error" | "warning";

type MessageContextType = {
    showMessage: (type: MessageType, text: string) => void;
    hideMessage: () => void;
};

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider = ({ children }: { children: ReactNode }) => {
    const [type, setType] = useState<MessageType>("info");
    const [message, setMessage] = useState<ReactNode>();
    const [key, setKey] = useState("");

    const timeoutRef = useRef(null);

    const showMessage = (type: MessageType, content: ReactNode) => {
        hideMessage();

        setType(type);
        setMessage(content);
        setKey(uuid());

        timeoutRef.current = setTimeout(hideMessage, 3000);
    };

    const hideMessage = () => {
        setMessage(undefined);

        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
    };

    return (
        <MessageContext.Provider value={{ showMessage, hideMessage }}>
            {children}
            {message && (
                <Container onClick={(e: any) => e.stopPropagation()} key={key}>
                    {type === "info" && (
                        <Info
                            size={16}
                            color="var(--info-text)"
                            fill="var(--info-bg)"
                        />
                    )}
                    {type === "success" && (
                        <CircleCheck
                            size={16}
                            color="var(--success-text)"
                            fill="var(--success-bg)"
                        />
                    )}
                    {type === "error" && (
                        <CircleX
                            size={16}
                            color="var(--error-text)"
                            fill="var(--error-bg)"
                        />
                    )}
                    {type === "warning" && (
                        <TriangleAlert
                            size={16}
                            color="var(--warning-text)"
                            fill="var(--warning-bg)"
                        />
                    )}

                    <Content>{message}</Content>
                    <X
                        size={16}
                        style={{ cursor: "pointer" }}
                        onClick={hideMessage}
                    />
                </Container>
            )}
        </MessageContext.Provider>
    );
};

export const useMessage = () => {
    const context = useContext(MessageContext);

    if (!context) {
        throw new Error("useMessage must be used within a MessageProvider");
    }

    return context;
};

const fadeInRight = keyframes`
    from { opacity: 0; right: -320px; }
    to { opacity: 1; right: 20px; }
`;

const Container = styled.div`
    width: 300px;
    position: fixed;
    bottom: 20px;
    right: 20px;

    background-color: var(--bg-1);
    border: 1px solid var(--bg-3);
    border-radius: 10px;

    padding: 10px;

    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;

    animation: ${fadeInRight} 0.2s ease-out;
`;

const Content = styled.div`
    flex: 1;

    color: var(--text-1);
    font-size: 12px;
    font-weight: 500;
    line-height: 150%;
`;
