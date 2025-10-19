"use client";

import { SpreadsheetWrapper } from "@/components/spreadsheet/spreadsheet.wrapper";
import { Toolbar } from "@/components/toolbar/toolbar.component";
import { AuthProvider } from "@/hooks/useAuth";
import { GraphProvider } from "@/hooks/useGraph";
import { ModalProvider } from "@/hooks/useModal";
import { OnboardingProvider } from "@/hooks/useOnboarding";
import { usePageNoScroll } from "@/hooks/usePageNoScroll";
import { ProjectsProvider } from "@/hooks/useProjects";
import { SelectionProvider } from "@/hooks/useSelection";
import { SidebarProvider } from "@/hooks/useSidebar";
import { SpreadsheetProvider } from "@/hooks/useSpreadsheet";
import { useSpreadsheetSize } from "@/hooks/useSpreadsheetSize";
import { StepperProvider } from "@/hooks/useStepper";
import { User } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import styled from "styled-components";
import { v4 as uuid } from "uuid";

interface SpreadsheetScreenProps {
    user?: User;
}

export default function SpreadsheetScreen({ user }: SpreadsheetScreenProps) {
    const toolbarRef = useRef<HTMLDivElement>(null);
    const { size } = useSpreadsheetSize({ toolbarRef });

    usePageNoScroll();

    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const sessionId = searchParams.get("sessionId");

        if (!sessionId) {
            const params = new URLSearchParams(searchParams);
            params.set("sessionId", uuid());
            router.replace(`/spreadsheet?${params.toString()}`);
        }
    }, [searchParams]);

    return (
        <AuthProvider>
            <SpreadsheetProvider>
                <SelectionProvider>
                    <StepperProvider>
                        <ProjectsProvider>
                            <GraphProvider>
                                <ModalProvider>
                                    <OnboardingProvider>
                                        <SidebarProvider
                                            content={
                                                <Container>
                                                    <ToolbarContainer
                                                        ref={toolbarRef}
                                                    >
                                                        <Toolbar user={user} />
                                                    </ToolbarContainer>

                                                    <Content $size={size}>
                                                        <SpreadsheetWrapper />
                                                    </Content>
                                                </Container>
                                            }
                                        />
                                    </OnboardingProvider>
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

    background-color: var(--bg-1);
`;

const ToolbarContainer = styled.div`
    width: 100%;
`;

const Content = styled.div<{ $size: { width: number; height: number } }>`
    width: ${({ $size }) => $size.width}px;
    height: ${({ $size }) => $size.height}px;

    padding: 15px;
`;
