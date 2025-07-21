import styled from "styled-components";

interface Props {
    id?: string;
    value?: string;
    onChange?: (value: string) => void;
    onKeyDown?: (event: any) => void;
    placeholder?: string;
    disabled?: boolean;
}

export const TextField = ({
    id,
    value,
    onChange,
    onKeyDown,
    placeholder = "Enter text",
    disabled = false,
}: Props) => {
    return (
        <Input
            id={id}
            type="text"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
        />
    );
};

const Input = styled.input`
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
