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
}
