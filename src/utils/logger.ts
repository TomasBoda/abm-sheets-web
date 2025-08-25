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
        await supabase
            .from("logs-v2")
            .insert([{ session_id: sessionId, type, value }]);
    }
}
