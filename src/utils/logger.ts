
export type LogType =
    | "click-tab"
    | "click-step"
    | "click-reset"
    | "click-cell"
    | "input"

export class Logger {

    public static async log(type: LogType, value: string): Promise<void> {
        const request = await fetch("/api/log", {
            method: "POST",
            body: JSON.stringify({ type, value })
        });

        await request.json();
    }
}