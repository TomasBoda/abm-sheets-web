"use client"

import { Button } from "@/components/button/button.component";
import { createClientClient } from "@/utils/supabase/client";
import { useState } from "react";
import styled from "styled-components";

interface Props {
    hideModal: () => void;
}

export const SaveProjectModal = ({ hideModal }: Props) => {

    const [label, setLabel] = useState("");
    const [loading, setLoading] = useState(false);

    const saveProject = async () => {
        setLoading(true);

        const supabase = createClientClient();
        const user = await supabase.auth.getUser();

        const response = await supabase
            .from("projects")
            .insert([{
                title: label.trim(),
                data: { message: "Hello, World!" },
                user_id: user.data.user.id
            }]);

        setLoading(false);

        if (!response.error) {
            hideModal();
        }
    }

    return (
        <Container>
            <Heading>
                Save project
            </Heading>

            <Spacing />

            <Text>
                Save your project for later use.
            </Text>

            <Spacing />
            <Spacing />

            <TextField
                type="text"
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="Project name..."
            />

            <Spacing />
            <Spacing />

            <Button variant="primary" onClick={saveProject} stretch loading={loading}>
                Save project
            </Button>
        </Container>
    )
}

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