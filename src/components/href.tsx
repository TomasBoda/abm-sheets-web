"use client";

import Link from "next/link";
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
        <Link
            href={href}
            passHref
            target={newTab ? "blank" : undefined}
            style={{ all: "unset", cursor: "pointer", display: "contents" }}
        >
            {children}
        </Link>
    );
};
