"use client";

import { useModal } from "@/hooks/useModal";
import { useProjects } from "@/hooks/useProjects";
import { DeleteProjectModal } from "@/modals/delete-project.modal";
import { ExternalLink, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import { useSidebar } from "../hooks/useSidebar";
import { StatusIcon } from "./status-icon";

export const ProjectsSidebar = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const modal = useModal();
    const sidebar = useSidebar();
    const projects = useProjects();

    const openProject = (id: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("projectId", id);
        router.replace(`?${params.toString()}`);
        sidebar.toggle("projects");
    };

    const deleteProject = async (projectId: string) => {
        modal.showModal(({ hideModal }) => (
            <DeleteProjectModal hideModal={hideModal} projectId={projectId} />
        ));
    };

    return (
        <Container>
            <Heading>Projects</Heading>
            <Text>Browse through your projects.</Text>

            {projects.projects.length > 0 ? (
                <ProjectList>
                    <ProjectWrapper>
                        {projects.projects.map(({ id, title, text }) => (
                            <Project
                                onClick={() => openProject(id)}
                                $selected={id === searchParams.get("projectId")}
                                key={id}
                            >
                                <StatusIcon
                                    type={
                                        projects.project?.id === id
                                            ? "success"
                                            : "info"
                                    }
                                />

                                <Title
                                    $selected={
                                        id === searchParams.get("projectId")
                                    }
                                >
                                    {title}
                                </Title>
                                <Description
                                    $selected={
                                        id === searchParams.get("projectId")
                                    }
                                >
                                    {text}
                                </Description>

                                <IconContainer>
                                    <ExternalLink color="black" size={16} />
                                </IconContainer>

                                <IconContainer
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        deleteProject(id);
                                    }}
                                >
                                    <Trash2 color="black" size={16} />
                                </IconContainer>
                            </Project>
                        ))}
                    </ProjectWrapper>
                </ProjectList>
            ) : (
                <P1Panel>No projects</P1Panel>
            )}
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: flex-start;

    padding: 25px;
`;

const Heading = styled.h2`
    color: black;
    font-size: 22px;
    font-weight: 700;
    line-height: 100%;

    margin-bottom: 10px;
`;

const Text = styled.div`
    color: black;
    font-size: 14px;
    font-weight: 400;
    line-height: 150%;
    opacity: 0.6;

    margin-bottom: 15px;
`;
const ProjectList = styled.div`
    width: 100%;
    height: 100%;

    overflow: auto;

    &::-webkit-scrollbar {
        display: none;
    }
`;

const ProjectWrapper = styled.div`
    width: 100%;

    display: flex;
    flex-direction: column;
`;

const Project = styled.div<{ $selected: boolean }>`
    width: 100%;

    display: grid;
    grid-template-columns: auto 150px 1fr auto auto;
    align-items: center;
    gap: 15px;

    padding: 10px;
    border-bottom: 1px solid rgb(220, 220, 220);

    cursor: pointer;
    transition: all 150ms;

    &:hover {
        background-color: rgba(0, 0, 0, 0.03);
    }
`;

const Title = styled.div<{ $selected: boolean }>`
    color: var(--text-1);
    font-size: 14px;
    font-weight: 600;
    line-height: 100%;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Description = styled.div<{ $selected: boolean }>`
    color: var(--text-);
    font-size: 12px;
    font-weight: 400;
    line-height: 100%;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const IconContainer = styled.div`
    cursor: pointer;
`;

const P1Panel = styled(Text)`
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;
