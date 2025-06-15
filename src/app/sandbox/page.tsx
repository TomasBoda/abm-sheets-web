"use client"

import { SidebarProvider } from "@/components/sidebar.provider";
import { Spreadsheet } from "@/components/spreadsheet/spreadsheet.component";
import { CellInfoProvider } from "@/hooks/useCells";
import { CellStyleProvider } from "@/hooks/useCellStyle";
import { HistoryProvider } from "@/hooks/useHistory";
import { ModalProvider } from "@/hooks/useModal";
import { SelectionProvider } from "@/hooks/useSelection.hook";
import { StepperProvider } from "@/hooks/useStepper";
import { ProjectsProvider } from "@/hooks/useProjects";
import { GraphProvider } from "@/hooks/useGraph";
import { ProjectsSidebar } from "@/components/projects-sidebar";
import { GraphSidebar } from "@/components/graph-sidebar";
import { Toolbar } from "@/components/toolbar.component";

export default function SpreadsheetPage() {
 
    return (
        <HistoryProvider>
            <ModalProvider>
                <CellInfoProvider>
                    <SelectionProvider>
                        <StepperProvider>
                            <CellStyleProvider>
                                <ProjectsProvider>
                                    <GraphProvider>
                                        <SidebarProvider
                                            content={(
                                                <>
                                                    <Toolbar />
                                                    <Spreadsheet />
                                                </>
                                            )}
                                            sidebar={null}
                                        />
                                    </GraphProvider>
                                </ProjectsProvider>
                            </CellStyleProvider>
                        </StepperProvider>
                    </SelectionProvider>
                </CellInfoProvider>
            </ModalProvider>
        </HistoryProvider>
    )
}