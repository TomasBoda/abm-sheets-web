"use client"

import { Button } from "@/components/button/button.component";
import { Href } from "@/components/href";
import { Logo } from "@/components/logo";
import { createClientClient } from "@/utils/supabase/client";
import { useRouter } from "next/router";
import { useState } from "react";
import styled from "styled-components";

export const SignUpScreen = () => {

    const router = useRouter();

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const signUp = async () => {
        const supabase = createClientClient();

        if (email.trim() === "" || password.trim() === "") {
            alert("Fields cannot be empty");
            return;
        }

        setLoading(true);

        const response = await supabase.auth.signUp({ email, password });

        if (response.error) {
            setLoading(false);
            alert("ERROR: " + response.error.message);
            return;
        }

        await supabase.auth.setSession(response.data.session);
        router.push("/spreadsheet");
    }

    return (
        <Container>
            <Logo variant="light" />

            <Spacing />
            <Spacing />
            <Spacing />

            <Card>
                <H1>
                    Get started
                </H1>

                <Spacing />

                <P1>
                    Create a free account.
                </P1>

                <Spacing />
                <Spacing />

                <TextField
                    type="text"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter e-mail"
                />

                <Spacing />

                <TextField
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                />

                <Spacing />
                <Spacing />

                <Button stretch onClick={signUp} loading={loading}>
                    Sign up
                </Button>

                <Spacing />
                <Spacing />

                <P1>
                    Already have an account? <Href href="/auth/sign-in"><Link>Sign in</Link></Href>
                </P1>
            </Card>
        </Container>
    )
}

const Container = styled.div`
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    padding: 50px;

    background-color: rgba(0, 0, 0, 0.05);
`;

const Card = styled.div`
    width: 100%;
    max-width: 400px;

    display: flex;
    flex-direction: column;
    align-items: flex-start;

    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 10px;

    padding: 30px;
    background-color: white;
`;

const H1 = styled.h1`
    color: var(--text-1);
    font-size: 26px;
    font-weight: 700;
    line-height: 120%;
`;

const P1 = styled.p`
    color: var(--text-1);
    font-size: 13px;
    font-weight: 400;
    line-height: 150%;
    opacity: 0.5;
`;

const Spacing = styled.div`
    height: 10px;
`;

const TextField = styled.input`
    color: var(--text-1);
    font-size: 12px;
    font-weight: 500;

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

const Link = styled.span`
    text-decoration: underline;
`;