"use client";

import { Button } from "@/components/button/button.component";
import { X } from "lucide-react";
import { useState } from "react";
import styled from "styled-components";

const steps = [
    {
        title: "Built-in Time",
        text: [
            "ABM Sheets provides a built-in, step-wise time. You can step through time steps using arrow keys in the toolbar.",
            "This means that the cell formulas are reclaculated in each time step. For instance, if you define B2's formula as = RAND() and you step through time, you can observe that the value changes in each time step.",
        ],
        video: "/onboarding-01.mp4",
    },
    {
        title: "Self-reference",
        text: [
            "Thanks to the notion of time, a cell can reference itself in its formula, calculating its new value based on its previous value. However, when self-referencing, you need to define the cell's initial value as a starting point in the first step.",
            "Below is a showcase of a simple counter starting at 1 and incrementing by 1 in each new time step. If we didn't provide the initial value, a cyclic dependency would be detected and the cell could not be calculated.",
        ],
        video: "/onboarding-02.mp4",
    },
];

interface OnboardingModalProps {
    setActive: (active: boolean) => void;
    hideModal: () => void;
}

export const OnboardingModal = ({
    setActive,
    hideModal,
}: OnboardingModalProps) => {
    const [step, setStep] = useState(0);

    const nextStep = () => {
        if (step === steps.length - 1) {
            setActive(false);
            hideModal();

            return;
        }

        setStep((prev) => Math.min(steps.length - 1, prev + 1));
    };

    const prevStep = () => {
        setStep((prev) => Math.max(0, prev - 1));
    };

    return (
        <Container>
            <HeadingContainer>
                <Heading key={`heading-${step}`}>{steps[step].title}</Heading>
                <X
                    size={16}
                    onClick={hideModal}
                    style={{ cursor: "pointer" }}
                />
            </HeadingContainer>

            <Spacing />

            {steps[step].text.map((text, index) => (
                <span key={`text-${step}-${index}`}>
                    <Text>{text}</Text>
                    <Spacing />
                </span>
            ))}

            <Spacing />
            <Spacing />

            <Video autoPlay muted playsInline loop key={`video-step-${step}`}>
                <source src={steps[step].video} type="video/mp4"></source>
            </Video>

            <Spacing />
            <Spacing />

            <ButtonContainer>
                <Button
                    variant="secondary"
                    stretch
                    onClick={prevStep}
                    disabled={step === 0}
                >
                    Previous
                </Button>

                <Button variant="primary" stretch onClick={nextStep}>
                    {step === steps.length - 1 ? "Get started" : "Next"}
                </Button>
            </ButtonContainer>
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

const HeadingContainer = styled.div`
    width: 100%;

    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
`;

const Heading = styled.div`
    color: var(--text-1);
    font-size: 20px;
    font-weight: 600;
`;

const Text = styled.div`
    color: var(--text-1);
    font-size: 14px;
    font-weight: 400;
    line-height: 150%;

    opacity: 0.65;
`;

const Spacing = styled.div`
    height: 10px;
`;

const ButtonContainer = styled.div`
    width: 100%;

    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
`;

const Video = styled.video`
    width: 100%;
    border-radius: 10px;
`;
