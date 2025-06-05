import { createClientClient } from "./supabase/client";

export type LogType =
    | "click-tab"
    | "click-step"
    | "click-reset"
    | "click-cell"
    | "input"

export class Logger {

    public static async log(type: LogType, value: string): Promise<void> {
        const supabase = createClientClient();
    
        await supabase
            .from("logs")
            .insert([{ type, value }] as any);
    }
}