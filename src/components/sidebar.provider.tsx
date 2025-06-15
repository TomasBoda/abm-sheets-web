"use client"

import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import styled from "styled-components";

type SidebarContextType = {
    toggle: (sidebar?: ReactNode) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

interface Props {
    content: ReactNode;
    sidebar: ReactNode;
}

const contentWidth = "60vw";
const sidebarWidth = "40vw";

export const SidebarProvider = (props: Props) => {

    const [toggled, setToggled] = useState<boolean>(false);
    const [sidebar, setSidebar] = useState<ReactNode>(props.sidebar);

    const toggle = (sidebar?: ReactNode) => {
        setToggled(prev => !prev);

        if (sidebar) {
            setSidebar(sidebar);
        }
    }

    const gridTemplateColumns = useMemo(() => {
        if (toggled) return `${contentWidth} ${sidebarWidth}`;
        return `100vw ${sidebarWidth}`;
    }, [toggled]);
 
    const values = {
        toggle,
    }

    return (
        <SidebarContext.Provider value={values}>
            <Container style={{ gridTemplateColumns }}>
                <Content>
                    {props.content}
                </Content>

                <Sidebar>
                    {sidebar}
                </Sidebar>
            </Container>
        </SidebarContext.Provider>
    )
}

export const useSidebar = () => {
    const context = useContext(SidebarContext);

    if (!context) {
      throw new Error("useSidebar must be used within a SidebarContext");
    }
    
    return context;
};

const Container = styled.div`
    width: calc(100vw + ${sidebarWidth});
    height: 100vh;
    max-height: 100vh;
    min-height: 100vh;

    display: grid;
    grid-template-columns: 100vw ${sidebarWidth};

    transition: grid-template-columns 300ms ease-in-out;
`;

const Content = styled.div`
    width: 100%;
    height: 100%;
    max-width: 100%;
    min-width: 100%;
    max-height: 100%;
    min-height: 100%;

    display: flex;
    flex-direction: column;
`;

const Sidebar = styled.div`
    width: 100%;
    max-width: 100%;
    min-width: 100%;
    height: 100%;
    max-height: 100%;
    min-height: 100%;

    display: flex;

    border-left: 1px solid var(--bg-2);
    background-color: var(--bg-1);
`;