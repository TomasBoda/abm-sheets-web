import { MutableRefObject, useEffect, useState } from "react";

interface UseSpreadsheetSizeProps {
    toolbarRef: MutableRefObject<HTMLDivElement>;
}

interface SpreadsheetSize {
    width: number;
    height: number;
}

// hook that calculates the size of the spreadsheet container (in pixels)
export const useSpreadsheetSize = ({ toolbarRef }: UseSpreadsheetSizeProps) => {
    const [size, setSize] = useState<SpreadsheetSize>({ width: 0, height: 0 });

    useEffect(() => {
        if (!toolbarRef.current) {
            return;
        }

        // update spreadsheet container size on window resize
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
