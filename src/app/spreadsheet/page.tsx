import { SpreadsheetScreen } from "@/screens/spreadsheet.screen";
import { createServerClient } from "@/utils/supabase/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { CellInfoProvider } from "@/hooks/useCells";
import { CellStyleProvider } from "@/hooks/useCellStyle";
import { HistoryProvider } from "@/hooks/useHistory";
import { ModalProvider } from "@/hooks/useModal";
import { SelectionProvider } from "@/hooks/useSelection.hook";
import { StepperProvider } from "@/hooks/useStepper";
import { ProjectsProvider } from "@/hooks/useProjects";

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
                                    <SpreadsheetScreen />
                                </ProjectsProvider>
                            </CellStyleProvider>
                        </StepperProvider>
                    </SelectionProvider>
                </CellInfoProvider>
            </ModalProvider>
        </HistoryProvider>
    )
}