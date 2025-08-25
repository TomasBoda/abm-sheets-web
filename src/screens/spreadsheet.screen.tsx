"use client";

import { SpreadsheetWrapper } from "@/components/spreadsheet/spreadsheet.wrapper";
import { Toolbar } from "@/components/toolbar/toolbar.component";
import { AuthProvider } from "@/hooks/useAuth";
import { GraphProvider } from "@/hooks/useGraph";
import { ModalProvider } from "@/hooks/useModal";
import { usePageNoScroll } from "@/hooks/usePageNoScroll";
import { ProjectsProvider } from "@/hooks/useProjects";
import { SelectionProvider } from "@/hooks/useSelection";
import { SidebarProvider } from "@/hooks/useSidebar";
import { SpreadsheetProvider } from "@/hooks/useSpreadsheet";
import { StepperProvider } from "@/hooks/useStepper";
import { User } from "@supabase/supabase-js";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import styled from "styled-components";

interface UseSpreadsheetSizeProps {
    toolbarRef: MutableRefObject<HTMLDivElement>;
}

interface SpreadsheetSize {
    width: number;
    height: number;
}

const useSpreadsheetSize = ({ toolbarRef }: UseSpreadsheetSizeProps) => {
    const [spreadsheetSize, setSpreadsheetSize] = useState<SpreadsheetSize>({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        if (!toolbarRef.current) {
            return;
        }

        const handleResize = () => {
            const toolbarHeight = toolbarRef.current.clientHeight;
            const contentWidth = window.innerWidth;
            const contentHeight = window.innerHeight - toolbarHeight;

            setSpreadsheetSize({ width: contentWidth, height: contentHeight });
        };

        handleResize();

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, [toolbarRef]);

    return { spreadsheetSize };
};

interface SpreadsheetScreenProps {
    user: User;
}

export default function SpreadsheetScreen({ user }: SpreadsheetScreenProps) {
    const toolbarRef = useRef<HTMLDivElement>(null);
    const { spreadsheetSize } = useSpreadsheetSize({ toolbarRef });

    usePageNoScroll();

    return (
        <AuthProvider>
            <SpreadsheetProvider>
                <SelectionProvider>
                    <StepperProvider>
                        <ProjectsProvider>
                            <GraphProvider>
                                <ModalProvider>
                                    <SidebarProvider
                                        content={
                                            <Container>
                                                <ToolbarContainer
                                                    ref={toolbarRef}
                                                >
                                                    <Toolbar user={user} />
                                                </ToolbarContainer>

                                                <Content
                                                    style={{
                                                        width: spreadsheetSize.width,
                                                        height: spreadsheetSize.height,
                                                    }}
                                                >
                                                    <SpreadsheetWrapper />
                                                </Content>
                                            </Container>
                                        }
                                    />
                                </ModalProvider>
                            </GraphProvider>
                        </ProjectsProvider>
                    </StepperProvider>
                </SelectionProvider>
            </SpreadsheetProvider>
        </AuthProvider>
    );
}

const Container = styled.div`
    width: 100vw;
    max-width: 100vw;
    min-width: 100vw;

    height: 100vh;
    max-height: 100vh;
    min-height: 100vh;

    display: flex;
    flex-direction: column;

    background-color: rgb(245, 245, 245);
`;

const ToolbarContainer = styled.div`
    width: 100%;

    background-color: rgb(250, 250, 250);
    border-bottom: 1px solid rgb(230, 230, 230);
`;

const Content = styled.div`
    padding: 15px;
`;
