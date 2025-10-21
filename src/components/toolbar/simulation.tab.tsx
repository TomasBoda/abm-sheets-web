import { useSessionId } from "@/hooks/useSessionId";
import { useStepper } from "@/hooks/useStepper";
import { Logger } from "@/utils/logger";
import {
    ChevronLeft,
    ChevronRight,
    Play,
    RotateCcw,
    Square,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import {
    DEFAULT_STEP,
    DEFAULT_STEPS,
} from "../spreadsheet/spreadsheet.constants";
import { TextField } from "../text-field/text-field.component";
import {
    TabContainer,
    ToolbarButton,
    ToolbarDivider,
} from "./toolbar.component";

export const SimulationTab = () => {
    const stepper = useStepper();
    const { sessionId } = useSessionId();

    const [delay, setDelay] = useState<number>(100);
    const [isPlaying, setIsPlaying] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const [stepFieldValue, setStepFieldValue] = useState<number>(
        DEFAULT_STEP + 1,
    );
    const [stepsFieldValue, setStepsFieldValue] =
        useState<number>(DEFAULT_STEPS);

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

    useEffect(() => {
        setStepsFieldValue(stepper.steps);
    }, [stepper.steps]);

    const onStepInputChange = (value: string) => {
        if (/^[0-9]*$/.test(value)) {
            setStepFieldValue(Number(value));
        }
    };

    const onStepsInputChange = (value: string) => {
        if (/^[0-9]*$/.test(value)) {
            setStepsFieldValue(Number(value));
        }
    };

    const onStepInputBlur = () => {
        if (stepFieldValue === 0) {
            stepper.setStep(0);
        } else if (stepFieldValue > stepsFieldValue) {
            stepper.setStep(stepper.steps - 1);
        } else {
            stepper.setStep(stepFieldValue - 1);
        }
    };

    const onStepsInputBlur = () => {
        if (stepsFieldValue === 0) {
            stepper.setSteps(1);
        } else {
            stepper.setSteps(stepsFieldValue);
        }

        if (stepFieldValue > stepsFieldValue) {
            stepper.setStep(stepsFieldValue - 1);
        }
    };

    const onStepInputKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (event.key === "Enter") {
            onStepInputBlur();
        }
    };

    const onStepsInputKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (event.key === "Enter") {
            onStepsInputBlur();
        }
    };

    return (
        <TabContainer>
            <Stepper>
                <ToolbarButton onClick={prevStep}>
                    <ChevronLeft size={12} />
                </ToolbarButton>

                <TextField
                    size="small"
                    value={stepFieldValue.toString()}
                    disabled={false}
                    onChange={onStepInputChange}
                    onBlur={onStepInputBlur}
                    onKeyDown={onStepInputKeyDown}
                />

                <ToolbarButton onClick={nextStep}>
                    <ChevronRight size={12} />
                </ToolbarButton>
            </Stepper>

            <ToolbarDivider />

            <TextField
                size="small"
                value={stepsFieldValue.toString()}
                onChange={onStepsInputChange}
                onBlur={onStepsInputBlur}
                onKeyDown={onStepsInputKeyDown}
                placeholder="Steps"
            />

            <ToolbarDivider />

            <ToolbarButton onClick={onResetClick}>
                <RotateCcw size={10} />
                Reset
            </ToolbarButton>

            <ToolbarDivider />

            <TextField
                size="small"
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
