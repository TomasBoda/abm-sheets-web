"use client";

"use client";

import styled, { keyframes } from "styled-components";

const rotation = keyframes`
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
`;

export const Loader = styled.div`
    width: 16px;
    height: 16px;

    display: inline-block;

    border: 1.5px solid var(--bg-0);

    border-bottom-color: transparent;
    border-radius: 50%;

    animation: ${rotation} 1s linear infinite;
`;
