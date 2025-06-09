"use client"

import styled from "styled-components";
import AboutDocument from "./about.document.mdx";

export const AboutScreen = () => {

    return <AboutDocument />;
}

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
`;