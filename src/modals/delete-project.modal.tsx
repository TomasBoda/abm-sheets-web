"use client";

import { Button } from "@/components/button/button.component";
import { useProjects } from "@/hooks/useProjects";
import { useSpreadsheet } from "@/hooks/useSpreadsheet";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styled from "styled-components";

interface DeleteProjectModalProps {
    projectId: string;
    hideModal: () => void;
}

export const DeleteProjectModal = ({
    projectId,
    hideModal,
}: DeleteProjectModalProps) => {
    const router = useRouter();

    const spreadsheet = useSpreadsheet();
    const projects = useProjects();

    const [loading, setLoading] = useState(false);

    const deleteProject = async () => {
        setLoading(true);

        const success = await projects.deleteProject(projectId);

        setLoading(false);

        if (success) {
            hideModal();

            if (projectId === projects.project.id) {
                spreadsheet.clear();
                router.replace("/spreadsheet");
            }
        }
    };

    return (
        <Container>
            <Heading>Delete project</Heading>

            <Spacing />

            <Text>
                Are you sure you want to delete this project? This action cannot
                be undone.
            </Text>

            <Spacing />
            <Spacing />

            <Button
                variant="primary"
                onClick={deleteProject}
                stretch
                loading={loading}
            >
                Delete
            </Button>
        </Container>
    );
};

const Container = styled.div`
    width: 100%;

    display: flex;
    flex-direction: column;

    padding: 20px;
    border-radius: 10px;
    border: 1px solid var(--bg-3);

    background-color: var(--bg-0);

    * {
        font-family: "Poppins", sans-serif;
        font-weight: 400;
        font-style: normal;
    }
`;

const Heading = styled.div`
    color: var(--text-1);
    font-size: 18px;
    font-weight: 600;
`;

const Text = styled.div`
    color: var(--text-1);
    font-size: 13px;
    line-height: 150%;

    opacity: 0.5;
`;

const Spacing = styled.div`
    height: 10px;
`;
