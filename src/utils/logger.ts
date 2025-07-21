import { createClientClient } from "./supabase/client";

export type LogType =
    | "click-tab"
    | "click-step"
    | "click-reset"
    | "click-cell"
    | "click-play"
    | "click-stop"
    | "input";

export class Logger {
    public static async log(type: LogType, value: string): Promise<void> {
        const supabase = createClientClient();

        const user = await supabase.auth.getUser();

        // TODO: remove
        if (
            user.data.user !== null &&
            user.data.user.id === "7a1b6d92-ebd3-44cf-ad31-835ef40578ac"
        ) {
            return;
        }

        await supabase.from("logs").insert([{ type, value }] as any);
    }
}
