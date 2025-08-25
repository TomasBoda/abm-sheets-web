"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface Props {
    href?: string;
    children: ReactNode;
    style?: any;
    newTab?: boolean;
}

export const Href = ({ href, children, style, newTab = false }: Props) => {
    const pathname = usePathname();

    if (!href) {
        return <>{children}</>;
    }

    if (!href || pathname === href) {
        return <span style={{ ...style, cursor: "pointer" }}>{children}</span>;
    }

    return (
        <a
            href={href}
            target={newTab ? "blank" : undefined}
            style={{ all: "unset", cursor: "pointer", display: "contents" }}
        >
            {children}
        </a>
    );
};
