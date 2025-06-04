import { CellInfoProvider } from "@/hooks/useCells";
import { CellStyleProvider } from "@/hooks/useCellStyle";
import { HistoryProvider } from "@/hooks/useHistory";
import { ModalProvider } from "@/hooks/useModal";
import { SelectionProvider } from "@/hooks/useSelection.hook";
import { StepperProvider } from "@/hooks/useStepper";
import { createServerClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SpreadsheetLayout({ children }: { children: React.ReactNode; }) {

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
                                {children}
                            </CellStyleProvider>
                        </StepperProvider>
                    </SelectionProvider>
                </CellInfoProvider>
            </ModalProvider>
        </HistoryProvider>
    )
  }