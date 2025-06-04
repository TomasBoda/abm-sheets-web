import { Logger } from "@/utils/logger";
import { ReactNode, useEffect, useState } from "react";
import styled from "styled-components";
import { Logo } from "../logo";

export interface Tab {
    label: string;
    component: ReactNode;
}

interface Props {
    tabs?: Tab[];
    rightContent?: ReactNode;
}

export const Tabs = ({ tabs = [], rightContent }: Props) => {

    const [current, setCurrent] = useState<number>(0);

    useEffect(() => {
        const tabElement = document.getElementById(`tab-${current}`);
        const backgroundElement = document.getElementById("background");

        if (!tabElement || !backgroundElement) {
            return;
        }

        backgroundElement.style.left = tabElement.getBoundingClientRect().left + "px";
        backgroundElement.style.top = tabElement.getBoundingClientRect().top + "px";
        backgroundElement.style.width = tabElement.clientWidth + "px";
        backgroundElement.style.height = tabElement.clientHeight + "px";
    }, [current]);

    const onTabClick = (index: number) => {
        setCurrent(index);
        Logger.log("click-tab", tabs[index].label);
    }

    return (
        <Container>
            <Header>
                <LogoContainer>
                    <Logo variant="dark" />
                </LogoContainer>

                {tabs.map((tab, index) => (
                    <Tab onClick={() => onTabClick(index)} key={index}>
                        <TabLabel id={`tab-${index}`}>
                            {tab.label}
                        </TabLabel>
                    </Tab>
                ))}

                <Background id="background" />

                <div style={{ flex: 1 }} />

                {rightContent && (
                    <RightContent>
                        {rightContent}
                    </RightContent>
                )}
            </Header>

            <Content>
                {tabs[current]?.component}
            </Content>
        </Container>
    )
}

const Container = styled.div`
    width: 100%;
`;

const Header = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;

    padding: 3px;
    padding: 10px;

    position: relative;

    border-bottom: 1.3px solid var(--color-1);
`;

const LogoContainer = styled.div`
    margin-left: 10px;
    margin-right: 30px;
`;

const RightContent = styled.div`
    margin-right: 10px;
`;

const Tab = styled.div`
    padding: 3px;

    cursor: pointer;

    z-index: 3;
`;

const TabLabel = styled.div`
    color: var(--text-1);
    color: white;
    font-size: 12px;
    font-weight: 400;

    padding: 6px 8px;
`;

const Background = styled.div`
    position: absolute;

    transition: all 150ms;

    border-radius: 7px;

    background-color: var(--color-1);

    z-index: 2;
`;

const Content = styled.div`
    width: 100%;

    padding: 10px;
`;