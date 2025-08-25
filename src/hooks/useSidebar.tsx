"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import styled from "styled-components";

type SidebarContextType = {
    toggle: (id: string, component?: ReactNode) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

interface Props {
    content: ReactNode;
}

export const SidebarProvider = (props: Props) => {
    const [toggled, setToggled] = useState<boolean>(false);

    const [sidebar, setSidebar] = useState<{
        id: string;
        component: ReactNode;
    }>();

    const toggle = (id: string, component?: ReactNode) => {
        if (!toggled) {
            setSidebar({ id, component });
            setToggled(true);
        } else {
            if (id === sidebar?.id) {
                setToggled(false);
            } else {
                setSidebar({ id, component });
            }
        }
    };

    const left = useMemo(() => {
        return toggled ? "calc(50vw - 15px)" : "100vw";
    }, [toggled]);

    const values = {
        toggle,
    };

    return (
        <SidebarContext.Provider value={values}>
            <Container>
                {props.content}

                <Sidebar style={{ left }}>{sidebar?.component}</Sidebar>
            </Container>
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => {
    const context = useContext(SidebarContext);

    if (!context) {
        throw new Error("useSidebar must be used within a SidebarContext");
    }

    return context;
};

const Container = styled.div`
    position: relative;
`;

const Sidebar = styled.div`
    width: 50vw;
    height: calc(100vh - 30px);
    min-height: calc(100vh - 30px);

    position: fixed;
    top: 15px;
    left: 100vw;

    background-color: rgb(250, 250, 250);
    border: 1px solid rgb(230, 230, 230);
    border-radius: 10px;

    transition: left 300ms;
    z-index: 999;
`;
