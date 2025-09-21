import { createClientClient } from "./supabase/client";

type LogType =
    | "cell-click"
    | "formula-input"
    | "toolbar-stepper-previous"
    | "toolbar-stepper-next";

export class Logger {
    public static async log(
        sessionId: string,
        type: LogType,
        value: string,
    ): Promise<void> {
        const supabase = createClientClient();
        const user = await supabase.auth.getUser();

        if (user?.data?.user?.id === "7a1b6d92-ebd3-44cf-ad31-835ef40578ac") {
            return;
        }

        await supabase
            .from("logs-v2")
            .insert([{ session_id: sessionId, type, value }]);
    }
}
