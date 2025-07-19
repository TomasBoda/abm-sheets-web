import { SidebarProvider } from "@/components/sidebar.provider";
import { Spreadsheet } from "@/components/spreadsheet/spreadsheet.component";
import { Toolbar } from "@/components/toolbar.component";
import { AuthProvider } from "@/hooks/useAuth";
import { CellInfoProvider } from "@/hooks/useCells";
import { CellStyleProvider } from "@/hooks/useCellStyle";
import { GraphProvider } from "@/hooks/useGraph";
import { HistoryProvider } from "@/hooks/useHistory";
import { ModalProvider } from "@/hooks/useModal";
import { ProjectsProvider } from "@/hooks/useProjects";
import { SelectionProvider } from "@/hooks/useSelection.hook";
import { SpreadsheetProvider } from "@/hooks/useSpreadsheet";
import { StepperProvider } from "@/hooks/useStepper";
import { createServerClient } from "@/utils/supabase/server";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Spreadsheet | ABM Sheets",
};

export default async function SpreadsheetPage() {
    const supabase = await createServerClient();
    const response = await supabase.auth.getUser();
    const user = response.data.user;

    return (
        <AuthProvider>
            <HistoryProvider>
                <CellInfoProvider>
                    <SelectionProvider>
                        <StepperProvider>
                            <CellStyleProvider>
                                <ProjectsProvider>
                                    <GraphProvider>
                                        <SpreadsheetProvider>
                                            <ModalProvider>
                                                <SidebarProvider
                                                    content={
                                                        <>
                                                            <Toolbar user={user} />
                                                            <Spreadsheet />
                                                        </>
                                                    }
                                                    sidebar={null}
                                                />
                                            </ModalProvider>
                                        </SpreadsheetProvider>
                                    </GraphProvider>
                                </ProjectsProvider>
                            </CellStyleProvider>
                        </StepperProvider>
                    </SelectionProvider>
                </CellInfoProvider>
            </HistoryProvider>
        </AuthProvider>
    );
}
