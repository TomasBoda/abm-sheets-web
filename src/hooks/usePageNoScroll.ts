"use client";

import { useEffect } from "react";

/**
 * Hook that prevents the page from scrolling
 */
export const usePageNoScroll = () => {
    useEffect(() => {
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = original;
        };
    }, []);
};
