import { MutableRefObject, useEffect, useState } from "react";

interface UseSpreadsheetSizeProps {
    toolbarRef: MutableRefObject<HTMLDivElement>;
}

interface SpreadsheetSize {
    width: number;
    height: number;
}

export const useSpreadsheetSize = ({ toolbarRef }: UseSpreadsheetSizeProps) => {
    const [size, setSize] = useState<SpreadsheetSize>({ width: 0, height: 0 });

    useEffect(() => {
        if (!toolbarRef.current) {
            return;
        }

        const handleResize = () => {
            const toolbarHeight = toolbarRef.current.clientHeight;
            const contentWidth = window.innerWidth;
            const contentHeight = window.innerHeight - toolbarHeight;

            setSize({ width: contentWidth, height: contentHeight });
        };

        handleResize();

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, [toolbarRef]);

    return { size };
};
