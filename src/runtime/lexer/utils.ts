export namespace LexerUtils {
    export const isAlpha = (value: string): boolean => {
        return /^[A-Za-z]+$/.test(value);
    };

    export const isNumber = (value: string): boolean => {
        const symbol = value.charCodeAt(0);
        const bounds = {
            lower: "0".charCodeAt(0),
            upper: "9".charCodeAt(0),
        };

        return symbol >= bounds.lower && symbol <= bounds.upper;
    };

    export const isSkippable = (value: string): boolean => {
        return value === " ";
    };
}
