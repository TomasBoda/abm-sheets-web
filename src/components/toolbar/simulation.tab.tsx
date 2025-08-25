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
import { Logger } from "@/utils/logger";
import { useSessionId } from "@/hooks/useSessionId";

export const SimulationTab = () => {
    const stepper = useStepper();
    const { sessionId } = useSessionId();

    const [delay, setDelay] = useState<number>(100);
    const [isPlaying, setIsPlaying] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [stepFieldValue, setStepFieldValue] = useState<number>(
        DEFAULT_STEP + 1,
    );

    const prevStep = () => {
        Logger.log(
            sessionId,
            "toolbar-stepper-previous",
            `${stepper.step + 1}/${stepper.steps}`,
        );
        stepper.setStep((prev) => Math.max(0, prev - 1));
    };

    const nextStep = () => {
        Logger.log(
            sessionId,
            "toolbar-stepper-next",
            `${stepper.step + 1}/${stepper.steps}`,
        );
        stepper.setStep((prev) => Math.min(prev + 1, stepper.steps - 1));
    };

    const onResetClick = () => {
        stepper.reset();
    };

    const onPlayClick = () => {
        stepper.setStep(0);
        setIsPlaying(true);
    };

    const onStopClick = () => {
        setIsPlaying(false);
    };

    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = setInterval(() => {
                stepper.setStep((prev) =>
                    Math.min(prev + 1, stepper.steps - 1),
                );
            }, delay);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isPlaying, delay, stepper.steps]);

    useEffect(() => {
        if (isPlaying && stepper.step >= stepper.steps - 1) {
            setIsPlaying(false);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }
    }, [stepper.step, stepper.steps, isPlaying]);

    useEffect(() => {
        setStepFieldValue(stepper.step + 1);
    }, [stepper.step]);

    const handleStepsInput = (value: string) => {
        if (/^[0-9]*$/.test(value)) {
            setStepFieldValue(Number(value));
        }
    };

    const confirmStep = () => {
        const newStep = Number(stepFieldValue);

        if (newStep === 0) {
            stepper.setStep(0);
            setStepFieldValue(1);
        } else if (newStep > stepper.steps) {
            stepper.setStep(stepper.steps - 1);
            setStepFieldValue(stepper.steps);
        } else {
            stepper.setStep(newStep - 1);
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
                value={stepper.steps.toString()}
                onChange={(value) =>
                    value === ""
                        ? stepper.setSteps(0)
                        : stepper.setSteps(parseInt(value))
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
