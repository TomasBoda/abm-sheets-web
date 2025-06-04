"use client"

import { Grid2x2Plus } from "lucide-react";
import styled from "styled-components";
import { Href } from "./href";

export type LogoVariant = "light" | "dark";

interface Props {
    variant: LogoVariant;
}

export const Logo = ({ variant }: Props) => {

    return (
        <Href href="/">
            <Container $variant={variant}>
                <Grid2x2Plus size={20} color="var(--color-2)" style={{ transform: "translateY(-1px)" }} />
                ABM Sheets
            </Container>
        </Href>
    )
}

const Container = styled.div<{ $variant: LogoVariant; }>`
    font-size: 16px;
    font-weight: 500;
    line-height: 100%;

    color: ${({ $variant }) => $variant === "light" && "var(--text-1)"};
    color: ${({ $variant }) => $variant === "dark" && "var(--bg-1)"};

    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;

    cursor: pointer;
`;