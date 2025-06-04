import { createServerClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AuthLayout({ children }: { children: React.ReactNode; }) {

    const supabase = await createServerClient();
    const response = await supabase.auth.getUser();

    if (!response.error) {
        redirect("/spreadsheet");
    }

    return <>{children}</>;
  }