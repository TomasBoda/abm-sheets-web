"use client";

import { Href } from "@/components/href";
import { ReactNode } from "react";
import styled from "styled-components";
import { Loader } from "./loader.component";

export type ButtonVariant = "primary" | "secondary";

interface ButtonProps {
    children?: ReactNode;
    variant: ButtonVariant;
    onClick?: () => void;
    icon?: ReactNode;
    href?: string;
    stretch?: boolean;
    loading?: boolean;
    disabled?: boolean;
}

export const Button = ({
    children,
    variant,
    disabled = false,
    onClick,
    icon,
    href,
    stretch,
    loading = false,
}: ButtonProps) => {
    return (
        <Href
            href={disabled ? null : href}
            style={stretch && { width: "100%" }}
        >
            <Container
                onClick={disabled || loading ? null : onClick}
                $disabled={disabled}
                style={stretch && { width: "100%" }}
                $variant={variant}
            >
                <Content style={{ opacity: loading ? "0" : "1" }}>
                    {icon ?? null}
                    {children ?? null}
                </Content>

                <Loading style={{ opacity: loading ? "1" : "0" }}>
                    <Loader />
                </Loading>
            </Container>
        </Href>
    );
};

const Container = styled.div<{ $variant: ButtonVariant; $disabled: boolean }>`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    position: relative;

    padding: 10px 20px;

    font-size: 12px;
    font-weight: 400;
    text-align: center;

    border-radius: 10px;
    border: 1px solid transparent;

    cursor: pointer;

    & * {
        cursor: pointer;
    }

    transition: all 150ms;

    white-space: nowrap;

    ${({ $variant }) =>
        $variant === "primary" &&
        `
        color: white;
        background-color: var(--color-1);
        border-color: var(--color-2);

        &:hover {
            background-color: var(--color-2);
        }
    `};

    ${({ $variant }) =>
        $variant === "secondary" &&
        `
        color: black;
        background-color: var(--bg-3);
        border-color: var(--bg-4);

        &:hover {
            background-color: var(--bg-5);
            border-color: var(--bg-6);
        }
    `};

    ${({ $disabled, $variant }) =>
        $disabled &&
        `
         opacity: 0.5;
         cursor: not-allowed;

        & * {
            cursor: not-allowed;
        }

        &:hover {
            background-color: ${$variant === "primary" && "var(--color-1)"};
            background-color: ${$variant === "secondary" && "var(--bg-3)"};

            border-color: ${$variant === "secondary" && "var(--bg-3)"};
        }
    `};
`;

const Content = styled.p`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;

    cursor: pointer;
`;

const Loading = styled.div`
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;
