"use client";

import styled from "styled-components";
import AboutDocument from "./about.document.mdx";

export const AboutScreen = () => {
    return <AboutDocument />;
};

export const Container = styled.div`
    width: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;
`;

export const Content = styled.div`
    width: 100%;
    max-width: 800px;

    display: flex;
    flex-direction: column;

    padding: 50px;
`;

export const Video = styled.video`
    width: 100%;
    border-radius: 5px;
    margin-bottom: 15px;
`;

export const Image = styled.img`
    width: 100%;
    border-radius: 5px;
    border: 1px solid var(--bg-1);
`;

export const Highlight = styled.div`
    display: inline-block;

    padding: 25px;
    padding-top: 10px;
    padding-bottom: 10px;

    margin: 20px 0px;

    border-radius: 5px;

    background-color: rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.1);
`;

export const H2WithID = styled.h2<{ $border?: boolean }>`
    color: var(--text-1);
    font-size: 22px;
    font-weight: 700;

    margin: 15px 0px;

    ${({ $border = true }) =>
        $border &&
        `
            padding-bottom: 10px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.15);
        `}
`;

export const H3WithID = styled.h3`
    color: var(--text-1);
    font-size: 18px;
    font-weight: 700;

    margin: 15px 0px;
`;

export const SmallText = styled.span`
    & * {
        font-size: 14px;
    }
`;
