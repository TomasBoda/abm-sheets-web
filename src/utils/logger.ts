import { SupabaseClient } from "@supabase/supabase-js";
import { createClientClient } from "./supabase/client";

export type LogType =
    | "click-tab"
    | "click-step"
    | "click-reset"
    | "click-cell"
    | "input"

export class Logger {

    private static supabase: SupabaseClient | undefined = undefined;

    public static async log(type: LogType, value: string): Promise<void> {
        const supabase = this.getSupabaseInstance();

        const response = await supabase
            .from("logs")
            .insert([{ type, value }]);

        console.log(response);
    }

    private static getSupabaseInstance() {
        if (!this.supabase) {
            this.supabase = createClientClient();
        }

        return this.supabase;
    }
}