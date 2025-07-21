"use client";

import { Button } from "@/components/button/button.component";
import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProjects";
import { useSpreadsheet } from "@/hooks/useSpreadsheet";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";

interface Props {
    hideModal: () => void;
}

export const SaveProjectModal = ({ hideModal }: Props) => {
    const router = useRouter();

    const spreadsheet = useSpreadsheet();
    const projects = useProjects();
    const auth = useAuth();

    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (projects.project) {
            setTitle(projects.project.title);
            setText(projects.project.text);
        }
    }, [projects.project]);

    const saveNewProject = async () => {
        setLoading(true);

        const data = spreadsheet.exportData();

        const projectId = await projects.saveProject({
            title,
            text,
            data: JSON.stringify(data),
        });

        setLoading(false);

        if (projectId) {
            router.replace(`/spreadsheet?projectId=${projectId}`);
            hideModal();
        }
    };

    const saveExistingProject = async () => {
        setLoading(true);

        const data = spreadsheet.exportData();

        const projectId = await projects.updateProject({
            id: projects.project.id,
            title,
            text,
            data: JSON.stringify(data),
        });

        setLoading(false);

        if (projectId) {
            router.replace(`/spreadsheet?projectId=${projectId}`);
            hideModal();
        }
    };

    const cloneExistingProject = async () => {
        setLoading(true);

        const data = spreadsheet.exportData();

        const projectId = await projects.saveProject({
            title,
            text,
            data: JSON.stringify(data),
        });

        setLoading(false);

        if (projectId) {
            router.replace(`/spreadsheet?projectId=${projectId}`);
            hideModal();
        }
    };

    const saveProject = async () => {
        if (!projects.project) {
            await saveNewProject();
        } else {
            if (projects.project.user_id === auth.userId) {
                await saveExistingProject();
            } else {
                await cloneExistingProject();
            }
        }
    };

    const modalHeading = useMemo(() => {
        if (!projects.project) return "Create project";
        if (projects.project.user_id === auth.userId) return "Update project";
        return "Clone project";
    }, [projects.project, auth.userId]);

    const modalText = useMemo(() => {
        if (!projects.project) return "Create a new project.";
        if (projects.project.user_id === auth.userId)
            return "Update your existing project.";
        return "Clone this existing project.";
    }, [projects.project, auth.userId]);

    const modalButton = useMemo(() => {
        if (!projects.project) return "Create project";
        if (projects.project.user_id === auth.userId) return "Update project";
        return "Clone project";
    }, [projects.project, auth.userId]);

    return (
        <Container>
            <Heading>{modalHeading}</Heading>

            <Spacing />

            <Text>{modalText}</Text>

            <Spacing />
            <Spacing />

            <TextField
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Project name..."
            />

            <Spacing />

            <TextArea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Description..."
                rows={6}
            />

            <Spacing />
            <Spacing />

            <Button
                variant="primary"
                onClick={saveProject}
                stretch
                loading={loading}
            >
                {modalButton}
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

const TextField = styled.input`
    color: var(--text-1);
    font-size: 12px;
    font-weight: 400;

    width: 100%;

    border-radius: 10px;
    border: 1px solid rgba(0, 0, 0, 0.1);

    outline: none;

    padding: 10px;

    background-color: rgba(0, 0, 0, 0.05);

    &::placeholder {
        font-weight: 400;
    }
`;

const TextArea = styled.textarea`
    color: var(--text-1);
    font-size: 12px;
    font-weight: 400;

    width: 100%;

    border-radius: 10px;
    border: 1px solid rgba(0, 0, 0, 0.1);

    outline: none;
    resize: none;

    padding: 10px;

    background-color: rgba(0, 0, 0, 0.05);

    &::placeholder {
        font-weight: 400;
    }
`;
