// helper hook that manages local storage
export const useLocalStorage = () => {
    // save an item to local storage
    const set = (key: string, value: any) => {
        localStorage.setItem(key, JSON.stringify(value));
    };

    // retrieve an item from local storage
    const get = (key: string) => {
        const value = localStorage.getItem(key);
        if (!value) return undefined;
        return JSON.parse(value);
    };

    return { get, set };
};
