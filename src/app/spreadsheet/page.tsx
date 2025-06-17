import { SidebarProvider } from "@/components/sidebar.provider";
import { Spreadsheet } from "@/components/spreadsheet/spreadsheet.component";
import { Toolbar } from "@/components/toolbar.component";
import { CellInfoProvider } from "@/hooks/useCells";
import { CellStyleProvider } from "@/hooks/useCellStyle";
import { GraphProvider } from "@/hooks/useGraph";
import { HistoryProvider } from "@/hooks/useHistory";
import { ModalProvider } from "@/hooks/useModal";
import { ProjectsProvider } from "@/hooks/useProjects";
import { SelectionProvider } from "@/hooks/useSelection.hook";
import { StepperProvider } from "@/hooks/useStepper";
import { createServerClient } from "@/utils/supabase/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Spreadsheet"
}

export default async function SpreadsheetPage() {
 
    const supabase = await createServerClient();
    const response = await supabase.auth.getUser();

    if (response.error) {
        redirect("/auth/sign-in");
    }

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