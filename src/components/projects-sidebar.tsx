"use client"

import { useEffect } from "react";
import styled from "styled-components";

export const openProjectsSidebar = () => {
    const sidebar = document.getElementById("sidebar")!;
    const overlay = document.getElementById("overlay")!;

    sidebar.style.left = "0px";
    overlay.style.display = "flex";
    overlay.style.opacity = "1";
}

export const closeProjectsSidebar = () => {
    const sidebar = document.getElementById("sidebar")!;
    const overlay = document.getElementById("overlay")!;

    sidebar.style.left = "-400px";
    overlay.style.opacity = "0";

    setTimeout(() => {
        overlay.style.display = "none";
    }, 300);
}

export const ProjectsSidebar = () => {

    return (
        <>
            <Container id="sidebar">
                <Content>
                    <H1>
                        Projects
                    </H1>

                    <Spacing />

                    <P1>
                        Browse through your saved projects.
                    </P1>
                </Content>
            </Container>

            <Overlay id="overlay" onClick={closeProjectsSidebar} />
        </>
    )
}

const Container = styled.div`
    width: 400px;
    height: 100vh;

    position: fixed;
    top: 0px;
    left: -400px;

    transition: left 300ms;

    background-color: white;

    z-index: 800;

    * {
        font-family: "Poppins", sans-serif;
        font-weight: 400;
        font-style: normal;
    }
`;

const Content = styled.div`
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: flex-start;

    padding: 30px;

    background-color: rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.05);
`;

const Overlay = styled.div`
    width: 100vw;
    height: 100vh;

    position: fixed;
    top: 0px;
    left: 0px;

    background-color: rgba(0, 0, 0, 0.3);

    transition: opacity 300ms;

    z-index: 799;

    opacity: 0;
    display: none;
`;

const H1 = styled.h1`
    color: var(--text-1);
    font-size: 22px;
    font-weight: 600;
    line-height: 120%;
`;

const P1 = styled.p`
    color: var(--text-1);
    font-size: 14px;
    font-weight: 300;
    line-height: 150%;
    opacity: 0.6;
`;

const Spacing = styled.div`
    height: 10px;
`;