import { PointValue, CategoricalCoord } from "@/runtime/runtime";

export namespace Utils {
    export const download = (data: any, filename?: string): void => {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = filename + ".json";

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
    };

    export const getRoundedNumber = (value: number, decimals = 5) => {
        if (Math.round(value) === value) {
            return Math.round(value);
        }

        for (let i = 1; i <= decimals; i++) {
            if (parseFloat(value.toFixed(i)) === value) {
                return Number(value.toFixed(i));
            }
        }

        return Number(value.toFixed(decimals));
    };

    export const roundCategoricalPoint = (value: CategoricalCoord) => {
        if (typeof value[0] === "number") {
            return [
                getRoundedNumber(value[0]),
                value[1] as string,
            ] as CategoricalCoord;
        }
        return [
            value[0] as string,
            getRoundedNumber(value[1] as number),
        ] as CategoricalCoord;
    };

    export const handlePointValue = (value: PointValue) => {
        let x: string | CategoricalCoord;
        let y: string | CategoricalCoord;
        if (typeof value.value.x === "number") {
            x = Utils.getRoundedNumber(value.value.x).toLocaleString("en-US");
        } else {
            x = roundCategoricalPoint(value.value.x);
        }

        if (typeof value.value.y === "number") {
            y = Utils.getRoundedNumber(value.value.y).toLocaleString("en-US");
        } else {
            y = roundCategoricalPoint(value.value.y);
        }

        return { x, y };
    };
}
