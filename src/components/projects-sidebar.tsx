"use client"

import { useProjects } from "@/hooks/useProjects";
import { useSpreadsheet } from "@/hooks/useSpreadsheet";
import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import { useSidebar } from "./sidebar.provider";

export const ProjectsSidebar = () => {

    const { toggle } = useSidebar();
    const { projects } = useProjects();
    const spreadsheet = useSpreadsheet();

    const router = useRouter();
    const searchParams = useSearchParams();

    const openProject = (id: string, data: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("projectId", id);

        router.replace(`?${params.toString()}`);

        spreadsheet.clear();
    }

    return (
        <Container>
            <H1>
                Projects
                <X
                    onClick={() => toggle()}
                    color="rgba(0, 0, 0, 0.4)"
                    size={16}
                    style={{ cursor: "pointer" }}
                />
            </H1>

            <Spacing />

            <P1>
                Browse through your projects
            </P1>

            <Spacing />
            <Spacing />
            <Spacing />

            {projects.length > 0 ? (
                <ProjectList>
                    <ProjectWrapper>
                        {projects.map(({ id, title, text, data }) => (
                            <Project onClick={() => openProject(id, data)} $selected={id === searchParams.get("projectId")} key={id}>
                                <Title $selected={id === searchParams.get("projectId")}>{title}</Title>
                                <Text $selected={id === searchParams.get("projectId")}>{text}</Text>

                                <Actions>
                                    <Button>
                                        Open
                                    </Button>

                                    <Button>
                                        Delete
                                    </Button>
                                </Actions>
                            </Project>
                        ))}
                    </ProjectWrapper>
                </ProjectList>
            ) : (
                <P1Panel>
                    No projects
                </P1Panel>
            )}
        </Container>
    )
}

const Container = styled.div`
    flex: 1;

    display: flex;
    flex-direction: column;
    align-items: flex-start;

    padding: 30px;

    transition: right 300ms;

    background-color: white;

    * {
        font-family: "Poppins", sans-serif;
        font-weight: 400;
        font-style: normal;
    }
`;

const H1 = styled.h1`
    color: var(--text-1);
    font-size: 22px;
    font-weight: 600;
    line-height: 120%;

    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
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

const ProjectList = styled.div`
    width: 100%;
    height: 100%;
    
    overflow: auto;
`;

const ProjectWrapper = styled.div`
    width: 100%;

    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const Project = styled.div<{ $selected: boolean; }>`
    width: 100%;

    display: flex;
    flex-direction: column;
    gap: 10px;

    padding: 15px;

    border-radius: 5px;

    background-color: var(--bg-0);
    border: 1px solid var(--bg-2);

    cursor: pointer;
    transition: all 100ms;

    &:hover {
        background-color: var(--bg-1);
    }

    background-color: ${({ $selected }) => $selected && "var(--color-2)"};
    border-color: ${({ $selected }) => $selected && "var(--color-2)"};

    &:hover {
        background-color: ${({ $selected }) => $selected && "var(--color-2)"};
    }
`;

const Title = styled.div<{ $selected: boolean; }>`
    color: var(--text-1);
    font-size: 14px;
    font-weight: 600;
    line-height: 100%;

    color: ${({ $selected }) => $selected && "white"};
`;

const Text = styled.div<{ $selected: boolean; }>`
    color: var(--text-);
    font-size: 12px;
    font-weight: 300;
    line-height: 150%;

    color: ${({ $selected }) => $selected && "rgba(255, 255, 255, 0.5)"};
`;

const Actions = styled.div`
    width: 100%;

    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
`;

const Button = styled.div`
    color: white;
    font-size: 11px;
    font-weight: 400;

    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 5px;

    cursor: pointer;

    padding: 5px 12px;
    border-radius: 5px;

    border: 1px solid var(--color-2);

    background-color: var(--color-1);

    transition: all 100ms;

    &:hover {
        background-color: var(--color-2);
    }
`;

const P1Panel = styled(P1)`
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;