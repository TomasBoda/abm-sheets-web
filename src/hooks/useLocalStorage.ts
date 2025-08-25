export const useLocalStorage = () => {
    const set = (key: string, value: any) => {
        localStorage.setItem(key, JSON.stringify(value));
    };

    const get = (key: string) => {
        const value = localStorage.getItem(key);
        if (!value) return undefined;
        return JSON.parse(value);
    };

    return { get, set };
};
