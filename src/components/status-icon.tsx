import {
    CircleCheck,
    CircleX,
    Info,
    Loader,
    TriangleAlert,
} from "lucide-react";

const DEFAULT_ICON_SIZE = 16;

type StatusType = "success" | "warning" | "error" | "info" | "progress";

interface StatusIconsProps {
    type: StatusType;
    size?: number;
}

export const StatusIcon = ({
    type,
    size = DEFAULT_ICON_SIZE,
}: StatusIconsProps) => {
    switch (type) {
        case "success":
            return (
                <CircleCheck
                    color="var(--success-text)"
                    fill="var(--success-bg)"
                    size={size}
                />
            );
        case "warning":
            return (
                <TriangleAlert
                    color="var(--warning-text)"
                    fill="var(--warning-bg)"
                    size={size}
                />
            );
        case "error":
            return (
                <CircleX
                    color="var(--error-text)"
                    fill="var(--error-bg)"
                    size={size}
                />
            );
        case "info":
            return (
                <Info
                    color="var(--info-text)"
                    fill="var(--info-bg)"
                    size={size}
                />
            );
        case "progress":
            return (
                <Loader
                    color="var(--progress-text)"
                    fill="var(--progress-bg)"
                    size={size}
                />
            );
    }
};
