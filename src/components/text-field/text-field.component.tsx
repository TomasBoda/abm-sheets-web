import styled from "styled-components";

interface TextFieldProps {
    size?: "small" | "large";
    id?: string;
    value?: string;
    onChange?: (value: string) => void;
    onKeyDown?: (event: any) => void;
    placeholder?: string;
    disabled?: boolean;
    onBlur?: () => void;
}

export const TextField = ({
    size = "large",
    id,
    value,
    onChange,
    onKeyDown,
    placeholder = "Enter text",
    disabled = false,
    onBlur,
}: TextFieldProps) => {
    if (size === "small") {
        return (
            <InputSmall
                id={id}
                type="text"
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                autoComplete="off"
                onBlur={onBlur}
            />
        );
    }

    return (
        <InputLarge
            id={id}
            type="text"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
            onBlur={onBlur}
        />
    );
};

const InputLarge = styled.input`
    width: 100%;

    color: var(--text-1);
    font-size: 12px;
    font-weight: 400;
    line-height: 100%;
    letter-spacing: 1px;

    padding: 8px;

    border: 1px solid var(--bg-3);
    border-radius: 7px;

    outline: none;
    transition: all 100ms;

    background-color: var(--bg-1);

    &:disabled {
        cursor: not-allowed;
    }

    &:focus {
        border-color: var(--bg-5);
    }
`;

const InputSmall = styled.input`
    color: white;
    font-size: 11px;
    font-weight: 400;

    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 5px;

    outline: none;
    border: 1px solid var(--color-2);

    padding: 5px 12px;
    border-radius: 5px;

    background-color: var(--color-1);

    width: 100%;
    max-width: 150px;
`;
