"use client"

import { Button } from "@/components/button/button.component"
import { Logo } from "@/components/logo"
import styled from "styled-components"

export const LandingScreen = () => {

    return (
        <Container>
            <Content>
                <View>
                    <Logo variant="light" />

                    <Spacing />
                    <Spacing />
                    <Spacing />
                    <Spacing />

                    <H1>
                        Spreadsheet, <Green>supercharged</Green>
                        <br />
                        with built-in discrete time<Green>.</Green>
                    </H1>
                    
                    <Spacing />
                    <Spacing />

                    <P1>
                        A powerful spreadsheet interface with built-in discrete time
                        <br />
                        for modeling complex, multi-dimensional simulations.
                    </P1>

                    <Spacing />
                    <Spacing />
                    <Spacing />

                    <ButtonPanel>
                        <Button variant="primary" href="/spreadsheet">
                            Get started
                        </Button>

                        <Button variant="secondary" href="/about">
                            Learn more
                        </Button>
                    </ButtonPanel>

                    <Image src="/preview.png" alt="preview" />
                </View>
            </Content>
        </Container>
    )
}

const Container = styled.div`
    width: 100vw;

    display: flex;
    flex-direction: column;
    align-items: center;

    background-color: rgba(0, 0, 0, 0.05);

    * {
        font-family: "Poppins", sans-serif;
        font-weight: 400;
        font-style: normal;
    }
`;

const Content = styled.div`
    width: 100%;
    max-width: 1600px;

    display: flex;
    flex-direction: column;
`;

const View = styled.div`
    width: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;

    padding: 100px;
`;

const H1 = styled.h1`
    color: var(--text-1);
    font-size: 50px;
    font-weight: 600;
    line-height: 120%;
    text-align: center;
`;

const P1 = styled.p`
    color: var(--text-1);
    font-size: 20px;
    font-weight: 300;
    line-height: 150%;
    text-align: center;
    opacity: 0.6;
`;

const Spacing = styled.div`
    height: 10px;
`;

const ButtonPanel = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
`;

const Green = styled.span`
    color: var(--color-2);
    font: inherit;
`;

const Image = styled.img`
    width: 100%;
    margin-top: 75px;
    border-radius: 10px;
`;