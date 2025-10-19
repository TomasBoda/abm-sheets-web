import SpreadsheetScreen from "@/screens/spreadsheet.screen";
import { createServerClient } from "@/utils/supabase/server";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Spreadsheet | ABM Sheets",
};

export default async function Page() {
    const supabase = await createServerClient();
    const response = await supabase.auth.getUser();
    const user = response.data.user;

    return <SpreadsheetScreen user={user} />;
}
