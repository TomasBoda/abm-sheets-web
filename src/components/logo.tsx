"use client";

import { Atom } from "lucide-react";
import styled from "styled-components";
import { Href } from "./href";

type LogoVariant = "light" | "dark";

interface Props {
    variant: LogoVariant;
}

export const Logo = ({ variant }: Props) => {
    return (
        <Href href="/">
            <Container $variant={variant}>
                <Atom
                    size={20}
                    color={"var(--color-2)"}
                    style={{ transform: "translateY(-0.5px)" }}
                />
                ABM Sheets
            </Container>
        </Href>
    );
};

const Container = styled.div<{ $variant: LogoVariant }>`
    font-family: "Poppins", sans-serif;

    font-size: 16px;
    font-weight: 500 !important;
    line-height: 100%;

    color: ${({ $variant }) => $variant === "light" && "var(--text-1)"};
    color: ${({ $variant }) => $variant === "dark" && "var(--bg-1)"};

    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 7px;

    cursor: pointer;
`;
