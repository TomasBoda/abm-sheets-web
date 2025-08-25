import { useStepper } from "@/hooks/useStepper";
import {
    ChevronLeft,
    ChevronRight,
    Play,
    RotateCcw,
    Square,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { DEFAULT_STEP } from "../spreadsheet/spreadsheet.constants";
import { TextFieldSmall } from "../text-field-small";
import {
    TabContainer,
    ToolbarButton,
    ToolbarDivider,
} from "./toolbar.component";

export const SimulationTab = () => {
    const { step, setStep, steps, setSteps, reset } = useStepper();

    const [delay, setDelay] = useState<number>(100);
    const [isPlaying, setIsPlaying] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [stepFieldValue, setStepFieldValue] = useState<number>(
        DEFAULT_STEP + 1,
    );

    const prevStep = () => {
        setStep((prev) => Math.max(0, prev - 1));
    };

    const nextStep = () => {
        setStep((prev) => Math.min(prev + 1, steps - 1));
    };

    const onResetClick = () => {
        reset();
    };

    const onPlayClick = () => {
        setStep(0);
        setIsPlaying(true);
    };

    const onStopClick = () => {
        setIsPlaying(false);
    };

    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = setInterval(() => {
                setStep((prev) => Math.min(prev + 1, steps - 1));
            }, delay);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isPlaying, delay, steps]);

    useEffect(() => {
        if (isPlaying && step >= steps - 1) {
            setIsPlaying(false);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }
    }, [step, steps, isPlaying]);

    useEffect(() => {
        setStepFieldValue(step + 1);
    }, [step]);

    const handleStepsInput = (value: string) => {
        if (/^[0-9]*$/.test(value)) {
            setStepFieldValue(Number(value));
        }
    };

    const confirmStep = () => {
        const newStep = Number(stepFieldValue);

        if (newStep === 0) {
            setStep(0);
            setStepFieldValue(1);
        } else if (newStep > steps) {
            setStep(steps - 1);
            setStepFieldValue(steps);
        } else {
            setStep(newStep - 1);
        }
    };

    const onHandleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            confirmStep();
        }
    };

    return (
        <TabContainer>
            <Stepper>
                <ToolbarButton onClick={prevStep}>
                    <ChevronLeft size={12} />
                </ToolbarButton>

                <TextFieldSmall
                    value={stepFieldValue.toString()}
                    disabled={false}
                    onChange={(newValue) => handleStepsInput(newValue)}
                    onBlur={confirmStep}
                    onKeyDown={onHandleKeyDown}
                />

                <ToolbarButton onClick={nextStep}>
                    <ChevronRight size={12} />
                </ToolbarButton>
            </Stepper>

            <ToolbarDivider />

            <TextFieldSmall
                value={steps.toString()}
                onChange={(value) =>
                    value === "" ? setSteps(0) : setSteps(parseInt(value))
                }
                placeholder="Steps"
            />

            <ToolbarDivider />

            <ToolbarButton onClick={onResetClick}>
                <RotateCcw size={10} />
                Reset
            </ToolbarButton>

            <ToolbarDivider />

            <TextFieldSmall
                value={delay.toString()}
                onChange={(value) =>
                    value === "" ? setDelay(0) : setDelay(parseInt(value))
                }
                placeholder="Delay"
            />

            <ToolbarDivider />

            {isPlaying ? (
                <ToolbarButton onClick={onStopClick}>
                    <Square size={10} />
                    Stop
                </ToolbarButton>
            ) : (
                <ToolbarButton onClick={onPlayClick}>
                    <Play size={10} />
                    Play
                </ToolbarButton>
            )}
        </TabContainer>
    );
};

const Stepper = styled.div`
    display: grid;
    grid-template-columns: auto 60px auto;
    gap: 10px;
`;
